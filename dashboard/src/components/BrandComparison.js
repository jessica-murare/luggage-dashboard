import { useState } from 'react';
import Plot from 'react-plotly.js';

export default function BrandComparison({ brands }) {
  const [selected, setSelected] = useState(brands.map(b => b.brand));
  const [sortBy, setSortBy] = useState('sentiment_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [minSentiment, setMinSentiment] = useState(0);

  const filtered = brands
    .filter(b => selected.includes(b.brand))
    .filter(b => b.sentiment_score >= minSentiment)
    .sort((a, b) => {
      const va = a[sortBy] ?? 0;
      const vb = b[sortBy] ?? 0;
      return sortAsc ? va - vb : vb - va;
    });

  const COLORS = ['#2563eb', '#0ea5e9', '#0d9488', '#eab308', '#f97316', '#8b5cf6'];

  const toggleBrand = (name) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortAsc(!sortAsc);
    else { setSortBy(col); setSortAsc(false); }
  };

  const thClass = (col) => `sortable ${sortBy === col ? (sortAsc ? 'sort-active sort-asc' : 'sort-active') : ''}`;

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
        <h1>Brand Comparison</h1>
        <p>Compare pricing, sentiment, and aspect scores side by side</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="filter-label">Compare Brands:</span>
        {brands.map(b => (
          <label key={b.brand} style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer', fontWeight: selected.includes(b.brand) ? 600 : 400, color: selected.includes(b.brand) ? 'var(--text-main)' : 'var(--text-light)' }}>
            <input
              type="checkbox"
              checked={selected.includes(b.brand)}
              onChange={() => toggleBrand(b.brand)}
            />
            {b.brand}
          </label>
        ))}

        <span className="filter-label" style={{ marginLeft: 'auto' }}>Min Sentiment:</span>
        <select value={minSentiment} onChange={e => setMinSentiment(parseFloat(e.target.value))}>
          {[0, 50, 55, 60, 65, 70].map(v => <option key={v} value={v}>{v === 0 ? 'Any' : `${v}+`}</option>)}
        </select>
      </div>

      {/* Bar charts row */}
      <div className="chart-row">
        <div className="card">
          <div className="card-title">Sentiment Score Distribution</div>
          <Plot
            data={[{
              type: 'bar',
              x: filtered.map(b => b.brand),
              y: filtered.map(b => b.sentiment_score),
              marker: { color: filtered.map((_, i) => COLORS[i % COLORS.length]) },
              text: filtered.map(b => b.sentiment_score.toFixed(1)),
              textposition: 'outside',
              textfont: { size: 12, color: 'var(--text-muted)', family: 'Inter' }
            }]}
            layout={{
              height: 240,
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
          <div className="card-title">Value Index (Price adjusted sentiment)</div>
          <Plot
            data={[{
              type: 'bar',
              x: filtered.map(b => b.brand),
              y: filtered.map(b => b.value_for_money.value_index),
              marker: { color: filtered.map((_, i) => COLORS[i % COLORS.length]) },
              text: filtered.map(b => b.value_for_money.value_index.toFixed(1)),
              textposition: 'outside',
              textfont: { size: 12, color: 'var(--text-muted)', family: 'Inter' }
            }]}
            layout={{
              height: 240,
              margin: { t: 10, b: 40, l: 40, r: 10 },
              yaxis: { gridcolor: '#f1f5f9', zerolinecolor: '#e2e8f0', tickfont: { color: '#64748b' } },
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
      </div>

      {/* Radar chart */}
      <div className="card">
        <div className="card-title">Aspect Sentiment Radar</div>
        <Plot
          data={radarData}
          layout={{
            height: 380,
            polar: {
              radialaxis: { visible: true, range: [0, 100], gridcolor: '#e2e8f0', tickangle: 0, tickfont: { size: 10, color: '#94a3b8' } },
              angularaxis: { gridcolor: '#e2e8f0', tickfont: { size: 12, color: '#64748b' } },
            },
            paper_bgcolor: 'transparent',
            font: { family: 'Inter, sans-serif', size: 12 },
            legend: { orientation: 'h', y: -0.1 },
            margin: { t: 20, b: 60, l: 40, r: 40 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Comparison table */}
      <div className="card">
        <div className="card-title">Full Comparison Table <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-light)', marginLeft: 8 }}>Click any column header to sort</span></div>
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th className={thClass('avg_price')} onClick={() => handleSort('avg_price')}>Avg Price</th>
              <th className={thClass('avg_mrp')} onClick={() => handleSort('avg_mrp')}>MRP</th>
              <th className={thClass('avg_discount_pct')} onClick={() => handleSort('avg_discount_pct')}>Discount</th>
              <th className={thClass('avg_rating')} onClick={() => handleSort('avg_rating')}>Rating</th>
              <th className={thClass('review_count')} onClick={() => handleSort('review_count')}>Reviews</th>
              <th className={thClass('sentiment_score')} onClick={() => handleSort('sentiment_score')}>Sentiment</th>
              <th className={thClass('value_for_money')} onClick={() => handleSort('value_for_money')}>Value Index</th>
              <th>Band</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={b.brand}>
                <td style={{ fontWeight: 600, color: COLORS[i % COLORS.length] }}>{b.brand}</td>
                <td className="numeric">₹{b.avg_price.toLocaleString()}</td>
                <td className="numeric">₹{b.avg_mrp.toLocaleString()}</td>
                <td className="numeric">{b.avg_discount_pct.toFixed(1)}%</td>
                <td className="numeric">{b.avg_rating.toFixed(1)} ★</td>
                <td className="numeric">{b.review_count.toLocaleString()}</td>
                <td>
                  <div className="sentiment-wrapper">
                    <span className="sentiment-score">{b.sentiment_score.toFixed(1)}</span>
                    <div className="sentiment-bar">
                      <div className="sentiment-fill" style={{
                        width: `${b.sentiment_score}%`,
                        background: b.sentiment_score > 65 ? '#10b981' : b.sentiment_score > 55 ? '#f59e0b' : '#ef4444'
                      }}/>
                    </div>
                  </div>
                </td>
                <td className="numeric">{b.value_for_money.value_index.toFixed(1)}</td>
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