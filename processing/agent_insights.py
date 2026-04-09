import json
import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()

INPUT_FILE  = "../data/insights.json"
OUTPUT_FILE = "../data/insights.json"

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def build_prompt(insights: dict) -> str:
    summary = []
    for brand, d in insights.items():
        summary.append(
            f"- {brand}: avg_price=₹{d['avg_price']}, "
            f"avg_discount={d['avg_discount_pct']}%, "
            f"avg_rating={d['avg_rating']}, "
            f"sentiment={d['sentiment_score']}/100, "
            f"value_index={d['value_for_money']['value_index']}, "
            f"price_band={d['value_for_money']['price_band']}, "
            f"top_positives={d['themes']['top_positives']}, "
            f"top_negatives={d['themes']['top_negatives']}, "
            f"aspect_sentiment={d['aspect_sentiment']}, "
            f"trust_flags={d['trust_signals'].get('flags', [])}"
        )
    data_block = "\n".join(summary)

    return f"""You are a competitive intelligence analyst. Below is scraped Amazon India data for 6 luggage brands.

{data_block}

Generate exactly 5 non-obvious, decision-ready insights that a brand manager or investor would find valuable.

Rules:
- Do NOT just restate the numbers. Explain what they MEAN.
- Look for contradictions (high rating but low sentiment, high discount but low value index).
- Look for anomalies (a brand punching above or below its price point).
- Look for actionable implications.
- Each insight must be 2-3 sentences.
- Return ONLY a JSON array of 5 strings, no other text.

Example format:
["Insight 1 here.", "Insight 2 here.", "Insight 3 here.", "Insight 4 here.", "Insight 5 here."]"""


def call_with_retry(prompt: str, retries: int = 3) -> list[str]:
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            raw = response.text.strip()

            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            raw = raw.strip()

            return json.loads(raw)

        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                wait = 65
                print(f"  Rate limited. Waiting {wait}s before retry {attempt+1}/{retries}...")
                time.sleep(wait)
            else:
                raise e

    raise Exception("All retries exhausted.")


def main():
    with open(INPUT_FILE, encoding="utf-8") as f:
        insights = json.load(f)

    print("[→] Building prompt...")
    prompt = build_prompt(insights)

    print("[→] Calling Gemini 2.0 Flash...")
    agent_insights = call_with_retry(prompt)

    print("\n[✓] Agent Insights generated:\n")
    for i, insight in enumerate(agent_insights, 1):
        print(f"  {i}. {insight}\n")

    for brand in insights:
        insights[brand]["agent_insights"] = agent_insights

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(insights, f, indent=2, ensure_ascii=False)

    print("[✓] insights.json updated with agent insights")


if __name__ == "__main__":
    main()