import Plot from 'react-plotly.js';

export default function Overview({ brands }) {
  const total_products = brands.reduce((s, b) => s + b.product_count, 0);
  const total_reviews  = brands.reduce((s, b) => s + b.review_count, 0);
  const avg_sentiment  = (brands.reduce((s, b) => s + b.sentiment_score, 0) / brands.length).toFixed(1);
  const avg_discount   = (brands.reduce((s, b) => s + b.avg_discount_pct, 0) / brands.length).toFixed(1);

  const names     = brands.map(b => b.brand);
  const sentiment = brands.map(b => b.sentiment_score);
  const prices    = brands.map(b => b.avg_price);
  const discounts = brands.map(b => b.avg_discount_pct);
  const ratings   = brands.map(b => b.avg_rating);

  const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

  return (
    <>
      <div className="page-header">
        <h1>Dashboard overview</h1>
        <p>Amazon India luggage — 6 brands tracked</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Brands tracked</div>
          <div className="kpi-value">6</div>
          <div className="kpi-sub">Safari, Skybags, AT, VIP, Aristocrat, NM</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Products analysed</div>
          <div className="kpi-value">{total_products}</div>
          <div className="kpi-sub">Across all brands</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Reviews analysed</div>
          <div className="kpi-value">{total_reviews.toLocaleString()}</div>
          <div className="kpi-sub">Real Amazon India reviews</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg sentiment</div>
          <div className="kpi-value">{avg_sentiment}<span style={{fontSize:14,fontWeight:400,color:'#6b7280'}}>/100</span></div>
          <div className="kpi-sub">Avg discount {avg_discount}% off MRP</div>
        </div>
      </div>

      <div className="chart-row">
        <div className="card">
          <div className="card-title">Sentiment score by brand</div>
          <Plot
            data={[{
              type: 'bar',
              x: names,
              y: sentiment,
              marker: { color: COLORS },
              text: sentiment.map(s => s.toFixed(1)),
              textposition: 'outside',
            }]}
            layout={{
              height: 260,
              margin: { t: 10, b: 40, l: 40, r: 10 },
              yaxis: { range: [0, 100], gridcolor: '#f3f4f6' },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              showlegend: false,
              font: { family: 'inherit', size: 12 },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="card">
          <div className="card-title">Average price vs discount %</div>
          <Plot
            data={[{
              type: 'scatter',
              mode: 'markers+text',
              x: prices,
              y: discounts,
              text: names,
              textposition: 'top center',
              marker: { color: COLORS, size: 14 },
            }]}
            layout={{
              height: 260,
              margin: { t: 10, b: 40, l: 50, r: 10 },
              xaxis: { title: 'Avg price (₹)', gridcolor: '#f3f4f6' },
              yaxis: { title: 'Avg discount %', gridcolor: '#f3f4f6' },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              showlegend: false,
              font: { family: 'inherit', size: 12 },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Brand snapshot</div>
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Avg price</th>
              <th>Avg discount</th>
              <th>Avg rating</th>
              <th>Sentiment</th>
              <th>Value index</th>
              <th>Price band</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b, i) => (
              <tr key={b.brand}>
                <td style={{ fontWeight: 500 }}>{b.brand}</td>
                <td>₹{b.avg_price.toLocaleString()}</td>
                <td>{b.avg_discount_pct.toFixed(1)}%</td>
                <td>{b.avg_rating.toFixed(1)} ★</td>
                <td>
                  <span style={{ marginRight: 8 }}>{b.sentiment_score.toFixed(1)}</span>
                  <span className="sentiment-bar">
                    <span
                      className="sentiment-fill"
                      style={{
                        width: `${b.sentiment_score}%`,
                        background: b.sentiment_score > 65 ? '#10b981' : b.sentiment_score > 55 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </span>
                </td>
                <td>{b.value_for_money.value_index.toFixed(1)}</td>
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