"""
Generates realistic mock data for all 6 brands.
Run this if scraping gets blocked: python mock_data.py
"""

import csv
import random
import os

random.seed(42)

BRANDS = {
    "Safari":            {"price_range": (3500, 9000),  "avg_rating": 4.1, "discount_range": (20, 35)},
    "Skybags":           {"price_range": (2500, 7000),  "avg_rating": 3.9, "discount_range": (30, 50)},
    "American Tourister":{"price_range": (4000, 12000), "avg_rating": 4.3, "discount_range": (25, 45)},
    "VIP":               {"price_range": (3000, 8000),  "avg_rating": 3.8, "discount_range": (20, 40)},
    "Aristocrat":        {"price_range": (1800, 5000),  "avg_rating": 3.6, "discount_range": (35, 55)},
    "Nasher Miles":      {"price_range": (2000, 6000),  "avg_rating": 4.0, "discount_range": (40, 60)},
}

SIZES = ["Cabin (20 inch)", "Medium (24 inch)", "Large (28 inch)", "Set of 3"]

POSITIVE_TEMPLATES = [
    "The wheels are super smooth, glides effortlessly on airport floors.",
    "Build quality is excellent, very sturdy and durable material.",
    "Zipper is strong and locks properly. Very satisfied.",
    "Lightweight despite the large size, easy to carry.",
    "Handle extends well and feels solid. Great product.",
    "Looks premium, got many compliments at the airport.",
    "Value for money at this price point. Highly recommend.",
    "Hard shell is very tough, no dents even after rough handling.",
    "TSA lock works perfectly. Easy to use.",
    "Interior has good compartments, well organized.",
]

NEGATIVE_TEMPLATES = [
    "One wheel stopped working after just 2 trips. Very disappointed.",
    "Zipper broke within a month of use. Poor quality.",
    "The handle wobbles and feels loose. Not sturdy at all.",
    "Scratches very easily, looks old after first use.",
    "Much smaller than expected. Not worth the price.",
    "Lock malfunctioned, had to break it open. Terrible.",
    "Material feels cheap and thin. Not durable.",
    "The color faded after one wash. Quality issue.",
    "Delivery was damaged. Corners were cracked on arrival.",
    "Inner lining tore after first use. Very bad quality.",
]

def generate_review(brand: str, asin: str, bias: float) -> dict:
    is_positive = random.random() < bias
    stars = random.choices([5, 4, 3, 2, 1],
                           weights=[40, 30, 15, 10, 5] if is_positive else [5, 10, 15, 35, 35])[0]
    body = random.choice(POSITIVE_TEMPLATES if is_positive else NEGATIVE_TEMPLATES)
    months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"]
    date = f"Reviewed in India on {random.choice(months)} {random.randint(1,28)}, 2024"
    return {
        "asin": asin,
        "brand": brand,
        "stars": stars,
        "title": body[:40] + "..." if len(body) > 40 else body,
        "body": body,
        "date": date,
        "verified": random.random() > 0.2,
    }


def main():
    os.makedirs("../data", exist_ok=True)
    products = []
    reviews = []
    asin_counter = 1000000

    for brand, config in BRANDS.items():
        for i in range(12):  # 12 products per brand
            asin = f"B{asin_counter:09d}"
            asin_counter += 1
            size = random.choice(SIZES)
            mrp = random.randint(*config["price_range"])
            discount = random.randint(*config["discount_range"])
            price = round(mrp * (1 - discount / 100))
            rating = round(random.gauss(config["avg_rating"], 0.3), 1)
            rating = max(1.0, min(5.0, rating))
            review_count = random.randint(80, 2500)

            products.append({
                "asin": asin,
                "brand": brand,
                "title": f"{brand} {size} Hard Luggage Trolley Bag",
                "rating": rating,
                "review_count": review_count,
                "price": price,
                "mrp": mrp,
                "discount_pct": discount,
                "url": f"https://www.amazon.in/dp/{asin}",
            })

            # Sentiment bias based on avg_rating
            bias = (config["avg_rating"] - 1) / 4
            for _ in range(65):
                reviews.append(generate_review(brand, asin, bias))

    with open("../data/products.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=products[0].keys())
        writer.writeheader()
        writer.writerows(products)

    with open("../data/reviews.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=reviews[0].keys())
        writer.writeheader()
        writer.writerows(reviews)

    print(f"[✓] Generated {len(products)} products and {len(reviews)} reviews")
    print("    Files saved to ../data/")


if __name__ == "__main__":
    main()