from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from bson import ObjectId
from datetime import datetime
from .views import get_db

@csrf_exempt
def add_review(request):
    """Add a review for a restaurant."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)
    
    db = get_db()
    try:
        body = json.loads(request.body)
        restaurant_id = body.get('restaurantId')
        user_id = body.get('userId')
        rating = body.get('rating')
        comment = body.get('comment')

        if not restaurant_id or not rating:
            return JsonResponse({'status': 'error', 'message': 'Restaurant ID and Rating required'}, status=400)

        review = {
            'restaurantId': restaurant_id,
            'userId': user_id,
            'rating': float(rating),
            'comment': comment,
            'createdAt': datetime.utcnow().isoformat()
        }
        
        db.reviews.insert_one(review)

        # Update average rating of the restaurant
        all_reviews = list(db.reviews.find({'restaurantId': restaurant_id}))
        avg_rating = sum([r['rating'] for r in all_reviews]) / len(all_reviews)
        
        db.restaurants.update_one(
            {'_id': ObjectId(restaurant_id)},
            {'$set': {'rating': round(avg_rating, 1)}}
        )

        return JsonResponse({'status': 'success', 'message': 'Review added!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

def get_reviews(request, restaurant_id):
    """Fetch reviews for a restaurant."""
    db = get_db()
    reviews = list(db.reviews.find({'restaurantId': restaurant_id}).sort('createdAt', -1))
    for r in reviews:
        r['_id'] = str(r['_id'])
    return JsonResponse({'status': 'success', 'data': reviews})
