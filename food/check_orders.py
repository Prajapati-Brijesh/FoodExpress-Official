import pymongo
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['food_express_db']
for o in db.orders.find().sort('_id', -1).limit(5):
    print("ID:", str(o['_id']), "Status:", o.get('status'))
