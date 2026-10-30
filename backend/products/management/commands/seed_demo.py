from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from products.models import Product, StoreProfile


class Command(BaseCommand):
    help = "Add a local demo store and sample products if the catalog is empty."

    def handle(self, *args, **options):
        User = get_user_model()
        seller, created = User.objects.get_or_create(
            username="tandemstudio",
            defaults={"email": "studio@example.local"},
        )
        if created:
            seller.set_password("LocalOnly-Tandem-2026!")
            seller.save(update_fields=["password"])
        profile, _ = StoreProfile.objects.get_or_create(
            user=seller,
            defaults={
                "account_type": StoreProfile.AccountType.SELLER,
                "store_name": "Tandem Studio",
                "store_description": "Small-batch objects made with care by independent makers.",
            },
        )
        if profile.account_type != StoreProfile.AccountType.SELLER:
            profile.account_type = StoreProfile.AccountType.SELLER
            profile.store_name = "Tandem Studio"
            profile.store_description = "Small-batch objects made with care by independent makers."
            profile.save(update_fields=["account_type", "store_name", "store_description"])

        examples = [
            ("The Sunday pour-over set", "home", "A quiet ritual, made by hand. A stoneware dripper and matching cup, each finished with a warm oatmeal glaze.", 2850, 14, "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85"),
            ("Everyday carry tote", "fashion", "A sturdy cotton canvas tote woven in small batches, with a roomy interior and an inside pocket for the little things.", 1450, 28, "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85"),
            ("Blue hour, framed", "art", "A small-run archival art print inspired by the last blue light over the coast. Printed on textured, FSC-certified paper.", 2200, 11, "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1000&q=85"),
            ("Citrus grove hand balm", "beauty", "A light, plant-based hand balm with notes of bergamot and sweet orange. Made in a family workshop in small batches.", 780, 36, "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85"),
            ("A little sunstone pendant", "jewellery", "A hand-set natural sunstone in recycled sterling silver, finished with a fine chain. Each stone carries its own warm shimmer.", 3600, 6, "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85"),
            ("Cacao & toasted oat granola", "food", "Small-batch granola with dark cacao, toasted oats, a little sea salt and just enough maple. Packed fresh each week.", 520, 22, "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1000&q=85"),
        ]
        if not Product.objects.filter(seller=seller).exists():
            for title, category, description, price, stock, image_url in examples:
                Product.objects.create(
                    seller=seller,
                    name=title,
                    category=category,
                    description=description,
                    price=price,
                    stock=stock,
                    image_url=image_url,
                )
            self.stdout.write(self.style.SUCCESS("Added six fictional Tandem Studio listings. Existing products were preserved."))
        else:
            self.stdout.write("Tandem Studio listings already exist; no sample products were added.")
        self.stdout.write("Local seller login: tandemstudio / LocalOnly-Tandem-2026!")
