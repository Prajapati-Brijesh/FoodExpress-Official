import os
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.files.storage import default_storage

@csrf_exempt
def upload_image(request):
    """
    Handle image uploads. Returns the URL of the uploaded image.
    """
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)

    if 'image' not in request.FILES:
        return JsonResponse({'status': 'error', 'message': 'No image provided'}, status=400)

    image = request.FILES['image']
    
    # Validate file type
    ext = os.path.splitext(image.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        return JsonResponse({'status': 'error', 'message': 'Invalid file type. Only JPG, PNG, WEBP allowed.'}, status=400)

    # Generate unique name
    filename = f"{uuid.uuid4()}{ext}"
    
    # Save file
    path = default_storage.save(os.path.join('uploads', filename), image)
    url = f"{settings.MEDIA_URL}{path}"
    
    return JsonResponse({
        'status': 'success',
        'url': url
    })
