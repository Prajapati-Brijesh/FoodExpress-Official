import os
import pymongo
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')
client = pymongo.MongoClient(MONGODB_URI)
db = client['food_express_db']
for o in db.orders.find().sort('_id', -1).limit(5):
    print("ID:", str(o['_id']), "Status:", o.get('status'))
