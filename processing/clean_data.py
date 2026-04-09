"""
Data quality cleanup script for products.csv and reviews.csv.

Fixes:
1. Removes products with missing price/MRP data (NaN prices).
2. Backfills review_count in products.csv by counting actual reviews from reviews.csv.
3. Deduplicates reviews (removes exact duplicate rows based on asin+title+body).
4. Removes duplicate product rows (same ASIN appearing multiple times for the same brand).
"""

import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

def clean():
    products_path = DATA_DIR / "products.csv"
    reviews_path = DATA_DIR / "reviews.csv"

    # --- Load ---
    products = pd.read_csv(products_path)
    reviews = pd.read_csv(reviews_path)

    print(f"[BEFORE] Products: {len(products)} rows")
    print(f"[BEFORE] Reviews:  {len(reviews)} rows")

    # --- 1. Remove products with missing price ---
    before = len(products)
    products = products.dropna(subset=["price"])
    products = products[products["price"] > 0]
    removed_missing_price = before - len(products)
    print(f"  Removed {removed_missing_price} product(s) with missing/zero price.")

    # --- 2. Deduplicate products (same ASIN + same brand = duplicate) ---
    before = len(products)
    products = products.drop_duplicates(subset=["asin", "brand"], keep="first")
    removed_dup_products = before - len(products)
    print(f"  Removed {removed_dup_products} duplicate product row(s).")

    # --- 3. Deduplicate reviews (exact same asin + title + body = duplicate) ---
    before = len(reviews)
    reviews = reviews.drop_duplicates(subset=["asin", "title", "body"], keep="first")
    removed_dup_reviews = before - len(reviews)
    print(f"  Removed {removed_dup_reviews} duplicate review row(s).")

    # --- 4. Backfill review_count from actual review data ---
    review_counts = reviews.groupby("asin").size().to_dict()
    products["review_count"] = products["asin"].map(lambda x: review_counts.get(x, 0))
    zero_reviews = (products["review_count"] == 0).sum()
    print(f"  Backfilled review_count for all products ({zero_reviews} still have 0 reviews).")

    # --- Save ---
    products.to_csv(products_path, index=False)
    reviews.to_csv(reviews_path, index=False)

    print(f"\n[AFTER] Products: {len(products)} rows")
    print(f"[AFTER] Reviews:  {len(reviews)} rows")
    print(f"\n✅ Cleaned data saved to {DATA_DIR}")

if __name__ == "__main__":
    clean()
