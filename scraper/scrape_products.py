import asyncio
import csv
import random
import time
from playwright.async_api import async_playwright

BRANDS = [
    "Safari luggage",
    "Skybags luggage",
    "American Tourister luggage",
    "VIP luggage",
    "Aristocrat luggage",
    "Nasher Miles luggage",
]

HEADERS = {
    "user-agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

OUTPUT_FILE = "../data/products.csv"

async def search_brand(page, brand: str) -> list[dict]:
    query = brand.replace(" ", "+")
    url = f"https://www.amazon.in/s?k={query}"

    print(f"\n[→] Searching: {brand}")
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    await asyncio.sleep(random.uniform(2.5, 4.5))  # polite delay

    products = []

    # Grab all product cards on the search results page
    cards = await page.query_selector_all('[data-component-type="s-search-result"]')
    print(f"    Found {len(cards)} cards on page")

    for card in cards[:15]:  # max 15 per brand per page
        try:
            asin = await card.get_attribute("data-asin")
            if not asin:
                continue

            # Title
            title_el = await card.query_selector("h2 span.a-text-normal")
            if not title_el:
                title_el = await card.query_selector("h2 a span")
            if not title_el:
                title_el = await card.query_selector("[data-cy='title-recipe'] h2 span")
            title = (await title_el.inner_text()).strip() if title_el else ""

            # Rating
            rating_el = await card.query_selector("span.a-icon-alt")
            rating_text = (await rating_el.inner_text()).strip() if rating_el else ""
            rating = float(rating_text.split()[0]) if rating_text else None

            # Review count
            review_el = await card.query_selector("span.a-size-base.s-underline-text")
            review_count_text = (await review_el.inner_text()).strip() if review_el else "0"
            review_count = int(review_count_text.replace(",", "").replace("(", "").replace(")", "")) if review_count_text else 0

            # Current price
            price_el = await card.query_selector("span.a-price span.a-offscreen")
            price_text = (await price_el.inner_text()).strip() if price_el else ""
            price = float(price_text.replace("₹", "").replace(",", "")) if price_text else None

            # MRP (original price)
            mrp_el = await card.query_selector("span.a-price.a-text-price span.a-offscreen")
            mrp_text = (await mrp_el.inner_text()).strip() if mrp_el else ""
            mrp = float(mrp_text.replace("₹", "").replace(",", "")) if mrp_text else price

            # Discount %
            discount = round((1 - price / mrp) * 100) if price and mrp and mrp > 0 else 0

            products.append({
                "asin": asin,
                "brand": brand.replace(" luggage", "").strip(),
                "title": title,
                "rating": rating,
                "review_count": review_count,
                "price": price,
                "mrp": mrp,
                "discount_pct": discount,
                "url": f"https://www.amazon.in/dp/{asin}",
            })

        except Exception as e:
            print(f"    [!] Error parsing card: {e}")
            continue

    print(f"    Scraped {len(products)} products for {brand}")
    return products

async def main():
    all_products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent=HEADERS["user-agent"],
            viewport={"width": 1366, "height": 768},
            locale="en-IN",
        )
        page = await context.new_page()

        # Block images and fonts to speed things up
        await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf}", 
                         lambda route: route.abort())

        for brand in BRANDS:
            try:
                products = await search_brand(page, brand)
                all_products.extend(products)
                # Polite gap between brands
                await asyncio.sleep(random.uniform(3, 6))
            except Exception as e:
                print(f"[!!] Failed for {brand}: {e}")

        await browser.close()

    # Save to CSV
    if all_products:
        import os
        os.makedirs("../data", exist_ok=True)
        with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=all_products[0].keys())
            writer.writeheader()
            writer.writerows(all_products)
        print(f"\n[✓] Saved {len(all_products)} products to {OUTPUT_FILE}")
    else:
        print("\n[!] No products scraped. Amazon may have blocked. Use mock_data.py instead.")


if __name__ == "__main__":
    asyncio.run(main())