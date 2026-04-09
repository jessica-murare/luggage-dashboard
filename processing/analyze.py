import json
import re
import csv
import os
from collections import defaultdict, Counter
from itertools import islice
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

# ── Theme extraction (unigram + bigram + trigram) ──────────────────────────

STOPWORDS = {"i", "me", "my", "we", "our", "you", "your", "he", "she", "it",
             "its", "they", "them", "this", "that", "these", "those", "is", "am",
             "are", "was", "were", "be", "been", "being", "have", "has", "had",
             "do", "does", "did", "will", "would", "shall", "should", "may",
             "might", "can", "could", "a", "an", "the", "and", "but", "or",
             "for", "of", "in", "on", "at", "to", "from", "with", "as", "by",
             "so", "not", "no", "if", "also", "very", "too", "just", "all",
             "one", "only", "than", "then", "much", "more", "most", "well",
             "even", "about", "after", "before", "since", "because", "into",
             "over", "out", "up", "down", "when", "what", "which", "who",
             "how", "both", "each", "few", "many", "some", "any", "such"}

def _ngrams(words, n):
    """Yield n-grams from a list of words."""
    it = iter(words)
    window = list(islice(it, n))
    if len(window) == n:
        yield tuple(window)
    for w in it:
        window = window[1:] + [w]
        yield tuple(window)


def extract_themes(reviews: list[dict]) -> dict:
    """Extract top positive and negative *phrases* (unigram, bigram, trigram)."""
    pos_phrases = Counter()
    neg_phrases = Counter()

    positive_seeds = {"good", "great", "excellent", "amazing", "love", "perfect",
                      "smooth", "sturdy", "durable", "spacious", "lightweight",
                      "quality", "strong", "solid", "nice", "best", "happy",
                      "comfortable", "premium", "value", "worth", "recommend",
                      "stylish", "elegant", "reliable", "satisfied"}
    negative_seeds = {"bad", "broke", "broken", "poor", "cheap", "flimsy",
                      "damaged", "loose", "wobbly", "cracked", "disappointed",
                      "pathetic", "terrible", "worst", "waste", "defective",
                      "scratch", "scratches", "missing", "fake", "torn",
                      "leaked", "refund", "return", "complaint"}

    for r in reviews:
        text = r.get("body", "").lower()
        words = [w for w in re.findall(r'\b[a-z]+\b', text) if w not in STOPWORDS and len(w) > 2]
        compound = r.get("compound", 0)

        for n in (1, 2, 3):
            for gram in _ngrams(words, n):
                phrase = " ".join(gram)
                # Check if any seed word is in the n-gram
                has_pos = any(s in gram for s in positive_seeds)
                has_neg = any(s in gram for s in negative_seeds)

                if has_pos and compound > 0.05:
                    pos_phrases[phrase] += 1
                elif has_neg and compound < -0.05:
                    neg_phrases[phrase] += 1

    # Prefer multi-word phrases (boost bigrams/trigrams), filter out very rare
    def ranked(counter, top_n=5):
        scored = []
        for phrase, count in counter.items():
            if count < 2:
                continue
            word_count = len(phrase.split())
            # Boost multi-word: bigram x1.5, trigram x2.0
            boost = 1.0 + (word_count - 1) * 0.5
            scored.append((phrase, count * boost))
        scored.sort(key=lambda x: -x[1])
        return [p for p, _ in scored[:top_n]]

    return {
        "top_positives": ranked(pos_phrases),
        "top_negatives": ranked(neg_phrases),
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

# ── Per-product review synthesis ───────────────────────────────────────────

def product_review_synthesis(asin_reviews: dict, sia: SentimentIntensityAnalyzer) -> dict:
    """
    For each product ASIN, generate:
    - product_sentiment: 0-100 score
    - top_praise: top 3 positive phrases
    - top_complaints: top 3 negative phrases  
    - review_summary: one-line statistical summary
    """
    result = {}
    
    for asin, reviews in asin_reviews.items():
        if not reviews:
            continue
        
        # Score reviews
        scored = []
        for r in reviews:
            text = f"{r.get('title', '')} {r.get('body', '')}"
            comp = sia.polarity_scores(text)["compound"]
            scored.append({**r, "compound": comp})
        
        # Sentiment
        avg_comp = sum(s["compound"] for s in scored) / len(scored)
        prod_sentiment = round((avg_comp + 1) / 2 * 100, 1)
        
        # Extract themes for this product specifically
        themes = extract_themes(scored)
        
        # Star distribution
        stars = [float(r.get("stars", 3)) for r in scored]
        five_star_pct = round(sum(1 for s in stars if s >= 5) / len(stars) * 100)
        one_star_pct = round(sum(1 for s in stars if s <= 1) / len(stars) * 100)
        
        result[asin] = {
            "sentiment": prod_sentiment,
            "top_praise": themes["top_positives"][:3],
            "top_complaints": themes["top_negatives"][:3],
            "review_count": len(scored),
            "five_star_pct": five_star_pct,
            "one_star_pct": one_star_pct,
        }
    
    return result

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

        # Per-product review synthesis
        asin_reviews = defaultdict(list)
        for r in b_reviews:
            asin_reviews[r.get("asin", "")].append(r)
        per_product_synthesis = product_review_synthesis(asin_reviews, sia)

        # Update individual product review counts and attach synthesis
        for p in b_products:
            asin = p.get("asin", "")
            p["review_count"] = len(asin_reviews.get(asin, []))
            if asin in per_product_synthesis:
                p["review_synthesis"] = per_product_synthesis[asin]

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