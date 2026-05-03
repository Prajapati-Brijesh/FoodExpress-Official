import os
from django.http import JsonResponse
from bson import json_util, ObjectId
from django.views.decorators.csrf import csrf_exempt
import json
import datetime
import pymongo
import jwt
from django.conf import settings

from .db import db, orders_col as collection


def get_db():
    """Return the shared MongoDB database instance."""
    return db


def _make_admin_jwt():
    """Generate a short-lived JWT for the admin."""
    payload = {
        'role': 'admin',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=12),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def _verify_admin_jwt(request):
    """Return True if the request carries a valid admin JWT."""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return False
    token = auth.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload.get('role') == 'admin'
    except jwt.PyJWTError:
        return False


@csrf_exempt
def admin_login(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Only POST allowed"}, status=405)

    data = json.loads(request.body)
    username = data.get("username", "")
    password = data.get("password", "")

    if username == "admin" and password == "food123":
        token = _make_admin_jwt()
        return JsonResponse({"status": "success", "token": token})
    else:
        return JsonResponse({"status": "error", "message": "Wrong username or password!"}, status=401)


@csrf_exempt
def get_orders(request):
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Only GET allowed"}, status=405)

    if not _verify_admin_jwt(request):
        return JsonResponse({"status": "error", "message": "Unauthorized Access"}, status=401)

    try:
        orders = list(collection.find().sort('_id', -1))
        orders_json = json.loads(json_util.dumps(orders))

        # Compute dynamic stats
        today = datetime.datetime.utcnow().date().isoformat()
        today_orders = [o for o in orders if o.get('date', '').startswith(today)]
        today_revenue = sum(o.get('totalAmount', 0) for o in today_orders)
        active_count = len([o for o in orders if o.get('status') not in ('Delivered', 'Cancelled')])

        return JsonResponse({
            "status": "success",
            "data": orders_json,
            "stats": {
                "todayOrders": len(today_orders),
                "todayRevenue": today_revenue,
                "activeOrders": active_count,
                "totalOrders": len(orders),
            }
        })
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)}, status=500)


@csrf_exempt
def update_order_status(request):
    """Update status of a single order. Admin only."""
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Only POST allowed"}, status=405)

    if not _verify_admin_jwt(request):
        return JsonResponse({"status": "error", "message": "Unauthorized Access"}, status=401)

    try:
        data = json.loads(request.body)
        order_id = data.get("orderId")
        new_status = data.get("status")

        if not order_id or not new_status:
            return JsonResponse({"status": "error", "message": "orderId and status required"}, status=400)

        valid_statuses = ["New", "Preparing", "Ready", "Delivered", "Cancelled"]
        if new_status not in valid_statuses:
            return JsonResponse({"status": "error", "message": f"Invalid status. Must be one of: {valid_statuses}"}, status=400)

        result = collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": new_status, "updatedAt": datetime.datetime.utcnow().isoformat()}}
        )

        if result.matched_count == 0:
            return JsonResponse({"status": "error", "message": "Order not found"}, status=404)

        return JsonResponse({"status": "success", "message": f"Order status updated to {new_status}"})
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)}, status=500)


@csrf_exempt
def save_to_mongo(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Only POST requests allowed"}, status=405)

    try:
        data = json.loads(request.body)

        # Attach user_id if JWT middleware decoded it
        user_id = getattr(request, 'user_id', None)
        if user_id:
            data['userId'] = user_id

        result = collection.insert_one(data)
        return JsonResponse({
            "status": "success", 
            "message": "Order saved successfully!",
            "orderId": str(result.inserted_id)
        })
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)}, status=400)

@csrf_exempt
def cancel_order_public(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        order_id = data.get("orderId")
        reason = data.get("reason", "No reason provided")
        
        if not order_id:
            return JsonResponse({"status": "error", "message": "orderId required"}, status=400)

        result = collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {
                "status": "Cancelled", 
                "cancelReason": reason,
                "updatedAt": datetime.datetime.utcnow().isoformat()
            }}
        )

        if result.matched_count == 0:
            return JsonResponse({"status": "error", "message": "Order not found"}, status=404)

        return JsonResponse({"status": "success", "message": "Order cancelled successfully!"})
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)}, status=500)

@csrf_exempt
def get_order_status_public(request, order_id):
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Only GET allowed"}, status=405)
    
    try:
        order = collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            return JsonResponse({"status": "error", "message": "Order not found"}, status=404)
        
        return JsonResponse({
            "status": "success", 
            "orderStatus": order.get("status", "New"),
            "driverName": order.get("driverName"),
            "driverPhone": order.get("driverPhone")
        })
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)}, status=500)
