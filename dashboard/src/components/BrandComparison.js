import { useState } from 'react';
import Plot from 'react-plotly.js';

export default function BrandComparison({ brands }) {
  const [selected, setSelected] = useState(brands.map(b => b.brand));
  const [sortBy, setSortBy] = useState('sentiment_score');

  const filtered = brands
    .filter(b => selected.includes(b.brand))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

  const toggleBrand = (name) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  // Radar chart data per brand
  const radarData = filtered.map((b, i) => {
    const asp = b.aspect_sentiment;
    return {
      type: 'scatterpolar',
      r: [
        asp.wheels   ?? 50,
        asp.handle   ?? 50,
        asp.zipper   ?? 50,
        asp.material ?? 50,
        asp.size     ?? 50,
        asp.weight   ?? 50,
      ],
      theta: ['Wheels','Handle','Zipper','Material','Size','Weight'],
      fill: 'toself',
      name: b.brand,
      line: { color: COLORS[i % COLORS.length] },
      opacity: 0.6,
    };
  });

  return (
    <>
      <div className="page-header">
        <h1>Brand comparison</h1>
        <p>Compare pricing, sentiment, and aspect scores side by side</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="filter-label">Brands:</span>
        {brands.map(b => (
          <label key={b.brand} style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, cursor:'pointer' }}>
            <input
              type="checkbox"
              checked={selected.includes(b.brand)}
              onChange={() => toggleBrand(b.brand)}
            />
            {b.brand}
          </label>
        ))}
        <span className="filter-label" style={{ marginLeft:'auto' }}>Sort by:</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="sentiment_score">Sentiment</option>
          <option value="avg_price">Price</option>
          <option value="avg_discount_pct">Discount</option>
          <option value="avg_rating">Rating</option>
        </select>
      </div>

      {/* Bar charts row */}
      <div className="chart-row">
        <div className="card">
          <div className="card-title">Sentiment score</div>
          <Plot
            data={[{
              type: 'bar',
              x: filtered.map(b => b.brand),
              y: filtered.map(b => b.sentiment_score),
              marker: { color: filtered.map((_, i) => COLORS[i % COLORS.length]) },
              text: filtered.map(b => b.sentiment_score.toFixed(1)),
              textposition: 'outside',
            }]}
            layout={{
              height: 240,
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
          <div className="card-title">Value index</div>
          <Plot
            data={[{
              type: 'bar',
              x: filtered.map(b => b.brand),
              y: filtered.map(b => b.value_for_money.value_index),
              marker: { color: filtered.map((_, i) => COLORS[i % COLORS.length]) },
              text: filtered.map(b => b.value_for_money.value_index.toFixed(1)),
              textposition: 'outside',
            }]}
            layout={{
              height: 240,
              margin: { t: 10, b: 40, l: 40, r: 10 },
              yaxis: { gridcolor: '#f3f4f6' },
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

      {/* Radar chart */}
      <div className="card">
        <div className="card-title">Aspect sentiment radar</div>
        <Plot
          data={radarData}
          layout={{
            height: 380,
            polar: {
              radialaxis: { visible: true, range: [0, 100], gridcolor: '#e5e7eb' },
              angularaxis: { gridcolor: '#e5e7eb' },
            },
            paper_bgcolor: 'transparent',
            font: { family: 'inherit', size: 12 },
            legend: { orientation: 'h', y: -0.1 },
            margin: { t: 20, b: 60, l: 40, r: 40 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Comparison table */}
      <div className="card">
        <div className="card-title">Full comparison table</div>
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Avg price</th>
              <th>MRP</th>
              <th>Discount</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Sentiment</th>
              <th>Value index</th>
              <th>Band</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={b.brand}>
                <td style={{ fontWeight:500, color: COLORS[i % COLORS.length] }}>{b.brand}</td>
                <td>₹{b.avg_price.toLocaleString()}</td>
                <td>₹{b.avg_mrp.toLocaleString()}</td>
                <td>{b.avg_discount_pct.toFixed(1)}%</td>
                <td>{b.avg_rating.toFixed(1)} ★</td>
                <td>{b.review_count.toLocaleString()}</td>
                <td>
                  <span style={{ marginRight:6 }}>{b.sentiment_score.toFixed(1)}</span>
                  <span className="sentiment-bar">
                    <span className="sentiment-fill" style={{
                      width: `${b.sentiment_score}%`,
                      background: b.sentiment_score > 65 ? '#10b981' : b.sentiment_score > 55 ? '#f59e0b' : '#ef4444'
                    }}/>
                  </span>
                </td>
                <td>{b.value_for_money.value_index.toFixed(1)}</td>
                <td>
                  <span className={`badge ${
                    b.value_for_money.price_band === 'budget'    ? 'badge-green' :
                    b.value_for_money.price_band === 'mid-range' ? 'badge-blue'  : 'badge-amber'
                  }`}>{b.value_for_money.price_band}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}