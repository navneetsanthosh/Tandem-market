from decimal import Decimal
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.db.models import DecimalField, Q, Sum, F
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem, Product, StoreProfile
from .serializers import (
    CheckoutSerializer, OrderSerializer, ProductSerializer, RegisterSerializer,
    SellerOrderItemSerializer, profile_for,
)

User = get_user_model()


def public_user_data(user):
    profile = profile_for(user)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "account_type": profile.account_type,
        "store_name": profile.store_name,
        "store_description": profile.store_description,
    }


def is_seller(user):
    return user.is_authenticated and profile_for(user).account_type == StoreProfile.AccountType.SELLER


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok"})


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": public_user_data(user)}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user = authenticate(username=request.data.get("username", ""), password=request.data.get("password", ""))
        if not user:
            return Response({"detail": "The username or password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": public_user_data(user)})


class MeView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(public_user_data(request.user))


class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductList(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        products = Product.objects.filter(is_active=True).select_related("seller", "seller__store_profile")
        category = request.query_params.get("category")
        search = request.query_params.get("q", "").strip()
        seller_id = request.query_params.get("seller")
        sort = request.query_params.get("sort", "newest")
        if category and category != "all":
            products = products.filter(category=category)
        if search:
            products = products.filter(Q(name__icontains=search) | Q(description__icontains=search) | Q(seller__store_profile__store_name__icontains=search))
        if seller_id:
            products = products.filter(seller_id=seller_id)
        if sort == "price_low":
            products = products.order_by("price", "name")
        elif sort == "price_high":
            products = products.order_by("-price", "name")
        elif sort == "popular":
            products = products.annotate(sold=Sum("order_items__quantity")).order_by("-sold", "-created_at")
        return Response(ProductSerializer(products, many=True, context={"request": request}).data)

    def post(self, request):
        if not is_seller(request.user):
            return Response({"detail": "Create a seller account before publishing a product."}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        product = serializer.save(seller=request.user)
        return Response(ProductSerializer(product, context={"request": request}).data, status=status.HTTP_201_CREATED)


class ProductDetail(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, id):
        product = get_object_or_404(Product.objects.select_related("seller", "seller__store_profile"), id=id, is_active=True)
        return Response(ProductSerializer(product, context={"request": request}).data)


class SellerDashboardView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_seller(request.user):
            return Response({"detail": "A seller account is required."}, status=status.HTTP_403_FORBIDDEN)
        products = request.user.products.all()
        order_items = OrderItem.objects.filter(seller=request.user).select_related("order").order_by("-order__created_at")
        profile = profile_for(request.user)
        stats = {
            "active_listings": products.filter(is_active=True).count(),
            "units_in_stock": products.aggregate(total=Sum("stock"))["total"] or 0,
            "items_to_fulfil": order_items.exclude(fulfillment_status=OrderItem.FulfillmentStatus.DELIVERED).count(),
            "sales_total": order_items.aggregate(
                total=Sum(F("unit_price") * F("quantity"), output_field=DecimalField(max_digits=14, decimal_places=2))
            )["total"] or Decimal("0.00"),
        }
        return Response({
            "store_name": profile.store_name,
            "store_description": profile.store_description,
            "stats": stats,
            "products": ProductSerializer(products.select_related("seller", "seller__store_profile"), many=True, context={"request": request}).data,
            "recent_items": SellerOrderItemSerializer(order_items[:12], many=True).data,
        })


class SellerFulfillmentView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        if not is_seller(request.user):
            return Response({"detail": "A seller account is required."}, status=status.HTTP_403_FORBIDDEN)
        item = get_object_or_404(OrderItem, pk=item_id, seller=request.user)
        next_status = request.data.get("fulfillment_status")
        valid = [choice for choice, _label in OrderItem.FulfillmentStatus.choices]
        if next_status not in valid:
            return Response({"fulfillment_status": ["Choose a valid fulfilment status."]}, status=status.HTTP_400_BAD_REQUEST)
        item.fulfillment_status = next_status
        item.save(update_fields=["fulfillment_status"])
        return Response(SellerOrderItemSerializer(item).data)


class StoreDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        seller = get_object_or_404(User, id=user_id, is_active=True)
        profile = profile_for(seller)
        if profile.account_type != StoreProfile.AccountType.SELLER:
            return Response({"detail": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
        products = Product.objects.filter(seller=seller, is_active=True).select_related("seller", "seller__store_profile")
        return Response({
            "seller_id": seller.id,
            "store_name": profile.store_name,
            "store_description": profile.store_description,
            "product_count": products.count(),
            "products": ProductSerializer(products, many=True, context={"request": request}).data,
        })


class OrderList(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items").order_by("-created_at")
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lines = serializer.validated_data["items"]
        product_ids = [line["product_id"] for line in lines]
        with transaction.atomic():
            products = {product.id: product for product in Product.objects.select_for_update().select_related("seller", "seller__store_profile").filter(id__in=product_ids, is_active=True)}
            if len(products) != len(product_ids):
                return Response({"items": ["One or more products are no longer available."]}, status=status.HTTP_400_BAD_REQUEST)
            for line in lines:
                product = products[line["product_id"]]
                if product.stock < line["quantity"]:
                    return Response({"items": [f"Only {product.stock} of {product.name} remain in stock."]}, status=status.HTTP_400_BAD_REQUEST)
            total = sum((products[line["product_id"]].price * line["quantity"] for line in lines), Decimal("0.00"))
            data = serializer.validated_data
            order = Order.objects.create(
                user=request.user,
                customer_name=data["customer_name"],
                address=data["address"],
                phone=data["phone"],
                city=data["city"],
                postal_code=data["postal_code"],
                total_amount=total,
            )
            for line in lines:
                product = products[line["product_id"]]
                profile = getattr(product.seller, "store_profile", None) if product.seller_id else None
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    seller=product.seller,
                    product_name=product.name,
                    seller_name=profile.store_name if profile and profile.store_name else (product.seller.username if product.seller_id else "Independent maker"),
                    unit_price=product.price,
                    quantity=line["quantity"],
                )
                product.stock -= line["quantity"]
                product.save(update_fields=["stock"])
        order = Order.objects.prefetch_related("items").get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class SellerOrderList(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_seller(request.user):
            return Response({"detail": "A seller account is required."}, status=status.HTTP_403_FORBIDDEN)
        items = OrderItem.objects.filter(seller=request.user).select_related("order").order_by("-order__created_at")
        return Response(SellerOrderItemSerializer(items, many=True).data)
