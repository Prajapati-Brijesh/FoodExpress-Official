import jwt
from django.conf import settings
from django.http import JsonResponse

class JwtAuthMiddleware:
    """Simple middleware to attach `request.user_id` if a valid JWT is present.
    Expected header: Authorization: Bearer <token>
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                request.user_id = payload.get('user_id')
            except jwt.ExpiredSignatureError:
                return JsonResponse({'status': 'error', 'message': 'Token expired.'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'status': 'error', 'message': 'Invalid token.'}, status=401)
        else:
            request.user_id = None
        response = self.get_response(request)
        return response
