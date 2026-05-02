import pymongo
from bson import ObjectId

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['food_express_db']

db.orders.update_one({'_id': ObjectId('69f331ae54ea6d0737aca266')}, {'$set': {'status': 'Ready'}})
print('Order 69f331ae54ea6d0737aca266 is now Ready!')
