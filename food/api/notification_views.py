from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
from .views import get_db

@csrf_exempt
def send_notification(request):
    """Store a notification for a user or restaurant."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)
    
    db = get_db()
    try:
        body = json.loads(request.body)
        target_id = body.get('targetId') # userId or restaurantId
        role = body.get('role') # user | partner
        title = body.get('title')
        message = body.get('message')
        type = body.get('type', 'info') # info | order | success | error

        if not target_id or not message:
            return JsonResponse({'status': 'error', 'message': 'Target ID and Message required'}, status=400)

        notif = {
            'targetId': target_id,
            'role': role,
            'title': title,
            'message': message,
            'type': type,
            'isRead': False,
            'createdAt': datetime.utcnow().isoformat()
        }
        
        db.notifications.insert_one(notif)
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

def get_notifications(request):
    """Fetch notifications for a target."""
    target_id = request.GET.get('targetId')
    role = request.GET.get('role')
    if not target_id:
        return JsonResponse({'status': 'error', 'message': 'targetId required'}, status=400)
    
    db = get_db()
    notifs = list(db.notifications.find({'targetId': target_id, 'role': role}).sort('createdAt', -1).limit(20))
    for n in notifs:
        n['_id'] = str(n['_id'])
    return JsonResponse({'status': 'success', 'data': notifs})
