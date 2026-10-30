from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import Order, OrderItem, Product, StoreProfile

User = get_user_model()


def profile_for(user):
    profile, _ = StoreProfile.objects.get_or_create(user=user)
    return profile


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True, trim_whitespace=False)
    account_type = serializers.ChoiceField(choices=StoreProfile.AccountType.choices, default=StoreProfile.AccountType.BUYER)
    store_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    store_description = serializers.CharField(max_length=240, required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value.strip()).exists():
            raise serializers.ValidationError("That username is already in use.")
        return value.strip()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs["account_type"] == StoreProfile.AccountType.SELLER and not attrs.get("store_name", "").strip():
            raise serializers.ValidationError({"store_name": "Add a name for your store."})
        candidate = User(username=attrs["username"], email=attrs["email"])
        try:
            validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": list(error.messages)}) from error
        return attrs

    def create(self, validated_data):
        account_type = validated_data.pop("account_type")
        store_name = validated_data.pop("store_name", "").strip()
        store_description = validated_data.pop("store_description", "").strip()
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        StoreProfile.objects.create(user=user, account_type=account_type, store_name=store_name, store_description=store_description)
        return user


class ProductSerializer(serializers.ModelSerializer):
    seller_id = serializers.IntegerField(source="seller.id", read_only=True, allow_null=True)
    seller_name = serializers.SerializerMethodField()
    store_name = serializers.SerializerMethodField()
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ["id", "name", "description", "category", "category_label", "price", "image", "image_url",
                  "stock", "seller_id", "seller_name", "store_name", "created_at"]
        read_only_fields = ["seller_id", "seller_name", "store_name", "created_at"]

    def get_seller_name(self, product):
        return product.seller.get_username() if product.seller_id else "Independent maker"

    def get_store_name(self, product):
        if not product.seller_id:
            return "Independent maker"
        profile = getattr(product.seller, "store_profile", None)
        return profile.store_name if profile and profile.store_name else product.seller.get_username()


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "seller_name", "unit_price", "quantity", "line_total", "fulfillment_status"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "customer_name", "address", "phone", "city", "postal_code", "total_amount", "status", "created_at", "items"]


class CheckoutLineSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=50)


class CheckoutSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=24)
    address = serializers.CharField(max_length=300)
    city = serializers.CharField(max_length=80)
    postal_code = serializers.CharField(max_length=16)
    payment_method = serializers.ChoiceField(choices=[("cod", "Cash on delivery")], default="cod")
    items = CheckoutLineSerializer(many=True, allow_empty=False)

    def validate_items(self, items):
        if len(items) > 30:
            raise serializers.ValidationError("An order can contain up to 30 different products.")
        ids = [line["product_id"] for line in items]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Combine repeated products into one cart line.")
        return items


class SellerOrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="order.id", read_only=True)
    buyer_name = serializers.CharField(source="order.customer_name", read_only=True)
    order_date = serializers.DateTimeField(source="order.created_at", read_only=True)
    ship_to = serializers.CharField(source="order.address", read_only=True)
    city = serializers.CharField(source="order.city", read_only=True)
    postal_code = serializers.CharField(source="order.postal_code", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "order_id", "buyer_name", "order_date", "ship_to", "city", "postal_code", "product_name", "quantity", "unit_price", "fulfillment_status"]
