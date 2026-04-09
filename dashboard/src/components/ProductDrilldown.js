import { useState } from 'react';
import Plot from 'react-plotly.js';

export default function ProductDrilldown({ brands }) {
  const [selectedBrand, setSelectedBrand] = useState(brands[0].brand);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);

  const brand = brands.find(b => b.brand === selectedBrand);
  const products = (brand?.products || []).filter(p =>
    parseFloat(p.rating) >= minRating &&
    parseFloat(p.price)  <= maxPrice
  );

  const product = selectedProduct
    ? products.find(p => p.asin === selectedProduct)
    : null;

  const asp = brand?.aspect_sentiment || {};
  const aspectEntries = Object.entries(asp).filter(([, v]) => v !== null);

  return (
    <>
      <div className="page-header">
        <h1>Product drilldown</h1>
        <p>Explore individual products and aspect scores per brand</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="filter-label">Brand:</span>
        <select value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setSelectedProduct(null); }}>
          {brands.map(b => <option key={b.brand}>{b.brand}</option>)}
        </select>

        <span className="filter-label">Min rating:</span>
        <select value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))}>
          {[0, 3, 3.5, 4, 4.5].map(v => <option key={v} value={v}>{v === 0 ? 'Any' : `${v}★+`}</option>)}
        </select>

        <span className="filter-label">Max price:</span>
        <select value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))}>
          {[5000, 8000, 10000, 15000, 20000].map(v => (
            <option key={v} value={v}>₹{v.toLocaleString()}</option>
          ))}
        </select>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* Product list */}
        <div className="card" style={{ margin:0 }}>
          <div className="card-title">{products.length} products — {selectedBrand}</div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Disc.</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr
                  key={p.asin}
                  onClick={() => setSelectedProduct(p.asin)}
                  style={{ background: selectedProduct === p.asin ? '#eff6ff' : undefined }}
                >
                  <td style={{ maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:13 }} title={p.title}>
                    {p.title?.slice(0, 50)}{p.title?.length > 50 ? '…' : ''}
                  </td>
                  <td>₹{parseInt(p.price).toLocaleString()}</td>
                  <td>{parseFloat(p.rating).toFixed(1)} ★</td>
                  <td>{p.discount_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product detail or aspect chart */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {product ? (
            <div className="card" style={{ margin:0 }}>
              <div className="card-title">Product detail</div>
              <p style={{ fontSize:14, fontWeight:500, marginBottom:12 }}>{product.title}</p>
              <table style={{ fontSize:13 }}>
                <tbody>
                  <tr><td style={{ color:'#6b7280', paddingBottom:8 }}>Price</td><td>₹{parseInt(product.price).toLocaleString()}</td></tr>
                  <tr><td style={{ color:'#6b7280', paddingBottom:8 }}>MRP</td><td>₹{parseInt(product.mrp).toLocaleString()}</td></tr>
                  <tr><td style={{ color:'#6b7280', paddingBottom:8 }}>Discount</td><td>{product.discount_pct}% off</td></tr>
                  <tr><td style={{ color:'#6b7280', paddingBottom:8 }}>Rating</td><td>{parseFloat(product.rating).toFixed(1)} ★</td></tr>
                  <tr><td style={{ color:'#6b7280', paddingBottom:8 }}>Reviews</td><td>{parseInt(product.review_count).toLocaleString()}</td></tr>
                  <tr>
                    <td style={{ color:'#6b7280' }}>Link</td>
                    <td><a href={product.url} target="_blank" rel="noreferrer" style={{ color:'#3b82f6', fontSize:13 }}>View on Amazon</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ margin:0, display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
              <p style={{ color:'#9ca3af', fontSize:14 }}>Click a product to see details</p>
            </div>
          )}

          {/* Aspect sentiment for this brand */}
          <div className="card" style={{ margin:0 }}>
            <div className="card-title">Aspect sentiment — {selectedBrand}</div>
            <Plot
              data={[{
                type: 'bar',
                orientation: 'h',
                x: aspectEntries.map(([, v]) => v),
                y: aspectEntries.map(([k]) => k),
                marker: {
                  color: aspectEntries.map(([, v]) =>
                    v > 65 ? '#10b981' : v > 50 ? '#f59e0b' : '#ef4444'
                  )
                },
                text: aspectEntries.map(([, v]) => v.toFixed(1)),
                textposition: 'outside',
              }]}
              layout={{
                height: 240,
                margin: { t: 10, b: 30, l: 70, r: 40 },
                xaxis: { range: [0, 100], gridcolor: '#f3f4f6' },
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
      </div>

      {/* Pros and cons */}
      <div className="chart-row" style={{ marginTop:24 }}>
        <div className="card">
          <div className="card-title">Top positives — {selectedBrand}</div>
          {(brand?.themes?.top_positives || []).map((t, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ width:22, height:22, borderRadius:'50%', background:'#dcfce7', color:'#166534', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, flexShrink:0 }}>{i+1}</span>
              <span style={{ fontSize:14, textTransform:'capitalize' }}>{t}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Top negatives — {selectedBrand}</div>
          {(brand?.themes?.top_negatives || []).map((t, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ width:22, height:22, borderRadius:'50%', background:'#fee2e2', color:'#991b1b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, flexShrink:0 }}>{i+1}</span>
              <span style={{ fontSize:14, textTransform:'capitalize' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}