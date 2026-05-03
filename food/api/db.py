import os
import pymongo
from django.conf import settings

# MongoDB connection
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')

try:
    client = pymongo.MongoClient(MONGODB_URI)
    db = client['food_express_db']
    
    # Pre-define collections for easy import
    users_col = db['users']
    orders_col = db['orders']
    menu_col = db['menu']
    restaurants_col = db['restaurants']
    delivery_partners_col = db['delivery_partners']
    reviews_col = db['reviews']
    notifications_col = db['notifications']
    settings_col = db['settings']
    coupons_col = db['coupons']

    # Ensure indexes
    users_col.create_index('email', unique=True)
    
    print("Connected to MongoDB successfully")
except Exception as e:
    print('MongoDB Connection Error:', e)
