from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from bson import ObjectId
from datetime import datetime, timedelta
import jwt
from django.conf import settings
from .views import _verify_admin_jwt as _check_jwt, get_db

def _verify_admin_jwt(request):
    """Returns a JsonResponse error if not admin, else None."""
    if not _check_jwt(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
    return None

def _make_partner_jwt(restaurant_id):
    """Generate a short-lived JWT for a partner."""
    payload = {
        'role': 'partner',
        'restaurantId': str(restaurant_id),
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def _verify_partner_jwt(request):
    """Verifies partner JWT and returns the restaurantId if valid, else None."""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        if payload.get('role') == 'partner':
            return payload.get('restaurantId')
    except:
        pass
    return None
def _make_driver_jwt(driver_id):
    payload = {
        'role': 'driver',
        'driverId': str(driver_id),
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def _verify_driver_jwt(request):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        if payload.get('role') == 'driver':
            return payload.get('driverId')
    except:
        pass
    return None

# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────
def _oid(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# ─────────────────────────────────────────
# RESTAURANT APIS (ADMIN)
# ─────────────────────────────────────────

@csrf_exempt
def admin_get_restaurants(request):
    err = _verify_admin_jwt(request)
    if err: return err
    db = get_db()
    docs = [_oid(r) for r in db.restaurants.find()]
    return JsonResponse({'status': 'success', 'data': docs})


@csrf_exempt
@require_http_methods(['POST'])
def admin_add_restaurant(request):
    err = _verify_admin_jwt(request)
    if err: return err
    db = get_db()
    body = json.loads(request.body)
    doc = {
        'name':        body.get('name', ''),
        'address':     body.get('address', ''),
        'phone':       body.get('phone', ''),
        'logo':        body.get('logo', ''),
        'banner':      body.get('banner', ''),
        'cuisine':     body.get('cuisine', 'Multi-cuisine'),
        'rating':      float(body.get('rating', 4.0)),
        'deliveryTime':int(body.get('deliveryTime', 30)),
        'minOrder':    int(body.get('minOrder', 100)),
        'timing':      body.get('timing', '9 AM - 10 PM'),
        'isActive':    True,
        'createdAt':   datetime.utcnow().isoformat(),
        'menu':        [],
    }
    result = db.restaurants.insert_one(doc)
    doc['_id'] = str(result.inserted_id)
    return JsonResponse({'status': 'success', 'data': doc})


@csrf_exempt
@require_http_methods(['POST'])
def admin_update_restaurant(request):
    err = _verify_admin_jwt(request)
    if err: return err
    db = get_db()
    body = json.loads(request.body)
    rid = body.pop('_id', None)
    if not rid:
        return JsonResponse({'status': 'error', 'message': 'ID required'}, status=400)
    db.restaurants.update_one({'_id': ObjectId(rid)}, {'$set': body})
    return JsonResponse({'status': 'success'})


@csrf_exempt
@require_http_methods(['POST'])
def admin_delete_restaurant(request):
    err = _verify_admin_jwt(request)
    if err: return err
    db = get_db()
    body = json.loads(request.body)
    rid = body.get('_id')
    db.restaurants.delete_one({'_id': ObjectId(rid)})
    return JsonResponse({'status': 'success'})


@csrf_exempt
@require_http_methods(['POST'])
def admin_restaurant_add_item(request):
    """Add a menu item to a specific restaurant."""
    err = _verify_admin_jwt(request)
    if err: return err
    db = get_db()
    body = json.loads(request.body)
    rid = body.get('restaurantId')
    item = {
        'id':       str(ObjectId()),
        'name':     body.get('name', ''),
        'price':    int(body.get('price', 0)),
        'img':      body.get('img', ''),
        'category': body.get('category', 'Main Course'),
        'isAvailable': True,
    }
    db.restaurants.update_one({'_id': ObjectId(rid)}, {'$push': {'menu': item}})
    return JsonResponse({'status': 'success', 'data': item})


@csrf_exempt
@require_http_methods(['POST'])
def admin_restaurant_delete_item(request):
    err = _verify_admin_jwt(request)
    if err: return err
    db = get_db()
    body = json.loads(request.body)
    rid  = body.get('restaurantId')
    item_id = body.get('itemId')
    db.restaurants.update_one(
        {'_id': ObjectId(rid)},
        {'$pull': {'menu': {'id': item_id}}}
    )
    return JsonResponse({'status': 'success'})


# ─────────────────────────────────────────
# PUBLIC RESTAURANT APIS (Food Uber)
# ─────────────────────────────────────────

@csrf_exempt
def public_get_restaurants(request):
    """Fetch all active restaurants, optionally filtered by city."""
    db = get_db()
    city = request.GET.get('city')
    query = {'isActive': True}
    if city:
        query['city'] = {'$regex': city, '$options': 'i'}
    
    restaurants = list(db.restaurants.find(query).sort('_id', -1))
    return JsonResponse({'status': 'success', 'data': [_oid(r) for r in restaurants]})


@csrf_exempt
def public_get_restaurant_detail(request, restaurant_id):
    db = get_db()
    try:
        r = db.restaurants.find_one({'_id': ObjectId(restaurant_id)})
        if not r:
            return JsonResponse({'status': 'error', 'message': 'Not found'}, status=404)
        return JsonResponse({'status': 'success', 'data': _oid(r)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


# ─────────────────────────────────────────
# DELIVERY PARTNER APIS
# ─────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
def delivery_register(request):
    """Public — rider self-registration."""
    db = get_db()
    body = json.loads(request.body)
    doc = {
        'name':        body.get('name', ''),
        'phone':       body.get('phone', ''),
        'email':       body.get('email', ''),
        'city':        body.get('city', ''),
        'vehicleType': body.get('vehicleType', 'Bike'),
        'licenseNo':   body.get('licenseNo', ''),
        'aadharNo':    body.get('aadharNo', ''),
        'photo':       body.get('photo', ''),
        'password':    body.get('password', '1234'), # User-set PIN
        'status':      'Pending',
        'registeredAt': datetime.utcnow().isoformat(),
        'rating':      0,
        'deliveries':  0,
        'isOnline':    False,
        'lastOnline':  None,
        'totalMinutesWorked': 0,
    }
    # Prevent duplicate phone
    existing = db.delivery_partners.find_one({'phone': doc['phone']})
    if existing:
        return JsonResponse({'status': 'error', 'message': 'Phone already registered'}, status=400)
    result = db.delivery_partners.insert_one(doc)
    # Generate a readable Delivery ID: FE-XXXXXX (last 6 chars of ObjectId)
    delivery_id = 'FE-' + str(result.inserted_id)[-6:].upper()
    db.delivery_partners.update_one({'_id': result.inserted_id}, {'$set': {'deliveryId': delivery_id}})
    return JsonResponse({'status': 'success', 'message': 'Application submitted! Admin will review it shortly.', 'deliveryId': delivery_id})


@csrf_exempt
def admin_get_delivery(request):
    err = _verify_admin_jwt(request)
    if err: return err
    db = get_db()
    docs = [_oid(d) for d in db.delivery_partners.find()]
    return JsonResponse({'status': 'success', 'data': docs})


@csrf_exempt
@require_http_methods(['POST'])
def admin_update_delivery(request):
    err = _verify_admin_jwt(request)
    if err: return err
    db = get_db()
    body = json.loads(request.body)
    did = body.get('_id')
    status = body.get('status')   # Active | Inactive | Pending | Rejected
    db.delivery_partners.update_one({'_id': ObjectId(did)}, {'$set': {'status': status}})
    return JsonResponse({'status': 'success'})

@csrf_exempt
@require_http_methods(['POST'])
def delivery_login(request):
    db = get_db()
    body = json.loads(request.body)
    phone = body.get('phone')
    password = body.get('password')

    driver = db.delivery_partners.find_one({'phone': phone, 'password': password})
    if not driver:
        return JsonResponse({'status': 'error', 'message': 'Invalid phone or PIN'}, status=401)
    if driver.get('status') != 'Active':
        return JsonResponse({'status': 'error', 'message': f'Your account is {driver.get("status")}'}, status=403)

    token = _make_driver_jwt(driver['_id'])
    return JsonResponse({'status': 'success', 'token': token, 'driver': _oid(driver)})

@csrf_exempt
def delivery_dashboard(request):
    did = _verify_driver_jwt(request)
    if not did:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    db = get_db()
    driver = db.delivery_partners.find_one({'_id': ObjectId(did)})
    
    # Active order assigned to this driver
    active_order = db.orders.find_one({'driverId': did, 'status': {'$in': ['Out for Delivery', 'Nearby']}})
    
    # Available orders (Ready, not assigned)
    available_orders = []
    if not active_order and driver.get('isOnline'):
        available_orders = list(db.orders.find({'status': 'Ready', 'driverId': {'$exists': False}}).sort('_id', -1))

    return JsonResponse({
        'status': 'success',
        'driver': _oid(driver),
        'activeOrder': _oid(active_order) if active_order else None,
        'availableOrders': [_oid(o) for o in available_orders]
    })

@csrf_exempt
@require_http_methods(['POST'])
def delivery_duty(request):
    did = _verify_driver_jwt(request)
    if not did:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    db = get_db()
    body = json.loads(request.body)
    is_online = body.get('isOnline', False)

    driver = db.delivery_partners.find_one({'_id': ObjectId(did)})
    updates = {'isOnline': is_online}

    if is_online:
        updates['lastOnline'] = datetime.utcnow().isoformat()
    else:
        # Going offline: calculate minutes
        last = driver.get('lastOnline')
        if last:
            try:
                start_time = datetime.fromisoformat(last)
                diff = (datetime.utcnow() - start_time).total_seconds() / 60.0
                updates['totalMinutesWorked'] = driver.get('totalMinutesWorked', 0) + int(diff)
            except:
                pass
        updates['lastOnline'] = None

    db.delivery_partners.update_one({'_id': ObjectId(did)}, {'$set': updates})
    return JsonResponse({'status': 'success', 'isOnline': is_online})

@csrf_exempt
@require_http_methods(['POST'])
def delivery_accept_order(request):
    did = _verify_driver_jwt(request)
    if not did:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    db = get_db()
    body = json.loads(request.body)
    oid = body.get('orderId')

    driver = db.delivery_partners.find_one({'_id': ObjectId(did)})
    if not driver.get('isOnline'):
        return JsonResponse({'status': 'error', 'message': 'Go online first'}, status=400)

    # Check if driver already has an active order
    existing = db.orders.find_one({'driverId': did, 'status': {'$in': ['Out for Delivery', 'Nearby']}})
    if existing:
        return JsonResponse({'status': 'error', 'message': 'You already have an active order'}, status=400)

    result = db.orders.update_one(
        {'_id': ObjectId(oid), 'status': 'Ready', 'driverId': {'$exists': False}},
        {'$set': {
            'status': 'Out for Delivery',
            'driverId': did,
            'driverName': driver.get('name'),
            'driverPhone': driver.get('phone')
        }}
    )

    if result.modified_count == 0:
        return JsonResponse({'status': 'error', 'message': 'Order no longer available'}, status=400)

    return JsonResponse({'status': 'success'})

@csrf_exempt
@require_http_methods(['POST'])
def delivery_deliver_order(request):
    did = _verify_driver_jwt(request)
    if not did:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    db = get_db()
    body = json.loads(request.body)
    oid = body.get('orderId')

    result = db.orders.update_one(
        {'_id': ObjectId(oid), 'driverId': did},
        {'$set': {'status': 'Delivered', 'deliveredAt': datetime.utcnow().isoformat()}}
    )

    if result.modified_count > 0:
        db.delivery_partners.update_one({'_id': ObjectId(did)}, {'$inc': {'deliveries': 1}})

    return JsonResponse({'status': 'success'})


# ─────────────────────────────────────────
# PUBLIC — RESTAURANT PARTNER SELF-REGISTRATION
# ─────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
def partner_register(request):
    """Public — restaurant owner self-registers. Stored as pending for admin approval."""
    db = get_db()
    body = json.loads(request.body)
    existing = db.restaurants.find_one({'phone': body.get('phone'), 'status': 'Pending'})
    if existing:
        return JsonResponse({'status': 'error', 'message': 'Application already submitted with this phone number'}, status=400)
    doc = {
        'name':         body.get('name', ''),
        'ownerName':    body.get('ownerName', ''),
        'email':        body.get('email', ''),
        'phone':        body.get('phone', ''),
        'address':      body.get('address', ''),
        'city':         body.get('city', ''),
        'cuisine':      body.get('cuisine', 'Multi-cuisine'),
        'timing':       body.get('timing', '9 AM - 10 PM'),
        'logo':         body.get('logo', ''),
        'banner':       body.get('banner', ''),
        'fssaiNo':      body.get('fssaiNo', ''),
        'gstNo':        body.get('gstNo', ''),
        'deliveryTime': 30,
        'minOrder':     100,
        'rating':       4.0,
        'isActive':     False,
        'status':       'Pending',
        'password':     body.get('password', body.get('phone', '123456')), # Default to phone if missing
        'menu':         [],
        'registeredAt': datetime.utcnow().isoformat(),
    }
    db.restaurants.insert_one(doc)
    return JsonResponse({'status': 'success', 'message': 'Application submitted! Our team will review and contact you within 24 hours.'})


# ─────────────────────────────────────────
# PARTNER DASHBOARD APIS
# ─────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
def partner_login(request):
    """Authenticate a restaurant partner."""
    db = get_db()
    body = json.loads(request.body)
    email = body.get('email')
    password = body.get('password')

    partner = db.restaurants.find_one({'email': email, 'password': password})
    if not partner:
        return JsonResponse({'status': 'error', 'message': 'Invalid email or password'}, status=401)
    
    if partner.get('status') != 'Approved':
        return JsonResponse({'status': 'error', 'message': f"Your account status is: {partner.get('status')}"}, status=403)

    token = _make_partner_jwt(partner['_id'])
    return JsonResponse({
        'status': 'success',
        'token': token,
        'restaurant': _oid(partner)
    })

@csrf_exempt
def partner_get_orders(request):
    """Fetch orders specific to the logged-in partner."""
    rid = _verify_partner_jwt(request)
    if not rid:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
    
    db = get_db()
    # Filter orders by restaurantId
    orders = list(db.orders.find({'restaurantId': rid}).sort('_id', -1))
    return JsonResponse({'status': 'success', 'data': [_oid(o) for o in orders]})

@csrf_exempt
@require_http_methods(['POST'])
def partner_update_order(request):
    """Update status of an order for a partner's restaurant."""
    rid = _verify_partner_jwt(request)
    if not rid:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
    
    db = get_db()
    body = json.loads(request.body)
    oid = body.get('orderId')
    status = body.get('status') # e.g. Preparing | Out for Delivery | Delivered

    # Security check: Ensure order belongs to this restaurant
    order = db.orders.find_one({'_id': ObjectId(oid), 'restaurantId': rid})
    if not order:
        return JsonResponse({'status': 'error', 'message': 'Order not found or access denied'}, status=404)

    db.orders.update_one({'_id': ObjectId(oid)}, {'$set': {'status': status}})
    return JsonResponse({'status': 'success'})
