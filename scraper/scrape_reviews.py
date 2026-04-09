import asyncio
import csv
import random
import os
from playwright.async_api import async_playwright

PRODUCTS_FILE = "../data/products.csv"
OUTPUT_FILE = "../data/reviews.csv"
REVIEWS_TARGET = 60  # reviews per product (aim for 50+)


async def scrape_reviews_for_asin(page, asin: str, brand: str) -> list[dict]:
    url = f"https://www.amazon.in/product-reviews/{asin}?pageNumber=1&sortBy=recent"
    reviews = []

    for page_num in range(1, 5):  # up to 4 pages = ~40-60 reviews
        try:
            paged_url = f"https://www.amazon.in/product-reviews/{asin}?pageNumber={page_num}&sortBy=recent"
            await page.goto(paged_url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(random.uniform(2, 3.5))

            review_cards = await page.query_selector_all("[data-hook='review']")
            if not review_cards:
                break

            for card in review_cards:
                try:
                    # Star rating
                    star_el = await card.query_selector("[data-hook='review-star-rating'] span")
                    star_text = (await star_el.inner_text()).strip() if star_el else ""
                    stars = float(star_text.split()[0]) if star_text else None

                    # Review title
                    title_el = await card.query_selector("[data-hook='review-title'] span:not([class])")
                    review_title = (await title_el.inner_text()).strip() if title_el else ""

                    # Review body
                    body_el = await card.query_selector("[data-hook='review-body'] span")
                    body = (await body_el.inner_text()).strip() if body_el else ""

                    # Date
                    date_el = await card.query_selector("[data-hook='review-date']")
                    date_text = (await date_el.inner_text()).strip() if date_el else ""

                    # Verified purchase
                    verified_el = await card.query_selector("[data-hook='avp-badge']")
                    verified = verified_el is not None

                    if body:  # only keep reviews with text
                        reviews.append({
                            "asin": asin,
                            "brand": brand,
                            "stars": stars,
                            "title": review_title,
                            "body": body,
                            "date": date_text,
                            "verified": verified,
                        })

                except Exception:
                    continue

            if len(reviews) >= REVIEWS_TARGET:
                break

        except Exception as e:
            print(f"    [!] Page {page_num} error for {asin}: {e}")
            break

    return reviews


async def main():
    # Load products
    with open(PRODUCTS_FILE, newline="", encoding="utf-8") as f:
        products = list(csv.DictReader(f))

    print(f"[→] Scraping reviews for {len(products)} products...")
    all_reviews = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, channel="chrome")
        context = await browser.new_context(
            storage_state="amazon_session.json",
            locale="en-IN",
    )
        page = await context.new_page()
        await page.route("**/*.{png,jpg,jpeg,gif,webp,woff,woff2,ttf}",
                         lambda route: route.abort())

        for i, product in enumerate(products):
            asin = product["asin"]
            brand = product["brand"]
            print(f"\n[{i+1}/{len(products)}] {brand} — {asin}")

            reviews = await scrape_reviews_for_asin(page, asin, brand)
            all_reviews.extend(reviews)
            print(f"    Got {len(reviews)} reviews")

            await asyncio.sleep(random.uniform(4, 7))

        await browser.close()

    # Save
    os.makedirs("../data", exist_ok=True)
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["asin", "brand", "stars", "title", "body", "date", "verified"])
        writer.writeheader()
        writer.writerows(all_reviews)

    print(f"\n[✓] Saved {len(all_reviews)} reviews to {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())