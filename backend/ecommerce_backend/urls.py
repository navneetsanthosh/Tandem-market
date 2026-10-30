"""
URL configuration for ecommerce_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from products.views import (
    HealthView, LoginView, LogoutView, MeView, OrderList, ProductDetail,
    ProductList, RegisterView, SellerDashboardView, SellerFulfillmentView,
    SellerOrderList, StoreDetailView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthView.as_view(), name='health'),
    path('api/products/', ProductList.as_view(), name='product-list'),
    path('api/products/<int:id>/', ProductDetail.as_view(), name='product-detail'),
    path('api/orders/', OrderList.as_view(), name='order-list'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/me/', MeView.as_view(), name='me'),
    path('api/seller/dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('api/seller/orders/', SellerOrderList.as_view(), name='seller-orders'),
    path('api/seller/items/<int:item_id>/status/', SellerFulfillmentView.as_view(), name='seller-item-status'),
    path('api/stores/<int:user_id>/', StoreDetailView.as_view(), name='store-detail'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
