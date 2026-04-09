import { useState } from 'react';
import Plot from 'react-plotly.js';

export default function ProductDrilldown({ brands }) {
  const [selectedBrand, setSelectedBrand] = useState(brands[0].brand);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [appliedMinPrice, setAppliedMinPrice] = useState(0);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(20000);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  const brand = brands.find(b => b.brand === selectedBrand);

  let products = (brand?.products || []).filter(p => {
    const pr = parseFloat(p.price) || 0;
    return parseFloat(p.rating) >= minRating &&
           pr >= appliedMinPrice &&
           pr <= appliedMaxPrice;
  });

  // Sort products if a column is selected
  if (sortCol) {
    products = [...products].sort((a, b) => {
      let va = sortCol === 'title' ? (a.title || '') : (parseFloat(a[sortCol]) || 0);
      let vb = sortCol === 'title' ? (b.title || '') : (parseFloat(b[sortCol]) || 0);
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
  }

  const product = selectedProduct
    ? products.find(p => p.asin === selectedProduct)
    : null;

  const asp = brand?.aspect_sentiment || {};
  const aspectEntries = Object.entries(asp).filter(([, v]) => v !== null);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const thClass = (col) => `sortable ${sortCol === col ? (sortAsc ? 'sort-active sort-asc' : 'sort-active') : ''}`;

  return (
    <>
      <div className="page-header">
        <h1>Product Drilldown</h1>
        <p>Explore individual products and aspect scores per brand</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="filter-label">Brand:</span>
        <select value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setSelectedProduct(null); }}>
          {brands.map(b => <option key={b.brand}>{b.brand}</option>)}
        </select>

        <span className="filter-label" style={{ marginLeft: 8 }}>Min Rating:</span>
        <select value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))}>
          {[0, 3, 3.5, 4, 4.5].map(v => <option key={v} value={v}>{v === 0 ? 'Any' : `${v}★+`}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
          <span className="filter-label" style={{ marginRight: 4 }}>Price Range:</span>
          
          <input 
            type="number"
            value={minPrice}
            onChange={e => setMinPrice(Number(e.target.value) || 0)}
            style={{ width: 100, textAlign: 'right' }}
          />

          <input 
            type="range" 
            min="0" 
            max="20000" 
            step="500" 
            value={minPrice} 
            onChange={e => {
              const val = Number(e.target.value);
              if (val <= maxPrice) setMinPrice(val);
            }} 
            style={{ width: 80, cursor: 'pointer', marginLeft: 4 }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-light)', margin: '0 4px' }}>–</span>
          <input 
            type="range" 
            min="0" 
            max="20000" 
            step="500" 
            value={maxPrice} 
            onChange={e => {
              const val = Number(e.target.value);
              if (val >= minPrice) setMaxPrice(val);
            }} 
            style={{ width: 80, cursor: 'pointer', marginRight: 4 }}
          />

          <input 
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value) || 0)}
            style={{ width: 100, textAlign: 'right' }}
          />

          <button 
            className="btn-apply"
            onClick={() => { setAppliedMinPrice(minPrice); setAppliedMaxPrice(maxPrice); }}
          >
            Apply
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>

        {/* Product list */}
        <div className="card" style={{ margin:0, display: 'flex', flexDirection: 'column' }}>
          <div className="card-title" style={{ marginBottom: 16 }}>{products.length} Products — {selectedBrand} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-light)', marginLeft: 8 }}>Click headers to sort</span></div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 500, border: '1px solid var(--border-color)', borderRadius: 8 }}>
            <table>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className={thClass('title')} onClick={() => handleSort('title')}>Title</th>
                  <th className={thClass('price')} onClick={() => handleSort('price')}>Price</th>
                  <th className={thClass('rating')} onClick={() => handleSort('rating')}>Rating</th>
                  <th className={thClass('discount_pct')} onClick={() => handleSort('discount_pct')}>Disc.</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={`${p.asin}-${i}`}
                    onClick={() => {
                      setSelectedProduct(p.asin);
                      setRecentlyViewed(prev => {
                        const newRv = prev.filter(asin => asin !== p.asin);
                        return [p.asin, ...newRv].slice(0, 5);
                      });
                    }}
                    style={{ background: selectedProduct === p.asin ? '#eff6ff' : undefined }}
                  >
                    <td style={{ maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:13 }} title={p.title}>
                      {p.title?.slice(0, 50)}{p.title?.length > 50 ? '…' : ''}
                    </td>
                    <td className="numeric">{p.price ? `₹${parseInt(p.price).toLocaleString()}` : "N/A"}</td>
                    <td className="numeric">{parseFloat(p.rating).toFixed(1)} ★</td>
                    <td className="numeric">{p.discount_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product detail or aspect chart */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

          {product ? (
            <div className="card" style={{ margin:0 }}>
              <div className="card-title" style={{ marginBottom: 16 }}>Product Detail</div>
              <p style={{ fontSize:15, fontWeight:600, marginBottom:16, color:'var(--text-main)' }}>{product.title}</p>
              <table style={{ fontSize:14 }}>
                <tbody>
                  <tr><td style={{ color:'var(--text-muted)', paddingBottom:12, width: 100 }}>Price</td><td className="numeric" style={{ paddingBottom: 12 }}>{product.price ? `₹${parseInt(product.price).toLocaleString()}` : "N/A"}</td></tr>
                  <tr><td style={{ color:'var(--text-muted)', paddingBottom:12 }}>MRP</td><td className="numeric" style={{ paddingBottom: 12 }}>{product.mrp ? `₹${parseInt(product.mrp).toLocaleString()}` : "N/A"}</td></tr>
                  <tr><td style={{ color:'var(--text-muted)', paddingBottom:12 }}>Discount</td><td className="numeric" style={{ paddingBottom: 12 }}>{product.discount_pct}% off</td></tr>
                  <tr><td style={{ color:'var(--text-muted)', paddingBottom:12 }}>Rating</td><td className="numeric" style={{ paddingBottom: 12 }}>{parseFloat(product.rating).toFixed(1)} ★</td></tr>
                  <tr><td style={{ color:'var(--text-muted)', paddingBottom:16 }}>Reviews</td><td className="numeric" style={{ paddingBottom: 16 }}>{parseInt(product.review_count).toLocaleString()}</td></tr>
                  <tr>
                    <td style={{ color:'var(--text-muted)' }}>Link</td>
                    <td><a href={product.url} target="_blank" rel="noreferrer" style={{ color:'var(--brand-primary)', fontSize:14, fontWeight: 500, textDecoration: 'none' }}>View on Amazon ↗</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ margin:0, display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
              <p style={{ color:'var(--text-light)', fontSize:14, fontWeight: 500 }}>Select a product to view details</p>
            </div>
          )}

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <div className="card" style={{ margin:0 }}>
              <div className="card-title" style={{ marginBottom: 16 }}>Recently Viewed</div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {recentlyViewed.map(asin => {
                  const rvItem = (brand?.products || []).find(x => x.asin === asin);
                  if (!rvItem) return null;
                  return (
                    <li key={asin} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <a 
                        href="/" 
                        onClick={(e) => { e.preventDefault(); setSelectedProduct(asin); }}
                        style={{ color: 'var(--brand-primary)', textDecoration: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 16 }}
                      >
                        {rvItem.title} 
                      </a>
                      <span className="numeric" style={{ color: 'var(--text-muted)', fontSize: 13, flexShrink: 0 }}>
                        {rvItem.price ? `₹${parseInt(rvItem.price).toLocaleString()}` : 'N/A'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Aspect sentiment for this brand */}
          <div className="card" style={{ margin:0 }}>
            <div className="card-title">Aspect Sentiment — {selectedBrand}</div>
            <Plot
              data={[{
                type: 'bar',
                orientation: 'h',
                x: aspectEntries.map(([, v]) => v),
                y: aspectEntries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
                marker: {
                  color: aspectEntries.map(([, v]) =>
                    v > 65 ? '#10b981' : v > 50 ? '#f59e0b' : '#ef4444'
                  )
                },
                text: aspectEntries.map(([, v]) => v.toFixed(1)),
                textposition: 'outside',
                textfont: { size: 12, color: 'var(--text-muted)', family: 'Inter' }
              }]}
              layout={{
                height: 240,
                margin: { t: 10, b: 30, l: 70, r: 40 },
                xaxis: { range: [0, 100], gridcolor: '#f1f5f9', zerolinecolor: '#e2e8f0', tickfont: { color: '#64748b' } },
                yaxis: { tickfont: { color: '#64748b', weight: 500 } },
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
      </div>

      {/* Pros and cons */}
      <div className="chart-row" style={{ marginTop:24 }}>
        <div className="card">
          <div className="card-title">Top Praised Themes — {selectedBrand}</div>
          {(brand?.themes?.top_positives || []).map((t, i) => (
            <div className="theme-item" key={i}>
              <span className="theme-number positive">{i+1}</span>
              <span className="theme-text">{t}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Top Complaint Themes — {selectedBrand}</div>
          {(brand?.themes?.top_negatives || []).map((t, i) => (
            <div className="theme-item" key={i}>
              <span className="theme-number negative">{i+1}</span>
              <span className="theme-text">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}