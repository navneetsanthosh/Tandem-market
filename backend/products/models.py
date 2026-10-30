from django.conf import settings
from django.db import models
from django.utils import timezone


class StoreProfile(models.Model):
    class AccountType(models.TextChoices):
        BUYER = "buyer", "Buyer"
        SELLER = "seller", "Seller"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="store_profile")
    account_type = models.CharField(max_length=10, choices=AccountType.choices, default=AccountType.BUYER)
    store_name = models.CharField(max_length=80, blank=True)
    store_description = models.CharField(max_length=240, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.store_name or self.user.username


class Product(models.Model):
    class Category(models.TextChoices):
        HOME = "home", "Home & living"
        FASHION = "fashion", "Clothing & accessories"
        ART = "art", "Art & stationery"
        BEAUTY = "beauty", "Beauty & care"
        FOOD = "food", "Food & pantry"
        JEWELLERY = "jewellery", "Jewellery"
        OTHER = "other", "Other finds"

    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.HOME)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    image_url = models.URLField(max_length=600, blank=True)
    stock = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ["-created_at", "name"]

    def __str__(self):
        return self.name


class Order(models.Model):
    class Status(models.TextChoices):
        PLACED = "placed", "Placed"
        CONFIRMED = "confirmed", "Confirmed"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    customer_name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=24, blank=True)
    city = models.CharField(max_length=80, blank=True)
    postal_code = models.CharField(max_length=16, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PLACED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} · {self.customer_name}"


class OrderItem(models.Model):
    class FulfillmentStatus(models.TextChoices):
        NEW = "new", "New"
        PACKING = "packing", "Packing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="order_items")
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="sales_items")
    product_name = models.CharField(max_length=100)
    seller_name = models.CharField(max_length=80, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    fulfillment_status = models.CharField(max_length=12, choices=FulfillmentStatus.choices, default=FulfillmentStatus.NEW)

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity} × {self.product_name}"
