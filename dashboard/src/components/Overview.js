import { useState } from 'react';
import Plot from 'react-plotly.js';

export default function Overview({ brands }) {
  const [sortCol, setSortCol] = useState('sentiment_score');
  const [sortAsc, setSortAsc] = useState(false);

  const total_products = brands.reduce((s, b) => s + b.product_count, 0);
  const total_reviews  = brands.reduce((s, b) => s + b.review_count, 0);
  const avg_sentiment  = (brands.reduce((s, b) => s + b.sentiment_score, 0) / brands.length).toFixed(1);
  const avg_discount   = (brands.reduce((s, b) => s + b.avg_discount_pct, 0) / brands.length).toFixed(1);

  const sorted = [...brands].sort((a, b) => {
    const va = typeof a[sortCol] === 'object' ? a[sortCol]?.value_index ?? 0 : a[sortCol];
    const vb = typeof b[sortCol] === 'object' ? b[sortCol]?.value_index ?? 0 : b[sortCol];
    return sortAsc ? va - vb : vb - va;
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const thClass = (col) => `sortable ${sortCol === col ? (sortAsc ? 'sort-active sort-asc' : 'sort-active') : ''}`;

  const names     = brands.map(b => b.brand);
  const sentiment = brands.map(b => b.sentiment_score);
  const prices    = brands.map(b => b.avg_price);
  const discounts = brands.map(b => b.avg_discount_pct);

  // Modern SaaS Color Palette
  const COLORS = ['#2563eb', '#0ea5e9', '#0d9488', '#eab308', '#f97316', '#8b5cf6'];

  // Find the brand with best and worst sentiment for highlights
  const bestBrand = [...brands].sort((a, b) => b.sentiment_score - a.sentiment_score)[0];
  const worstBrand = [...brands].sort((a, b) => a.sentiment_score - b.sentiment_score)[0];

  return (
    <>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Market snapshot for Amazon India Luggage category — 6 brands tracked</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Brands Tracked</div>
          <div className="kpi-value">6</div>
          <div className="kpi-sub">Safari, Skybags, AT, VIP, Aristocrat, NM</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Supply</div>
          <div className="kpi-value">{total_products}</div>
          <div className="kpi-sub">Unique products analyzed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Review Volume</div>
          <div className="kpi-value">{total_reviews.toLocaleString()}</div>
          <div className="kpi-sub">Real Amazon Indian reviews</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Market Avg Sentiment</div>
          <div className="kpi-value">{avg_sentiment}<span style={{fontSize:16,fontWeight:500,color:'var(--text-light)'}}>/100</span></div>
          <div className="kpi-sub">Avg discount {avg_discount}% off MRP</div>
        </div>
      </div>

      <div className="chart-row">
        <div className="card">
          <div className="card-title">Sentiment Score Distribution</div>
          <Plot
            data={[{
              type: 'bar',
              x: names,
              y: sentiment,
              marker: { color: COLORS, line: { width: 0 } },
              text: sentiment.map(s => s.toFixed(1)),
              textposition: 'outside',
              textfont: { size: 12, color: 'var(--text-muted)', family: 'Inter' }
            }]}
            layout={{
              height: 260,
              margin: { t: 10, b: 40, l: 40, r: 10 },
              yaxis: { range: [0, 100], gridcolor: '#f1f5f9', zerolinecolor: '#e2e8f0', tickfont: { color: '#64748b' } },
              xaxis: { tickfont: { color: '#64748b', weight: 500 } },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              showlegend: false,
              font: { family: 'Inter, sans-serif' },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="card">
          <div className="card-title">Price vs Discount Positioning</div>
          <Plot
            data={[{
              type: 'scatter',
              mode: 'markers+text',
              x: prices,
              y: discounts,
              text: names,
              textposition: 'top center',
              marker: { color: COLORS, size: 16, line: { color: 'white', width: 2 } },
              textfont: { size: 11, color: 'var(--text-main)', family: 'Inter' }
            }]}
            layout={{
              height: 260,
              margin: { t: 10, b: 40, l: 50, r: 10 },
              xaxis: { title: 'Avg Selling Price (₹)', titlefont: { size: 12, color: '#64748b' }, gridcolor: '#f1f5f9', tickfont: { color: '#64748b' } },
              yaxis: { title: 'Avg Discount %', titlefont: { size: 12, color: '#64748b' }, gridcolor: '#f1f5f9', tickfont: { color: '#64748b' } },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              showlegend: false,
              font: { family: 'Inter, sans-serif' },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Top pros and cons across brands */}
      <div className="chart-row">
        <div className="card">
          <div className="card-title">Market Leader: Praised Themes — {bestBrand.brand}</div>
          {(bestBrand?.themes?.top_positives || []).map((t, i) => (
            <div className="theme-item" key={i}>
              <span className="theme-number positive">{i+1}</span>
              <span className="theme-text">{t}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Market Laggard: Complaint Themes — {worstBrand.brand}</div>
          {(worstBrand?.themes?.top_negatives || []).map((t, i) => (
            <div className="theme-item" key={i}>
              <span className="theme-number negative">{i+1}</span>
              <span className="theme-text">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Full Market Snapshot</div>
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th className={thClass('avg_price')} onClick={() => handleSort('avg_price')}>Avg Price</th>
              <th className={thClass('avg_discount_pct')} onClick={() => handleSort('avg_discount_pct')}>Avg Discount</th>
              <th className={thClass('avg_rating')} onClick={() => handleSort('avg_rating')}>Avg Rating</th>
              <th className={thClass('sentiment_score')} onClick={() => handleSort('sentiment_score')}>Sentiment</th>
              <th className={thClass('value_for_money')} onClick={() => handleSort('value_for_money')}>Value Index</th>
              <th>Price Band</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => (
              <tr key={b.brand}>
                <td style={{ fontWeight: 600 }}>{b.brand}</td>
                <td className="numeric">₹{b.avg_price.toLocaleString()}</td>
                <td className="numeric">{b.avg_discount_pct.toFixed(1)}%</td>
                <td className="numeric">{b.avg_rating.toFixed(1)} ★</td>
                <td>
                  <div className="sentiment-wrapper">
                    <span className="sentiment-score">{b.sentiment_score.toFixed(1)}</span>
                    <div className="sentiment-bar">
                      <div
                        className="sentiment-fill"
                        style={{
                          width: `${b.sentiment_score}%`,
                          background: b.sentiment_score > 65 ? '#10b981' : b.sentiment_score > 55 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="numeric">{b.value_for_money.value_index.toFixed(1)}</td>
                <td>
                  <span className={`badge ${
                    b.value_for_money.price_band === 'budget'    ? 'badge-green' :
                    b.value_for_money.price_band === 'mid-range' ? 'badge-blue'  : 'badge-amber'
                  }`}>
                    {b.value_for_money.price_band}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}