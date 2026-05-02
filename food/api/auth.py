import hashlib
import jwt
import datetime
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pymongo

# MongoDB connection (reuse existing connection if possible)
try:
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client['food_express_db']
    users_col = db['users']
    # Ensure unique email index
    users_col.create_index('email', unique=True)
except Exception as e:
    print('MongoDB User Connection Error:', e)


def hash_password(password: str) -> str:
    """Hash password using SHA‑256 (for demo; use bcrypt in production)."""
    return hashlib.sha256(password.encode()).hexdigest()


def generate_jwt(user_id: str) -> str:
    """Create a JWT token that expires in 1 day."""
    payload = {
        'user_id': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token if isinstance(token, str) else token.decode('utf-8')


def decode_jwt(token: str):
    """Return the payload if token is valid, otherwise None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except Exception:
        return None


@csrf_exempt
def signup(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        contact = data.get('contact', '').strip()
        if not (name and email and password):
            return JsonResponse({'status': 'error', 'message': 'Name, email, and password required.'}, status=400)
        if users_col.find_one({'email': email}):
            return JsonResponse({'status': 'error', 'message': 'User already exists.'}, status=409)
        user_doc = {
            'name': name,
            'email': email,
            'password': hash_password(password),
            'contact': contact,
        }
        result = users_col.insert_one(user_doc)
        token = generate_jwt(result.inserted_id)
        return JsonResponse({'status': 'success', 'message': 'Account created.', 'token': token})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        if not (email and password):
            return JsonResponse({'status': 'error', 'message': 'Email and password required.'}, status=400)
        user = users_col.find_one({'email': email, 'password': hash_password(password)})
        if not user:
            return JsonResponse({'status': 'error', 'message': 'Invalid credentials.'}, status=401)
        token = generate_jwt(user['_id'])
        return JsonResponse({
            'status': 'success',
            'message': f"Welcome back, {user['name']}!",
            'token': token,
            'user': {
                'name': user['name'],
                'email': user['email'],
                'contact': user.get('contact', ''),
            }
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
