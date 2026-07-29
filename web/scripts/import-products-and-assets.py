#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import unicodedata
from pathlib import Path

from PIL import Image


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value).strip("-")
    return slug or "item"


def product_category(name: str) -> str:
    if any(word in name for word in ("กระเป๋า", "การ์ดโฮลเดอร์", "คาด-อก", "คลัซ")):
        return "wallets"
    if any(word in name for word in ("กำไล", "ด้าย", "ประคำ", "ตะกรุด", "ปี่เซียะ")):
        return "charms"
    if any(word in name for word in ("น้ำหอม", "สบู่", "ลิป", "กางเกง", "กล้วย")):
        return "lifestyle"
    if any(word in name for word in ("การ์ด", "ผ้ายันต์", "ธูป", "พวงกุญแจ", "เมล็ดข้าว", "หวี")):
        return "sacred"
    return "other"


def image_to_webp(source: Path, destination: Path, max_size: int = 1200, quality: int = 80) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=quality, method=6)


def copy_logo(source: Path, public_root: Path) -> None:
    asset_dir = public_root / "v2" / "assets" / "brand"
    asset_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, asset_dir / "logo.png")

    with Image.open(source).convert("RGBA") as logo:
        logo.thumbnail((420, 420), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (512, 512), "#10041d")
        x = (512 - logo.width) // 2
        y = (512 - logo.height) // 2
        canvas.alpha_composite(logo, (x, y))
        canvas.convert("RGB").save(asset_dir / "app-icon-512.png", quality=95)
        canvas.resize((192, 192), Image.Resampling.LANCZOS).convert("RGB").save(
            asset_dir / "app-icon-192.png", quality=95
        )


def import_products(source_root: Path, web_root: Path) -> list[dict]:
    raw = json.loads((source_root / "products.json").read_text(encoding="utf-8"))
    public_products = web_root / "public" / "v2" / "assets" / "products"
    products = []

    for raw_product in raw["products"]:
        item_id = str(raw_product["item_id"])
        image_sources = sorted((source_root / "products" / item_id / "images").glob("*.jpg"))
        local_images = []
        for index, image_source in enumerate(image_sources, start=1):
            destination = public_products / item_id / f"{index:02d}.webp"
            image_to_webp(image_source, destination, max_size=1000, quality=78)
            local_images.append(f"/v2/assets/products/{item_id}/{destination.name}")

        price = raw_product.get("price_normalized") or {}
        variants = []
        for group_index, group in enumerate(raw_product.get("variants") or []):
            variants.append(
                {
                    "id": f"{item_id}-{group_index + 1}",
                    "name": group.get("name") or "ตัวเลือก",
                    "options": [
                        {
                            "id": f"{item_id}-{group_index + 1}-{option_index + 1}",
                            "name": option.get("name") or f"ตัวเลือก {option_index + 1}",
                            "disabled": bool(option.get("disabled")),
                        }
                        for option_index, option in enumerate(group.get("options") or [])
                    ],
                }
            )

        products.append(
            {
                "id": item_id,
                "slug": f"{slugify(raw_product['name'])}-{item_id}",
                "name": raw_product["name"],
                "description": raw_product.get("description") or "",
                "category": product_category(raw_product["name"]),
                "priceMin": price.get("current_min_thb") or raw_product.get("current_price_thb") or 0,
                "priceMax": price.get("current_max_thb") or raw_product.get("current_price_thb") or 0,
                "originalPriceMin": price.get("original_min_thb"),
                "originalPriceMax": price.get("original_max_thb"),
                "rating": raw_product.get("rating_value"),
                "reviewCount": raw_product.get("review_count") or 0,
                "soldCount": raw_product.get("sold_count_numeric") or 0,
                "availability": raw_product.get("availability") or "InStock",
                "images": local_images,
                "variants": variants,
                "sourceUrl": raw_product.get("canonical_url") or raw_product.get("href"),
                "capturedAt": raw_product.get("captured_at"),
            }
        )

    data_dir = web_root / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "products.json").write_text(
        json.dumps(products, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return products


def import_legacy_assets(repo_root: Path, web_root: Path) -> None:
    public_root = web_root / "public"
    v2_assets = public_root / "v2" / "assets"
    copy_logo(repo_root / "Picture" / "logo.png", public_root)

    tarot_source = repo_root / "NFCV.2" / "taro" / "Picture" / "PrintaciousCo"
    for source in tarot_source.glob("*.png"):
        image_to_webp(
            source,
            v2_assets / "tarot" / f"{source.stem}.webp",
            max_size=900,
            quality=82,
        )

    wallpaper_source = repo_root / "card" / "Picture"
    for source in wallpaper_source.rglob("*.jpg"):
        relative = source.relative_to(wallpaper_source)
        destination = v2_assets / "wallpapers" / relative.parent / f"{source.stem}.webp"
        image_to_webp(source, destination, max_size=1080, quality=80)

    horse_map = {
        "8 ม.ค. 2569 15_52_06.png": "red.webp",
        "ChatGPT Image 8 ม.ค. 2569 15_47_20.png": "beige.webp",
        "ChatGPT Image 8 ม.ค. 2569 15_42_26.png": "white.webp",
    }
    for source_name, destination_name in horse_map.items():
        image_to_webp(
            repo_root / "pony" / source_name,
            v2_assets / "horse" / destination_name,
            max_size=720,
            quality=82,
        )

    image_to_webp(
        repo_root / "NFCV.2" / "Seimsee" / "Seimsee.png",
        v2_assets / "rituals" / "seimsee.webp",
        max_size=720,
        quality=82,
    )
    image_to_webp(
        repo_root / "NFCV.2" / "Wood" / "b.png",
        v2_assets / "rituals" / "wood-down.webp",
        max_size=720,
        quality=82,
    )
    image_to_webp(
        repo_root / "NFCV.2" / "Wood" / "f.png",
        v2_assets / "rituals" / "wood-up.webp",
        max_size=720,
        quality=82,
    )
    shutil.copy2(
        repo_root / "พุททังนำมาเงิน.mp3",
        v2_assets / "rituals" / "money-chant.mp3",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--product-source", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--web-root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()

    products = import_products(args.product_source.resolve(), args.web_root.resolve())
    import_legacy_assets(args.repo_root.resolve(), args.web_root.resolve())
    variant_options = sum(
        len(group["options"])
        for product in products
        for group in product["variants"]
    )
    print(f"Imported {len(products)} products with {variant_options} variant options.")


if __name__ == "__main__":
    main()
