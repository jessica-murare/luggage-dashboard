# Luggage Intelligence Dashboard

> Competitive intelligence dashboard for luggage brands on Amazon India — built for the Moonshot AI Agent Internship Assignment.

Live demo: [luggage-dashboard.vercel.app](https://luggage-dashboard.vercel.app)  
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