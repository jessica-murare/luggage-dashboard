import json
import re
import csv
import os
from collections import defaultdict, Counter
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# ── Config ─────────────────────────────────────────────────────────────────

PRODUCTS_FILE = "../data/products.csv"
REVIEWS_FILE  = "../data/reviews.csv"
OUTPUT_FILE   = "../data/insights.json"

# Aspect keywords — maps each aspect to trigger words
ASPECTS = {
    "wheels":    ["wheel", "wheels", "rolling", "rolls", "spinner", "rotate", "rotation"],
    "handle":    ["handle", "handles", "grip", "telescopic", "extend", "pull"],
    "zipper":    ["zipper", "zip", "zips", "lock", "locks", "locking", "closure"],
    "material":  ["material", "hard shell", "hardshell", "plastic", "polycarbonate",
                  "fabric", "cloth", "sturdy", "build", "quality", "durable", "durability"],
    "size":      ["size", "spacious", "capacity", "fits", "fitting", "compartment",
                  "small", "large", "big", "compact"],
    "weight":    ["weight", "lightweight", "heavy", "light", "kg", "grams"],
}

# ── Loaders ────────────────────────────────────────────────────────────────

def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

# ── Sentiment ──────────────────────────────────────────────────────────────

def score_reviews(reviews: list[dict], sia: SentimentIntensityAnalyzer) -> list[dict]:
    """Add compound VADER score to every review."""
    for r in reviews:
        text = f"{r.get('title', '')} {r.get('body', '')}"
        r["compound"] = sia.polarity_scores(text)["compound"]
    return reviews

def brand_sentiment_score(reviews: list[dict]) -> float:
    """Average compound score mapped to 0–100."""
    if not reviews:
        return 0.0
    avg = sum(r["compound"] for r in reviews) / len(reviews)
    return round((avg + 1) / 2 * 100, 1)   # -1..1  →  0..100

# ── Theme extraction ───────────────────────────────────────────────────────

def extract_themes(reviews: list[dict]) -> dict:
    """Pull top positive and negative phrases by scanning review text."""
    pos_words = Counter()
    neg_words = Counter()

    positive_markers = ["good", "great", "excellent", "amazing", "love", "perfect",
                        "smooth", "sturdy", "durable", "spacious", "lightweight",
                        "quality", "strong", "solid", "nice", "best", "happy"]
    negative_markers = ["bad", "broke", "broken", "poor", "cheap", "flimsy",
                        "damaged", "loose", "wobbly", "cracked", "disappointed",
                        "pathetic", "terrible", "worst", "waste", "defective"]

    for r in reviews:
        text = r.get("body", "").lower()
        words = re.findall(r'\b\w+\b', text)
        for w in words:
            if w in positive_markers:
                pos_words[w] += 1
            if w in negative_markers:
                neg_words[w] += 1

    return {
        "top_positives": [w for w, _ in pos_words.most_common(5)],
        "top_negatives": [w for w, _ in neg_words.most_common(5)],
    }

# ── Aspect-level sentiment ─────────────────────────────────────────────────

def aspect_sentiment(reviews: list[dict], sia: SentimentIntensityAnalyzer) -> dict:
    """
    For each aspect, find reviews that mention it and average their sentiment.
    Returns dict: { "wheels": 62.3, "zipper": 44.1, ... }
    """
    aspect_scores = defaultdict(list)

    for r in reviews:
        text = r.get("body", "").lower()
        for aspect, keywords in ASPECTS.items():
            if any(kw in text for kw in keywords):
                score = sia.polarity_scores(text)["compound"]
                aspect_scores[aspect].append(score)

    result = {}
    for aspect in ASPECTS:
        scores = aspect_scores[aspect]
        if scores:
            avg = sum(scores) / len(scores)
            result[aspect] = round((avg + 1) / 2 * 100, 1)
        else:
            result[aspect] = None   # not enough mentions

    return result

# ── Trust signals ──────────────────────────────────────────────────────────

