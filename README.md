# Luggage Intelligence Dashboard

> Competitive intelligence dashboard for luggage brands on Amazon India — built for the Moonshot AI Agent Internship Assignment.

Live demo: [luggage-dashboard.vercel.app](https://luggage-dashboard-one.vercel.app/)  
GitHub: [github.com/jessica-murare/luggage-dashboard](https://github.com/jessica-murare/luggage-dashboard)

---

## Overview

This project scrapes, analyzes, and visualizes Amazon India product and review data for 6 major luggage brands — Safari, Skybags, American Tourister, VIP, Aristocrat, and Nasher Miles. It turns raw marketplace signals into a decision-ready competitive intelligence dashboard.

The core workflow is: **Scrape → Analyze → Compare → Present**

---

## Features

### Data collection
- Playwright-based scraper that collects product listings from Amazon India search results
- Per-product review scraper with session-based authentication to bypass login walls
- Anti-bot measures including realistic user-agent, request delays, and image/font blocking
- Fallback mock dataset generator for development and demo purposes

### Sentiment analysis
- VADER-based sentiment scoring for every review
- Overall brand sentiment score mapped to a 0–100 scale
- Aspect-level sentiment extraction for 6 product dimensions: wheels, handle, zipper, material, size, and weight
- Theme extraction using unigram, bigram, and trigram analysis with boost scoring for multi-word phrases
- Per-product review synthesis with sentiment, star distribution, top praise, and top complaint themes

### Pricing insights
- Average selling price and MRP per brand
- Average discount percentage per brand
- Price band classification: budget, mid-range, and premium
- Value-for-money index: sentiment score adjusted by normalized price

### Trust signal detection
- Verified purchase percentage per brand
- Rating skew detection (unusual concentration of 5-star and 1-star reviews)
- Repetition score (duplicate review body detection)
- Automated flag generation for suspicious patterns

### Agent insights
- 5 data-driven competitive insights computed from brand metrics (sentiment-rating paradox, value vs discount, hidden aspect weaknesses, pricing positioning, trust signal patterns)
- Context-aware recommendations matched to each insight
- Falls back to LLM-generated insights via Gemini 2.0 Flash when available
- Anomaly detection: cross-references aspect sentiment vs ratings, discounts vs value index
- Risk alert classification with CRITICAL/MODERATE severity levels and visual progress bars

### Interactive dashboard
- 4-view React dashboard: Overview, Brand Comparison, Product Drilldown, Agent Insights
- Stitch-designed premium UI with Inter + Manrope typography, Material Symbols icons, and glassmorphism effects
- Plotly charts: sentiment bar chart, price vs discount scatter, radar chart for aspect comparison
- Filters: brand toggle pills, minimum rating, sentiment threshold, price range slider, sortable tables
- Per-product detail card with Amazon link, review synthesis, praise/complaint theme pills
- Bento-grid layout with animated hover cards and color-coded pill badges
- Empty state design patterns and recently viewed product carousel
- Market leader/laggard theme cards on the Overview page

---

## Tech stack

| Layer | Technology |
|---|---|
| Scraping | Python, Playwright |
| Data processing | Pandas, NLTK (VADER) |
| LLM integration | Gemini 2.0 Flash (optional) |
| Frontend | React 19, Plotly.js, Tailwind CSS (CDN) |
| Design system | Google Stitch (exported) |
| Deployment | Vercel (static) |

---

## Project structure
```
luggage-dashboard/
├── scraper/
│   ├── scrape_products.py       # scrapes product listings from Amazon India
│   ├── scrape_reviews.py        # scrapes reviews per product ASIN
│   ├── save_session.py          # saves Amazon login session for authenticated scraping
│   └── mock_data.py             # generates realistic fallback dataset
├── processing/
│   ├── analyze.py               # sentiment, aspects, themes, trust signals, review synthesis
│   ├── agent_insights.py        # LLM-generated competitive insights (optional)
│   └── clean_data.py            # data cleanup: dedup reviews, fix prices, backfill counts
├── data/
│   ├── products.csv             # cleaned product data (85 products, 6 brands)
│   ├── reviews.csv              # cleaned review data (731 reviews)
│   └── insights.json            # fully processed brand intelligence output
├── dashboard/
│   ├── public/
│   │   └── index.html           # Tailwind config, Google Fonts, Material Symbols
│   ├── src/
│   │   ├── App.js               # root component with sidebar navigation
│   │   ├── App.css              # global styles
│   │   ├── data/
│   │   │   └── insights.json    # copy of processed data for the frontend
│   │   └── components/
│   │       ├── Overview.js      # KPI cards, sentiment chart, market snapshot table
│   │       ├── BrandComparison.js  # radar chart, brand toggles, comparison table
│   │       ├── ProductDrilldown.js # product catalog, review synthesis, aspect bars
│   │       └── AgentInsights.js    # computed insights, anomaly detection, trust signals
│   └── package.json
├── .gitignore
└── README.md

```
---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA PIPELINE                            │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │   Scraper    │    │  Processor   │    │   LLM Agent       │  │
│  │             │    │              │    │                   │  │
│  │ Playwright  │───▶│  VADER NLP   │───▶│  Gemini 2.0 Flash │  │
│  │ Amazon.in   │    │  Pandas      │    │  5 conclusions    │  │
│  │             │    │              │    │                   │  │
│  └──────┬──────┘    └──────┬───────┘    └────────┬──────────┘  │
│         │                  │                      │             │
│         ▼                  ▼                      ▼             │
│  products.csv        insights.json          insights.json      │
│  reviews.csv        (+ sentiment,          (+ agent_insights)  │
│                      aspects, trust)                           │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REACT DASHBOARD                             │
│                                                                 │
│  ┌───────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────┐  │
│  │ Overview  │ │  Brand     │ │ Product   │ │   Agent      │  │
│  │           │ │ Comparison │ │ Drilldown │ │  Insights    │  │
│  │ KPIs      │ │ Radar      │ │ Filters   │ │  Anomalies   │  │
│  │ Charts    │ │ Sort/Filter│ │ Details   │ │  Trust       │  │
│  └───────────┘ └────────────┘ └───────────┘ └──────────────┘  │
│                                                                 │
│  Deployed on Vercel · Static JSON bundled at build time         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setup and installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/jessica-murare/luggage-dashboard.git
cd luggage-dashboard
```

### 2. Set up Python environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac / Linux
source .venv/bin/activate

pip install playwright pandas nltk google-genai python-dotenv
playwright install chromium
python -c "import nltk; nltk.download('vader_lexicon')"
```

### 3. Configure environment variables

Create a `.env` file inside the `processing/` folder:
GEMINI_API_KEY=your_gemini_api_key_here

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).

### 4. Run the scraper

```bash
cd scraper

# Save your Amazon India session (opens a browser — log in, then press Enter)
python save_session.py

# Scrape product listings
python scrape_products.py

# Scrape reviews (takes 15–25 minutes for 90 products)
python scrape_reviews.py
```

If scraping is blocked, use the fallback mock dataset:

```bash
python mock_data.py
```

### 5. Clean the data (optional)

```bash
cd processing
python clean_data.py
```

This removes duplicate reviews, drops products with missing prices, and backfills review counts.

### 6. Run the analysis pipeline

```bash
python analyze.py
python agent_insights.py   # optional — requires GEMINI_API_KEY
```

> Note: `agent_insights.py` is optional. The dashboard computes 5 data-driven insights automatically from the processed metrics. Running this script adds LLM-generated insights that take precedence when available.

### 7. Start the dashboard

```bash
cp ../data/insights.json ../dashboard/src/data/insights.json

cd ../dashboard
npm install
npm start
```

The dashboard opens at `http://localhost:3000`.

---

## Data scope

| Metric | Value |
|---|---|
| Brands | 6 (Safari, Skybags, American Tourister, VIP, Aristocrat, Nasher Miles) |
| Products | 85 unique products across 6 brands |
| Reviews | 731 reviews (deduplicated across ASIN variants) |
| Aspects tracked | 6 (wheels, handle, zipper, material, size, weight) |
| Theme extraction | Unigram + bigram + trigram with boost scoring |

---

## Methodology

### Sentiment scoring
Each review body and title is scored using NLTK's VADER (Valence Aware Dictionary and sEntiment Reasoner), which is well-suited for short, informal text like product reviews. The compound score (-1 to +1) is linearly mapped to a 0–100 scale. Brand-level sentiment is the average of all review scores for that brand.

### Aspect-level sentiment
Reviews mentioning aspect-specific keywords (e.g. "wheel", "zipper", "handle") are identified using keyword matching. The VADER score of each matching review is averaged per aspect per brand. Aspects with insufficient mentions return null.

### Value-for-money index
The value index is computed as `sentiment_score / normalized_price`, where price is normalized to a 1–10 scale based on the ₹1,000–₹15,000 range observed in the dataset. A higher value index means the brand delivers more customer satisfaction per rupee spent.

### Trust signals
Three signals are computed per brand: verified purchase rate, rating skew (% of reviews that are 5-star or 1-star), and repetition score (% of duplicate review bodies). Brands crossing thresholds receive automated flags.

---

## Deployment

The dashboard is deployed on Vercel as a static React app. No backend is required — all data is bundled as a JSON file at build time.

To deploy your own instance:

1. Fork the repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set root directory to `dashboard`
4. Set build command to `npm run build`
5. Deploy

---

## Known limitations

- Amazon scraping is subject to bot detection and may require re-authentication periodically
- VADER sentiment is lexicon-based and may miss sarcasm or domain-specific language
- Aspect extraction uses keyword matching rather than NLP, which can produce false positives
- Review data reflects a snapshot in time and may not represent current brand performance
- The value-for-money index uses a simplified normalization and does not account for product category differences
- Amazon shows the same review pool for color/size variants, which can cause cross-ASIN duplication — `clean_data.py` deduplicates by (ASIN + title + body) but some shared reviews may persist across variants
- Some products appear under incorrect brands due to Amazon's cross-brand search results (e.g. FUR JADEN appearing under Safari)
- Product titles for Safari are truncated to just "Safari" in some listings due to scraper capturing the brand field instead of the full title
- No luggage category or size classification is scraped — only the product title is available for size identification

---

## Future scope and improvements

### Data collection
- Add pagination to scrape 3–5 pages of search results per brand (currently 1 page = 15 products)
- Implement rotating proxies or residential IPs for more reliable scraping at scale
- Schedule automated weekly scraping using GitHub Actions or a cron job
- Add support for more brands and product categories beyond hard luggage

### NLP and analysis
- Replace keyword-based aspect extraction with a fine-tuned ABSA (Aspect-Based Sentiment Analysis) model
- Use sentence embeddings to cluster review themes rather than simple keyword frequency
- Add multilingual support for Hindi reviews which are common on Amazon India
- Implement time-series sentiment tracking to detect brand reputation trends over months

### Dashboard
- Add a date range filter to compare brand performance across time periods
- Build a price simulator showing how a price change would affect value index ranking
- Add export functionality to download filtered data as CSV or PDF report
- Implement real-time data refresh by connecting to a lightweight backend API
- Add mobile-responsive layout
- Build an email digest feature that sends weekly competitive intelligence summaries

### LLM integration
- Move from one-shot insight generation to a conversational agent that answers questions about the data
- Add RAG over the full review corpus for deeper Q&A
- Generate per-brand strategy recommendations based on pricing and sentiment gaps
- Auto-detect emerging complaint themes week over week and surface them proactively

### Infrastructure
- Add a PostgreSQL or SQLite database to persist scraped data across runs
- Build a FastAPI backend to serve live data instead of a static JSON file
- Containerize the scraping pipeline with Docker for reproducibility
- Add a CI/CD pipeline with GitHub Actions to run analysis and redeploy automatically

---

## Author

Built by [jessica-murare](https://github.com/jessica-murare) for the Moonshot AI Agent Internship Assignment.

