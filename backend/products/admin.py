from django.contrib import admin
from .models import Order, OrderItem, Product, StoreProfile


@admin.register(StoreProfile)
class StoreProfileAdmin(admin.ModelAdmin):
    list_display = ["store_name", "user", "account_type", "created_at"]
    list_filter = ["account_type"]
    search_fields = ["store_name", "user__username", "user__email"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "seller", "product_name", "seller_name", "unit_price", "quantity"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "seller", "category", "price", "stock", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["name", "description", "seller__username"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "customer_name", "status", "total_amount", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["customer_name", "user__username"]
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product_name", "seller_name", "quantity", "unit_price", "fulfillment_status"]
    list_filter = ["fulfillment_status"]
    search_fields = ["product_name", "seller_name", "seller__username"]
