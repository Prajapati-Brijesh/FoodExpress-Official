from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from api.views import save_to_mongo, cancel_order_public, get_order_status_public, admin_login, get_orders, update_order_status
from api.auth import signup, login
from api.menu import seed_menu, get_menu
from api.admin_views import (
    admin_stats,
    admin_get_users, admin_ban_user,
    admin_get_menu, admin_add_menu_item, admin_update_menu_item, admin_delete_menu_item,
    admin_get_coupons, admin_add_coupon, admin_delete_coupon,
    admin_send_notification, admin_get_notifications,
    admin_get_settings, admin_save_settings,
)
from api.restaurant_views import (
    admin_get_restaurants, admin_add_restaurant, admin_update_restaurant, admin_delete_restaurant,
    admin_restaurant_add_item, admin_restaurant_delete_item,
    public_get_restaurants, public_get_restaurant_detail,
    delivery_register, admin_get_delivery, admin_update_delivery,
    delivery_login, delivery_dashboard, delivery_duty, delivery_accept_order, delivery_deliver_order,
    partner_register, partner_login, partner_get_orders, partner_update_order,
)
from api.upload_views import upload_image
from api.review_views import add_review, get_reviews
from api.notification_views import send_notification, get_notifications

urlpatterns = [
    path('admin/', admin.site.urls),

    # Orders
    path('api/save-order/', save_to_mongo),
    path('api/orders/cancel/', cancel_order_public),
    path('api/get-orders/', get_orders),
    path('api/get-order/<str:order_id>/', get_order_status_public),
    path('api/update-order-status/', update_order_status),

    # Admin Auth
    path('api/admin-login/', admin_login),

    # Admin - Stats
    path('api/admin/stats/', admin_stats),

    # Admin - Users
    path('api/admin/users/', admin_get_users),
    path('api/admin/users/ban/', admin_ban_user),

    # Admin - Menu (global)
    path('api/admin/menu/', admin_get_menu),
    path('api/admin/menu/add/', admin_add_menu_item),
    path('api/admin/menu/update/', admin_update_menu_item),
    path('api/admin/menu/delete/', admin_delete_menu_item),

    # Admin - Restaurants
    path('api/admin/restaurants/', admin_get_restaurants),
    path('api/admin/restaurants/add/', admin_add_restaurant),
    path('api/admin/restaurants/update/', admin_update_restaurant),
    path('api/admin/restaurants/delete/', admin_delete_restaurant),
    path('api/admin/restaurants/menu/add/', admin_restaurant_add_item),
    path('api/admin/restaurants/menu/delete/', admin_restaurant_delete_item),

    # Admin - Delivery Partners
    path('api/admin/delivery/', admin_get_delivery),
    path('api/admin/delivery/update/', admin_update_delivery),

    # Admin - Coupons
    path('api/admin/coupons/', admin_get_coupons),
    path('api/admin/coupons/add/', admin_add_coupon),
    path('api/admin/coupons/delete/', admin_delete_coupon),

    # Admin - Notifications
    path('api/admin/notifications/', admin_get_notifications),
    path('api/admin/notifications/send/', admin_send_notification),

    # Admin - Settings
    path('api/admin/settings/', admin_get_settings),
    path('api/admin/settings/save/', admin_save_settings),

    # User Authentication
    path('api/signup/', signup),
    path('api/login/', login),

    # Menu (public)
    path('api/seed-menu/', seed_menu),
    path('api/get-menu/', get_menu),

    # Public - Restaurants
    path('api/restaurants/', public_get_restaurants),
    path('api/restaurants/<str:restaurant_id>/', public_get_restaurant_detail),

    # Public - Delivery Registration & App
    path('api/delivery/register/', delivery_register),
    path('api/delivery/login/', delivery_login),
    path('api/delivery/dashboard/', delivery_dashboard),
    path('api/delivery/duty/', delivery_duty),
    path('api/delivery/order/accept/', delivery_accept_order),
    path('api/delivery/order/deliver/', delivery_deliver_order),

    # Public - Restaurant Partner Registration
    path('api/partner/register/', partner_register),
    path('api/partner/login/', partner_login),
    path('api/partner/orders/', partner_get_orders),
    path('api/partner/orders/update/', partner_update_order),

    # Reviews
    path('api/reviews/add/', add_review),
    path('api/reviews/<str:restaurant_id>/', get_reviews),

    # Notifications
    path('api/notifications/send/', send_notification),
    path('api/notifications/', get_notifications),

    # Common - Image Upload
    path('api/upload/', upload_image),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
