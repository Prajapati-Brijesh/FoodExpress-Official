from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import json_util, ObjectId
import json
import datetime
import pymongo
import jwt
from django.conf import settings

from .db import (
    orders_col,
    users_col,
    menu_col,
    coupons_col,
    notifications_col as notifs_col,
    settings_col
)


# ─────────────────────────────────────────────
# Auth helper
# ─────────────────────────────────────────────
def _verify_admin(request):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return False
    token = auth.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload.get('role') == 'admin'
    except jwt.PyJWTError:
        return False


def _unauth():
    return JsonResponse({"status": "error", "message": "Unauthorized"}, status=401)


# ─────────────────────────────────────────────
# STATS Overview
# ─────────────────────────────────────────────
@csrf_exempt
def admin_stats(request):
    if not _verify_admin(request):
        return _unauth()
    try:
        total_orders   = orders_col.count_documents({})
        total_users    = users_col.count_documents({})
        total_menu     = menu_col.count_documents({})
        total_coupons  = coupons_col.count_documents({})
        active_orders  = orders_col.count_documents({"status": {"$nin": ["Delivered", "Cancelled"]}})

        today = datetime.datetime.utcnow().date().isoformat()
        today_orders = list(orders_col.find({"date": {"$regex": f"^{today}"}}))
        today_revenue = sum(o.get("totalAmount", 0) for o in today_orders)

        # Last 7 days revenue
        daily_revenue = []
        for i in range(6, -1, -1):
            day = (datetime.datetime.utcnow() - datetime.timedelta(days=i)).date().isoformat()
            day_orders = list(orders_col.find({"date": {"$regex": f"^{day}"}}))
            daily_revenue.append({
                "day": day,
                "revenue": sum(o.get("totalAmount", 0) for o in day_orders),
                "orders": len(day_orders)
            })

        # Recent 5 orders
        recent = list(orders_col.find().sort("_id", -1).limit(5))
        recent_json = json.loads(json_util.dumps(recent))

        return JsonResponse({
            "status": "success",
            "stats": {
                "totalOrders":   total_orders,
                "totalUsers":    total_users,
                "totalMenu":     total_menu,
                "totalCoupons":  total_coupons,
                "activeOrders":  active_orders,
                "todayRevenue":  today_revenue,
                "todayOrders":   len(today_orders),
            },
            "dailyRevenue": daily_revenue,
            "recentOrders": recent_json,
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


# ─────────────────────────────────────────────
# USER Management
# ─────────────────────────────────────────────
@csrf_exempt
def admin_get_users(request):
    if not _verify_admin(request):
        return _unauth()
    try:
        users = list(users_col.find({}, {"password": 0}))
        users_json = json.loads(json_util.dumps(users))

        # Attach order count per user
        for u in users_json:
            uid = u.get("_id", {}).get("$oid", "")
            u["orderCount"] = orders_col.count_documents({"userId": uid})

        return JsonResponse({"status": "success", "data": users_json})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def admin_ban_user(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "POST only"}, status=405)
    if not _verify_admin(request):
        return _unauth()
    try:
        data = json.loads(request.body)
        user_id = data.get("userId")
        ban = data.get("banned", True)
        users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"banned": ban}})
        return JsonResponse({"status": "success", "message": f"User {'banned' if ban else 'unbanned'}"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


# ─────────────────────────────────────────────
# MENU Management
# ─────────────────────────────────────────────
@csrf_exempt
def admin_get_menu(request):
    if not _verify_admin(request):
        return _unauth()
    try:
        items = list(menu_col.find())
        return JsonResponse({"status": "success", "data": json.loads(json_util.dumps(items))})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def admin_add_menu_item(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "POST only"}, status=405)
    if not _verify_admin(request):
        return _unauth()
    try:
        data = json.loads(request.body)
        required = ["name", "price", "category"]
        if not all(data.get(k) for k in required):
            return JsonResponse({"status": "error", "message": "name, price, category required"}, status=400)
        item = {
            "name":     data["name"],
            "price":    float(data["price"]),
            "category": data["category"],
            "img":      data.get("img", ""),
            "available": data.get("available", True),
        }
        result = menu_col.insert_one(item)
        return JsonResponse({"status": "success", "insertedId": str(result.inserted_id)})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def admin_update_menu_item(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "POST only"}, status=405)
    if not _verify_admin(request):
        return _unauth()
    try:
        data = json.loads(request.body)
        item_id = data.pop("_id", None)
        if not item_id:
            return JsonResponse({"status": "error", "message": "_id required"}, status=400)
        if "price" in data:
            data["price"] = float(data["price"])
        menu_col.update_one({"_id": ObjectId(item_id)}, {"$set": data})
        return JsonResponse({"status": "success", "message": "Menu item updated"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def admin_delete_menu_item(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "POST only"}, status=405)
    if not _verify_admin(request):
        return _unauth()
    try:
        data = json.loads(request.body)
        item_id = data.get("_id")
        menu_col.delete_one({"_id": ObjectId(item_id)})
        return JsonResponse({"status": "success", "message": "Item deleted"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


# ─────────────────────────────────────────────
# COUPONS Management
# ─────────────────────────────────────────────
@csrf_exempt
def admin_get_coupons(request):
    if not _verify_admin(request):
        return _unauth()
    try:
        coupons = list(coupons_col.find())
        return JsonResponse({"status": "success", "data": json.loads(json_util.dumps(coupons))})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def admin_add_coupon(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "POST only"}, status=405)
    if not _verify_admin(request):
        return _unauth()
    try:
        data = json.loads(request.body)
        code = data.get("code", "").upper().strip()
        discount = data.get("discount", 0)
        if not code or not discount:
            return JsonResponse({"status": "error", "message": "code and discount required"}, status=400)
        if coupons_col.find_one({"code": code}):
            return JsonResponse({"status": "error", "message": "Coupon code already exists"}, status=409)
        coupon = {
            "code":      code,
            "discount":  float(discount),
            "type":      data.get("type", "percent"),   # percent | flat
            "minOrder":  float(data.get("minOrder", 0)),
            "expiry":    data.get("expiry", ""),
            "active":    True,
            "createdAt": datetime.datetime.utcnow().isoformat(),
        }
        result = coupons_col.insert_one(coupon)
        return JsonResponse({"status": "success", "insertedId": str(result.inserted_id)})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def admin_delete_coupon(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "POST only"}, status=405)
    if not _verify_admin(request):
        return _unauth()
    try:
        data = json.loads(request.body)
        coupons_col.delete_one({"_id": ObjectId(data.get("_id"))})
        return JsonResponse({"status": "success", "message": "Coupon deleted"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


# ─────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────
@csrf_exempt
def admin_send_notification(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "POST only"}, status=405)
    if not _verify_admin(request):
        return _unauth()
    try:
        data = json.loads(request.body)
        title = data.get("title", "").strip()
        message = data.get("message", "").strip()
        if not title or not message:
            return JsonResponse({"status": "error", "message": "title and message required"}, status=400)
        notif = {
            "title":   title,
            "message": message,
            "target":  data.get("target", "all"),  # all | users | vendors
            "sentAt":  datetime.datetime.utcnow().isoformat(),
        }
        notifs_col.insert_one(notif)
        return JsonResponse({"status": "success", "message": "Notification sent!"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def admin_get_notifications(request):
    if not _verify_admin(request):
        return _unauth()
    try:
        notifs = list(notifs_col.find().sort("_id", -1).limit(50))
        return JsonResponse({"status": "success", "data": json.loads(json_util.dumps(notifs))})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


# ─────────────────────────────────────────────
# PLATFORM SETTINGS
# ─────────────────────────────────────────────
@csrf_exempt
def admin_get_settings(request):
    if not _verify_admin(request):
        return _unauth()
    try:
        cfg = settings_col.find_one({}, {"_id": 0})
        if not cfg:
            cfg = {
                "platformFee": 5,
                "deliveryCharge": 30,
                "commission": 10,
                "maintenanceMode": False,
                "minOrderAmount": 100,
                "freeDeliveryAbove": 500,
            }
        return JsonResponse({"status": "success", "data": cfg})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def admin_save_settings(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "POST only"}, status=405)
    if not _verify_admin(request):
        return _unauth()
    try:
        data = json.loads(request.body)
        data.pop("_id", None)
        settings_col.replace_one({}, data, upsert=True)
        return JsonResponse({"status": "success", "message": "Settings saved!"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
