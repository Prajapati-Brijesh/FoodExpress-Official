import os
import pymongo
from bson import ObjectId

MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')
client = pymongo.MongoClient(MONGODB_URI)
db = client['food_express_db']

db.orders.update_one({'_id': ObjectId('69f331ae54ea6d0737aca266')}, {'$set': {'status': 'Ready'}})
print('Order 69f331ae54ea6d0737aca266 is now Ready!')
