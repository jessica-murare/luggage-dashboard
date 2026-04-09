import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            channel="chrome"  # uses your actual installed Chrome
        )
        context = await browser.new_context()
        page = await context.new_page()

        print("Opening Amazon India...")
        await page.goto("https://www.amazon.in")
        
        print("\n>>> Please log in to Amazon in the browser window.")
        print(">>> After logging in, press ENTER here to save your session.")
        input()

        await context.storage_state(path="amazon_session.json")
        print("[✓] Session saved to amazon_session.json")
        await browser.close()

asyncio.run(main())