def trust_signals(reviews: list[dict]) -> dict:
    """
    Detect:
    - verified_pct: % of reviews marked verified purchase
    - rating_skew: are ratings unusually bimodal (lots of 5s and 1s, few middle)?
    - repetition_score: how many review bodies are near-duplicates
    """
    total = len(reviews)
    if total == 0:
        return {}

    verified = sum(1 for r in reviews if str(r.get("verified", "")).lower() == "true")
    verified_pct = round(verified / total * 100, 1)

    # Rating distribution
    dist = Counter(float(r["stars"]) for r in reviews if r.get("stars"))
    fives = dist.get(5.0, 0)
    ones  = dist.get(1.0, 0)
    threes = dist.get(3.0, 0)
    # Skew = high 5+1 share relative to middle ratings
    extreme = fives + ones
    rating_skew = round(extreme / total * 100, 1) if total else 0

    # Repetition: count duplicate bodies (exact)
    bodies = [r.get("body", "").strip().lower() for r in reviews]
    body_counts = Counter(bodies)
    duplicates = sum(c - 1 for c in body_counts.values() if c > 1)
    repetition_score = round(duplicates / total * 100, 1)

    flags = []
    if verified_pct < 40:
        flags.append("Low verified purchase rate")
    if rating_skew > 70:
        flags.append("Unusual rating distribution (many 5s and 1s)")
    if repetition_score > 5:
        flags.append("Repeated review text detected")

    return {
        "verified_pct": verified_pct,
        "rating_skew": rating_skew,
        "repetition_score": repetition_score,
        "flags": flags,
    }

# ── Value-for-money ────────────────────────────────────────────────────────

def value_for_money(sentiment_score: float, avg_price: float) -> dict:
    """
    Price band + value index.
    Value index = sentiment / normalized_price  (higher = more value per rupee)
    """
    if avg_price < 3000:
        band = "budget"
    elif avg_price < 6000:
        band = "mid-range"
    else:
        band = "premium"

    # Normalize price to 1–10 scale (1000–15000 range)
    norm_price = max(1, min(10, (avg_price - 1000) / 1400))
    value_index = round(sentiment_score / norm_price, 1)

    return {
        "price_band": band,
        "value_index": value_index,   # higher = better value for money
    }

# ── Main ───────────────────────────────────────────────────────────────────

def main():
    print("[→] Loading data...")
    products = load_csv(PRODUCTS_FILE)
    reviews  = load_csv(REVIEWS_FILE)

    sia = SentimentIntensityAnalyzer()
    reviews = score_reviews(reviews, sia)

    # Group by brand
    brand_products  = defaultdict(list)
    brand_reviews   = defaultdict(list)
    for p in products:
        brand_products[p["brand"]].append(p)
    for r in reviews:
        brand_reviews[r["brand"]].append(r)

    insights = {}

    for brand in brand_products:
        b_products = brand_products[brand]
        b_reviews  = brand_reviews[brand]

        print(f"[→] Processing {brand} — {len(b_products)} products, {len(b_reviews)} reviews")

        prices    = [float(p["price"])   for p in b_products if p.get("price")]
        mrps      = [float(p["mrp"])     for p in b_products if p.get("mrp")]
        discounts = [float(p["discount_pct"]) for p in b_products if p.get("discount_pct")]
        ratings   = [float(p["rating"])  for p in b_products if p.get("rating")]

        avg_price    = round(sum(prices)    / len(prices),    1) if prices    else 0
        avg_mrp      = round(sum(mrps)      / len(mrps),      1) if mrps      else 0
        avg_discount = round(sum(discounts) / len(discounts), 1) if discounts else 0
        avg_rating   = round(sum(ratings)   / len(ratings),   1) if ratings   else 0

        sentiment    = brand_sentiment_score(b_reviews)
        themes       = extract_themes(b_reviews)
        aspects      = aspect_sentiment(b_reviews, sia)
        trust        = trust_signals(b_reviews)
        vfm          = value_for_money(sentiment, avg_price)

        # Update individual product review counts based on actual reviews found
        asin_counts = Counter(r.get("asin") for r in b_reviews)
        for p in b_products:
            if "asin" in p:
                p["review_count"] = asin_counts[p["asin"]]

        insights[brand] = {
            "brand": brand,
            "product_count": len(b_products),
            "review_count": len(b_reviews),
            "avg_price": avg_price,
            "avg_mrp": avg_mrp,
            "avg_discount_pct": avg_discount,
            "avg_rating": avg_rating,
            "sentiment_score": sentiment,
            "themes": themes,
            "aspect_sentiment": aspects,
            "trust_signals": trust,
            "value_for_money": vfm,
            "products": b_products,
        }

    os.makedirs("../data", exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(insights, f, indent=2, ensure_ascii=False)

    print(f"\n[✓] insights.json saved with data for {len(insights)} brands")
    print("\nQuick summary:")
    for brand, data in insights.items():
        print(f"  {brand:20s} sentiment={data['sentiment_score']:5.1f}  "
              f"avg_price=₹{data['avg_price']:,.0f}  "
              f"value_index={data['value_for_money']['value_index']}")


if __name__ == "__main__":
    main()