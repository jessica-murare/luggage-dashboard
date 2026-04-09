# Luggage Intelligence Dashboard

> Competitive intelligence dashboard for luggage brands on Amazon India — built for the Moonshot AI Agent Internship Assignment.

Live demo: [luggage-dashboard.vercel.app](https://luggage-dashboard-idlafg0yg-khushis-projects-23d23acc.vercel.app/)  
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
- Theme extraction surfacing top positive and negative keywords per brand

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
- LLM-generated analysis using Gemini / Groq API
- 5 non-obvious, decision-ready conclusions per dataset
- Identifies contradictions, anomalies, and actionable implications across brands

### Interactive dashboard
- 4-view React dashboard: Overview, Brand Comparison, Product Drilldown, Agent Insights
- Plotly charts: bar charts, scatter plots, radar chart for aspect comparison
- Filters: brand selector, minimum rating, maximum price, sort controls
- Per-product detail panel with Amazon link
- Sentiment progress bars and color-coded badges

---

## Tech stack

| Layer | Technology |
|---|---|
| Scraping | Python, Playwright |
| Data processing | Pandas, NLTK (VADER) |
| LLM integration | Gemini 2.0 Flash / Groq llama3-70b |
| Frontend | React, Plotly.js, react-plotly.js |
| Deployment | Vercel |

---

## Project structure
luggage-dashboard/
├── scraper/
│   ├── scrape_products.py       # scrapes product listings from Amazon India
│   ├── scrape_reviews.py        # scrapes reviews per product ASIN
│   ├── save_session.py          # saves Amazon login session for authenticated scraping
│   └── mock_data.py             # generates realistic fallback dataset
├── processing/
│   ├── analyze.py               # sentiment, aspects, trust signals, value-for-money
│   └── agent_insights.py        # LLM-generated competitive insights
├── data/
│   ├── products.csv             # cleaned product data (90 products, 6 brands)
│   ├── reviews.csv              # cleaned review data (3,252 real Amazon reviews)
│   └── insights.json            # fully processed brand intelligence output
├── dashboard/
│   ├── src/
│   │   ├── App.js               # root component with sidebar navigation
│   │   ├── App.css              # global styles
│   │   ├── data/
│   │   │   └── insights.json    # copy of processed data for the frontend
│   │   └── components/
│   │       ├── Overview.js      # KPI cards, sentiment bar chart, snapshot table
│   │       ├── BrandComparison.js  # radar chart, bar charts, comparison table
│   │       ├── ProductDrilldown.js # product list, aspect chart, pros/cons
│   │       └── AgentInsights.js    # LLM insights, trust signal table
│   └── package.json
├── .gitignore
└── README.md

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

### 5. Run the analysis pipeline

```bash
cd processing
python analyze.py
python agent_insights.py
```

### 6. Start the dashboard

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
| Products | 90 (15 per brand) |
| Reviews | 3,252 real Amazon India reviews |
| Aspects tracked | 6 (wheels, handle, zipper, material, size, weight) |

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

## Limitations

- Amazon scraping is subject to bot detection and may require re-authentication periodically
- VADER sentiment is lexicon-based and may miss sarcasm or domain-specific language
- Aspect extraction uses keyword matching rather than NLP, which can produce false positives
- Review data reflects a snapshot in time and may not represent current brand performance
- The value-for-money index uses a simplified normalization and does not account for product category differences
- Agent insights depend on LLM API availability and free tier rate limits

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
- Add anomaly detection to flag products with high ratings despite negative review text

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

