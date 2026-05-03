from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pymongo
from bson import json_util

from .db import menu_col

# Full menu data (same as frontend data.js, seeded once)
MENU_DATA = {
    "Breakfasts": [
        { "name": "Poha", "price": 60, "img": "download (1).jpg", "category": "Breakfasts" },
        { "name": "Upma", "price": 65, "img": "pngtree-artfully-presented-south-indian-breakfast-upma-image_13627359.png", "category": "Breakfasts" },
        { "name": "Idli Sambhar", "price": 70, "img": "images.jpg", "category": "Breakfasts" },
        { "name": "Plain Dosa", "price": 80, "img": "images (3).jpg", "category": "Breakfasts" },
        { "name": "Masala Dosa", "price": 100, "img": "Sweet-Potato-Masala-Dosa-1.jpg", "category": "Breakfasts" },
        { "name": "Medu Vada", "price": 80, "img": "https://maayeka.com/wp-content/uploads/2018/10/vrat-ka-medu-vada-2-2.jpg.webp", "category": "Breakfasts" },
        { "name": "Aloo Paratha", "price": 90, "img": "https://www.kingarthurbaking.com/sites/default/files/styles/featured_image_sm_2x/public/2025-07/Aloo-Paratha-_2025_Lifestyle_H_2435.jpg?itok=K649FPYA", "category": "Breakfasts" },
        { "name": "Puri Sabji", "price": 85, "img": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=300&fit=crop", "category": "Breakfasts" },
        { "name": "Sabudana Khichdi", "price": 75, "img": "https://s3-ap-south-1.amazonaws.com/betterbutterbucket-silver/amrita-shrivastava20190304141957755.jpeg", "category": "Breakfasts" },
        { "name": "Rava Dosa", "price": 105, "img": "https://www.cookwithmanali.com/wp-content/uploads/2020/06/Crispy-Rava-Dosa.jpg", "category": "Breakfasts" },
        { "name": "Uttapam", "price": 95, "img": "https://pipingpotcurry.com/wp-content/uploads/2026/01/Uttapam-Onion-Tomato-PipingPotCurry.jpg", "category": "Breakfasts" },
        { "name": "Pongal", "price": 80, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsFLe9qnwUwmWzH-4Ko87mvipJnptZaUObGA&s", "category": "Breakfasts" },
        { "name": "Gobi Paratha", "price": 95, "img": "https://butfirstchai.com/wp-content/uploads/2021/05/gobi-paratha-raw-recipe.jpg", "category": "Breakfasts" },
        { "name": "Paneer Paratha", "price": 110, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5HjIS8wCWL1H7n7shZmCn03v4uFtmSlWrIg&s", "category": "Breakfasts" },
        { "name": "Appam", "price": 70, "img": "https://www.shutterstock.com/image-photo/appum-appe-appam-mixed-dal-260nw-2048143055.jpg", "category": "Breakfasts" }
    ],
    "Lunch Blast": [
        { "name": "Veg Thali", "price": 150, "img": "https://5.imimg.com/data5/HW/II/SH/SELLER-9770898/veg-thali.jpg", "category": "Lunch Blast" },
        { "name": "Paneer Butter Masala", "price": 180, "img": "https://myfoodstory.com/wp-content/uploads/2021/07/restaurant-style-paneer-butter-masala-2-500x500.jpg", "category": "Lunch Blast" },
        { "name": "Dal Fry", "price": 120, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcstJZiJELJP2PK93FMnlcgeputwTQBNbmgg&s", "category": "Lunch Blast" },
        { "name": "Jeera Rice", "price": 90, "img": "https://www.vegrecipesofindia.com/wp-content/uploads/2025/05/jeera-rice-1.jpg", "category": "Lunch Blast" },
        { "name": "Veg Biryani", "price": 160, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlg7JYWWJNnY-MJVGm02itthRtcc105HPt4Q&s", "category": "Lunch Blast" },
        { "name": "Shahi Paneer", "price": 190, "img": "https://shwetainthekitchen.com/wp-content/uploads/2024/04/shahi-paneer.jpg", "category": "Lunch Blast" },
        { "name": "Dal Makhani", "price": 160, "img": "https://www.cookwithmanali.com/wp-content/uploads/2019/04/Restaurant-Style-Dal-Makhani-500x500.jpg", "category": "Lunch Blast" },
        { "name": "Mix Veg", "price": 140, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQYoHNzlYtz0OtwFSqfJnpiFMKEsVtsw20qw&s", "category": "Lunch Blast" },
        { "name": "Aloo Gobi", "price": 120, "img": "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/aloo-gobi-recipe.jpg", "category": "Lunch Blast" },
        { "name": "Chana Masala", "price": 130, "img": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chana-masala-fb809bc.jpg?quality=90&resize=440,400", "category": "Lunch Blast" },
        { "name": "Matar Paneer", "price": 165, "img": "https://static.toiimg.com/thumb/53251884.cms?imgsize=530171&width=800&height=800", "category": "Lunch Blast" },
        { "name": "Kaju Curry", "price": 200, "img": "https://www.kajubadam.com/wp-content/uploads/2023/01/kaju-curry-recipe.jpg", "category": "Lunch Blast" },
        { "name": "Roti", "price": 20, "img": "https://www.cookwithmanali.com/wp-content/uploads/2021/07/Tandoori-Roti-500x500.jpg", "category": "Lunch Blast" },
        { "name": "Butter Naan", "price": 40, "img": "https://t3.ftcdn.net/jpg/08/95/50/04/360_F_895500474_IDUMxbOGEBn29tyPyjG8oLEEWlK8ZlOg.jpg", "category": "Lunch Blast" },
        { "name": "Papad", "price": 30, "img": "https://upload.wikimedia.org/wikipedia/commons/0/09/Roasted_Papad_-_Howrah_2013-11-02_4068.jpg", "category": "Lunch Blast" }
    ],
    "Chinese": [
        { "name": "Veg Noodles", "price": 140, "img": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop", "category": "Chinese" },
        { "name": "Veg Fried Rice", "price": 150, "img": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", "category": "Chinese" },
        { "name": "Veg Manchurian", "price": 160, "img": "https://holycowvegan.net/wp-content/uploads/2020/03/veg-manchurian-7.jpg", "category": "Chinese" },
        { "name": "Spring Roll", "price": 120, "img": "https://hot-thai-kitchen.com/wp-content/uploads/2014/10/crispy-spring-rolls-sq-new.jpg", "category": "Chinese" },
        { "name": "Chilli Paneer", "price": 180, "img": "https://madmirchi.com/wp-content/uploads/2025/03/chilli-paneer-starter-recipe1.jpg", "category": "Chinese" },
        { "name": "Hakka Noodles", "price": 150, "img": "https://mariasmenu.com/wp-content/uploads/Veg-Hakka-Noodles.png", "category": "Chinese" },
        { "name": "Schezwan Noodles", "price": 160, "img": "https://spiceindiaonline.com/wp-content/uploads/2018/10/Schezwan-Noodles-1.jpg", "category": "Chinese" },
        { "name": "Manchow Soup", "price": 110, "img": "https://sinfullyspicy.com/wp-content/uploads/2023/12/1200-by-1200-images-1.jpg", "category": "Chinese" },
        { "name": "Gobi Manchurian", "price": 150, "img": "https://www.indianveggiedelight.com/wp-content/uploads/2017/06/gobi-manchurian-featured.jpg", "category": "Chinese" },
        { "name": "Chilli Potato", "price": 130, "img": "https://www.awesomecuisine.com/wp-content/uploads/2015/01/Honey-Chilli-Potato.jpg", "category": "Chinese" },
        { "name": "Paneer Chilli Dry", "price": 190, "img": "https://www.shutterstock.com/image-photo/paneer-chilli-dry-chicken-divided-600nw-2575477137.jpg", "category": "Chinese" },
        { "name": "Schezwan Fried Rice", "price": 160, "img": "https://www.awesomecuisine.com/wp-content/uploads/2009/06/Szechwan-Fried-Rice.jpg", "category": "Chinese" },
        { "name": "Paneer Fried Rice", "price": 170, "img": "https://img.clearcals.com/recipes/9aed609f98a8850328143371b69e296efbf2f26a/medium.jpg", "category": "Chinese" },
        { "name": "Veg Lollipop", "price": 140, "img": "https://i.ytimg.com/vi/76ww9g_3Tao/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCZloy0S3g3DrCVZ7yhoMitBgeypw", "category": "Chinese" },
        { "name": "Sweet Corn Soup", "price": 110, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC2FeSWsl8T37Q9QVI0Q8m4AnB7ox6RwnQwg&s", "category": "Chinese" }
    ],
    "Fast Food": [
        { "name": "Veg Burger", "price": 80, "img": "https://images.slurrp.com/prod/recipe_images/transcribe/snack/Vegetable-Burger.webp", "category": "Fast Food" },
        { "name": "Cheese Pizza", "price": 200, "img": "https://madhurasrecipe.com/wp-content/uploads/2023/12/Veg-Pizza-2.jpg", "category": "Fast Food" },
        { "name": "French Fries", "price": 90, "img": "https://images.themodernproper.com/production/posts/2022/Homemade-French-Fries_8.jpg?w=1200&h=1200&q=60&fm=jpg&fit=crop&dm=1662474181&s=15046582e76b761a200998df2dcad0fd", "category": "Fast Food" },
        { "name": "Veg Momos", "price": 100, "img": "https://images.jdmagicbox.com/quickquotes/images_main/cheesy-spicy-veg-momos-10pcs-2227012532-kcdqxk2d.jpg", "category": "Fast Food" },
        { "name": "Fried Momos", "price": 120, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4NMsZIDYYeQO8M2hcvacmVx5XDTO--z-AlA&s", "category": "Fast Food" },
        { "name": "Paneer Momos", "price": 140, "img": "https://i0.wp.com/passion2cook.com/wp-content/uploads/2023/03/paneer-momos-1.jpg", "category": "Fast Food" },
        { "name": "Veg Sandwich", "price": 70, "img": "https://www.tipsnrecipesblog.com/wp-content/uploads/2022/09/sandwiches-main-500x375.jpg", "category": "Fast Food" },
        { "name": "Grilled Cheese Sandwich", "price": 110, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmQBi5Co29a_UJVwOtGJrx51ZRJqOqgtAacg&s", "category": "Fast Food" },
        { "name": "Veg Wrap", "price": 130, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDJ8xTCpVqmAgJjmhe_4E0wkSoewZxs1g8zA&s", "category": "Fast Food" },
        { "name": "Paneer Roll", "price": 160, "img": "https://carameltintedlife.com/wp-content/uploads/2022/01/paneer-kathi-roll-paneer-frankie-4.jpg", "category": "Fast Food" },
        { "name": "Margherita Pizza", "price": 180, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX2w-6ljxAJtEImAJ4zBsRnou1CoSAVmgvQw&s", "category": "Fast Food" },
        { "name": "Veg Extravaganza Pizza", "price": 250, "img": "https://i.ytimg.com/vi/5rk_Qa_mfzc/hqdefault.jpg", "category": "Fast Food" },
        { "name": "Garlic Bread", "price": 120, "img": "https://richanddelish.com/wp-content/uploads/2022/05/garlic-pizza.jpg", "category": "Fast Food" },
        { "name": "Cheese Nachos", "price": 150, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6ui4fvm7xt0Z30qeSjF9ZnSSxjfgpcMCWew&s", "category": "Fast Food" },
        { "name": "Aloo Tikki Burger", "price": 90, "img": "https://c.ndtvimg.com/2020-09/vics3pv_aloo-tikki-burger_625x300_19_September_20.jpg", "category": "Fast Food" }
    ],
    "Pizza": [
        { "name": "Margherita Pizza", "price": 150, "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Farmhouse Pizza", "price": 220, "img": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Peppy Paneer Pizza", "price": 250, "img": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Mexican Green Wave", "price": 240, "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Deluxe Veggie", "price": 230, "img": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Veg Extravaganza", "price": 280, "img": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Cheese n Corn", "price": 180, "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Paneer Makhani Pizza", "price": 260, "img": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Tandoori Paneer Pizza", "price": 270, "img": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Double Cheese Margherita", "price": 210, "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Fresh Veggie Pizza", "price": 190, "img": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Onion Capsicum Pizza", "price": 160, "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "Tomato Pizza", "price": 140, "img": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", "category": "Pizza" },
        { "name": "BBQ Veg Pizza", "price": 260, "img": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop", "category": "Pizza" }
    ],
    "Drinks": [
        { "name": "Coca Cola", "price": 60, "img": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Pepsi", "price": 60, "img": "https://images.unsplash.com/photo-1629683935825-9dfbc63a4087?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Sprite", "price": 60, "img": "https://images.unsplash.com/photo-1625772274472-887e5b2258aa?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Fanta", "price": 60, "img": "https://images.unsplash.com/photo-1624516773322-a74044af0fc8?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Thums Up", "price": 60, "img": "https://images.unsplash.com/photo-1581006527503-469a531e28be?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Limca", "price": 60, "img": "https://images.unsplash.com/photo-1513516345638-3487c02bb801?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Cold Coffee", "price": 120, "img": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Maaza", "price": 65, "img": "https://images.unsplash.com/photo-1558231908-ee9a725170d1?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Slice", "price": 65, "img": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Frooti", "price": 60, "img": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Tea", "price": 40, "img": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Coffee", "price": 60, "img": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Lassi", "price": 80, "img": "https://images.unsplash.com/photo-1616654716155-89bbfc213fbb?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Buttermilk", "price": 40, "img": "https://images.unsplash.com/photo-1616654716155-89bbfc213fbb?w=400&h=300&fit=crop", "category": "Drinks" },
        { "name": "Orange Juice", "price": 100, "img": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", "category": "Drinks" }
    ]
}

OFFERS_DATA = {
    "40% Off": [
        { "name": "Cheese Pizza Special", "displayName": "Cheese Pizza", "price": 200, "discountedPrice": 120, "img": "https://madhurasrecipe.com/wp-content/uploads/2023/12/Veg-Pizza-2.jpg", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "Masala Dosa Offer", "displayName": "Masala Dosa", "price": 100, "discountedPrice": 60, "img": "Sweet-Potato-Masala-Dosa-1.jpg", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "Paneer Butter Masala Offer", "displayName": "Paneer Butter Masala", "price": 180, "discountedPrice": 108, "img": "https://myfoodstory.com/wp-content/uploads/2021/07/restaurant-style-paneer-butter-masala-2-500x500.jpg", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "Veg Biryani Deal", "displayName": "Veg Biryani", "price": 160, "discountedPrice": 96, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlg7JYWWJNnY-MJVGm02itthRtcc105HPt4Q&s", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "Chole Bhature Offer", "displayName": "Chole Bhature", "price": 120, "discountedPrice": 72, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpThi0Ti9kMh8c9KvTx6c82EnI0ExuZtPtHg&s", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "Pav Bhaji Deal", "displayName": "Pav Bhaji", "price": 130, "discountedPrice": 78, "img": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Bambayya_Pav_bhaji.jpg", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "Dal Makhani Offer", "displayName": "Dal Makhani", "price": 160, "discountedPrice": 96, "img": "https://www.cookwithmanali.com/wp-content/uploads/2019/04/Restaurant-Style-Dal-Makhani-500x500.jpg", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "Spring Roll Deal", "displayName": "Spring Roll", "price": 120, "discountedPrice": 72, "img": "https://hot-thai-kitchen.com/wp-content/uploads/2014/10/crispy-spring-rolls-sq-new.jpg", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "French Fries Offer", "displayName": "French Fries", "price": 90, "discountedPrice": 54, "img": "https://images.themodernproper.com/production/posts/2022/Homemade-French-Fries_8.jpg?w=1200&h=1200&q=60&fm=jpg&fit=crop&dm=1662474181&s=15046582e76b761a200998df2dcad0fd", "offer": "40% Off", "category": "40% Off", "isOffer": True },
        { "name": "Paneer Roll Deal", "displayName": "Paneer Roll", "price": 160, "discountedPrice": 96, "img": "https://carameltintedlife.com/wp-content/uploads/2022/01/paneer-kathi-roll-paneer-frankie-4.jpg", "offer": "40% Off", "category": "40% Off", "isOffer": True }
    ],
    "Buy 1 Get 1": [
        { "name": "Veg Burger Special", "displayName": "Veg Burger", "price": 80, "img": "https://images.slurrp.com/prod/recipe_images/transcribe/snack/Vegetable-Burger.webp", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Cold Coffee BOGO", "displayName": "Cold Coffee", "price": 120, "img": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Veg Momos BOGO", "displayName": "Veg Momos", "price": 100, "img": "https://images.jdmagicbox.com/quickquotes/images_main/cheesy-spicy-veg-momos-10pcs-2227012532-kcdqxk2d.jpg", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Idli Sambhar BOGO", "displayName": "Idli Sambhar", "price": 70, "img": "images.jpg", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Aloo Paratha BOGO", "displayName": "Aloo Paratha", "price": 90, "img": "https://www.kingarthurbaking.com/sites/default/files/styles/featured_image_sm_2x/public/2025-07/Aloo-Paratha-_2025_Lifestyle_H_2435.jpg?itok=K649FPYA", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Veg Noodles BOGO", "displayName": "Veg Noodles", "price": 140, "img": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Margherita Pizza BOGO", "displayName": "Margherita Pizza", "price": 180, "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Orange Juice BOGO", "displayName": "Orange Juice", "price": 100, "img": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Veg Sandwich BOGO", "displayName": "Veg Sandwich", "price": 70, "img": "https://www.tipsnrecipesblog.com/wp-content/uploads/2022/09/sandwiches-main-500x375.jpg", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True },
        { "name": "Sweet Corn Soup BOGO", "displayName": "Sweet Corn Soup", "price": 110, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC2FeSWsl8T37Q9QVI0Q8m4AnB7ox6RwnQwg&s", "offer": "Buy 1 Get 1 Free", "category": "Buy 1 Get 1", "isOffer": True }
    ],
    "₹99 Only": [
        { "name": "Italian Pasta", "displayName": "Italian Pasta", "price": 99, "img": "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=400&h=300&fit=crop", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Mini Veg Thali", "displayName": "Veg Thali", "price": 99, "img": "https://5.imimg.com/data5/HW/II/SH/SELLER-9770898/veg-thali.jpg", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Hakka Noodles Bowl", "displayName": "Hakka Noodles", "price": 99, "img": "https://mariasmenu.com/wp-content/uploads/Veg-Hakka-Noodles.png", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Manchow Soup Meal", "displayName": "Manchow Soup", "price": 99, "img": "https://sinfullyspicy.com/wp-content/uploads/2023/12/1200-by-1200-images-1.jpg", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Poha Combo", "displayName": "Poha", "price": 99, "img": "download (1).jpg", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Upma Combo", "displayName": "Upma", "price": 99, "img": "pngtree-artfully-presented-south-indian-breakfast-upma-image_13627359.png", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Jeera Rice Bowl", "displayName": "Jeera Rice", "price": 99, "img": "https://www.vegrecipesofindia.com/wp-content/uploads/2025/05/jeera-rice-1.jpg", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Dal Fry Combo", "displayName": "Dal Fry", "price": 99, "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcstJZiJELJP2PK93FMnlcgeputwTQBNbmgg&s", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Aloo Gobi Meal", "displayName": "Aloo Gobi", "price": 99, "img": "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/aloo-gobi-recipe.jpg", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True },
        { "name": "Lassi & Samosa", "displayName": "Lassi", "price": 99, "img": "https://images.unsplash.com/photo-1616654716155-89bbfc213fbb?w=400&h=300&fit=crop", "offer": "₹99 Only", "category": "₹99 Only", "isOffer": True }
    ]
}


@csrf_exempt
def seed_menu(request):
    """
    POST /api/seed-menu/
    Ek baar MongoDB mein saara menu aur offers data daalega
    """
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Only POST allowed"}, status=405)

    try:
        # Clear existing menu
        menu_col.delete_many({})

        all_items = []
        for category, items in MENU_DATA.items():
            all_items.extend(items)
            
        for category, items in OFFERS_DATA.items():
            all_items.extend(items)

        menu_col.insert_many(all_items)
        return JsonResponse({"status": "success", "message": f"{len(all_items)} menu items and offers seeded to MongoDB!"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
def get_menu(request):
    """
    GET /api/get-menu/
    Saara menu MongoDB se fetch karega aur categories, offers, allProducts me group karke dega
    """
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Only GET allowed"}, status=405)

    try:
        items = list(menu_col.find({}, {"_id": 0}))

        categories = {}
        offers = {}
        all_products = []

        for item in items:
            all_products.append(item)
            cat = item.get("category", "Other")
            if item.get("isOffer"):
                offers.setdefault(cat, []).append(item)
            else:
                categories.setdefault(cat, []).append(item)

        return JsonResponse({
            "status": "success",
            "data": {
                "categories": categories,
                "offers": offers,
                "allProducts": all_products
            }
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

