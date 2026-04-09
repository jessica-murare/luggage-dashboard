import { useState } from 'react';
import Plot from 'react-plotly.js';

export default function ProductDrilldown({ brands }) {
  const [selectedBrand, setSelectedBrand] = useState(brands[0].brand);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [minSentiment, setMinSentiment] = useState(0);
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
    const prodSent = p.review_synthesis?.sentiment ?? 100;
    return parseFloat(p.rating) >= minRating &&
           pr >= appliedMinPrice &&
           pr <= appliedMaxPrice &&
           prodSent >= minSentiment;
  });

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

  const synth = product?.review_synthesis || null;

  const asp = brand?.aspect_sentiment || {};
  const aspectEntries = Object.entries(asp).filter(([, v]) => v !== null);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const activeSortClass = "bg-surface-container-high text-on-surface";
  const thClass = (col) => `px-4 py-3 cursor-pointer transition-colors hover:bg-surface-container-high rounded-lg ${sortCol === col ? activeSortClass : ''}`;

  return (
    <div className="space-y-8 mt-2">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface font-headline">Product Drilldown</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl font-body">Deep dive into SKU-level pricing, discounts, and real-time review sentiment.</p>
        </div>
        <div className="flex items-center gap-3 p-1.5 bg-surface-container-low rounded-xl">
          <button className="px-4 py-2 bg-surface-container-lowest text-primary rounded-lg text-sm font-semibold shadow-sm">Live Products</button>
        </div>
      </section>

      {/* Control Panel (Filters) */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-outline">business</span>
          <select 
            className="bg-surface-container-low border-none rounded-lg text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 py-2 pl-4 pr-10 cursor-pointer"
            value={selectedBrand} 
            onChange={e => { setSelectedBrand(e.target.value); setSelectedProduct(null); }}
          >
            {brands.map(b => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
          </select>
        </div>

        <div className="hidden md:block w-px h-8 bg-surface-container-high"></div>

        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-outline">star</span>
          <select 
            className="bg-surface-container-low border-none rounded-lg text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 py-2 pl-4 pr-10 cursor-pointer"
            value={minRating} 
            onChange={e => setMinRating(parseFloat(e.target.value))}
          >
            {[0, 3, 3.5, 4, 4.5].map(v => <option key={v} value={v}>{v === 0 ? 'Any Rating' : `${v}★ & above`}</option>)}
          </select>
        </div>

        <div className="hidden md:block w-px h-8 bg-surface-container-high"></div>

        {/* Sentiment Filter */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-outline">sentiment_satisfied</span>
          <select
            className="bg-surface-container-low border-none rounded-lg text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 py-2 pl-4 pr-10 cursor-pointer"
            value={minSentiment}
            onChange={e => setMinSentiment(parseFloat(e.target.value))}
          >
            {[0, 40, 50, 60, 70, 80].map(v => <option key={v} value={v}>{v === 0 ? 'Any Sentiment' : `${v}+ Sentiment`}</option>)}
          </select>
        </div>

        <div className="hidden xl:block w-px h-8 bg-surface-container-high"></div>

        <div className="flex items-center gap-4 flex-grow">
          <span className="material-symbols-outlined text-outline hidden md:block">payments</span>
          
          <div className="flex items-center gap-2">
            <input 
              type="number" className="bg-surface-container-low border-none rounded-lg text-sm font-bold text-on-surface w-24 text-center focus:ring-2 focus:ring-primary/20 numeric"
              value={minPrice} onChange={e => setMinPrice(Number(e.target.value) || 0)}
            />
            <input 
              type="range" min="0" max="20000" step="500" value={minPrice} 
              onChange={e => { const val = Number(e.target.value); if (val <= maxPrice) setMinPrice(val); }} 
              className="w-20 cursor-pointer accent-primary"
            />
            <span className="text-outline mx-1">–</span>
            <input 
              type="range" min="0" max="20000" step="500" value={maxPrice} 
              onChange={e => { const val = Number(e.target.value); if (val >= minPrice) setMaxPrice(val); }} 
              className="w-20 cursor-pointer accent-primary"
            />
            <input 
              type="number" className="bg-surface-container-low border-none rounded-lg text-sm font-bold text-on-surface w-24 text-center focus:ring-2 focus:ring-primary/20 numeric"
              value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value) || 0)}
            />
          </div>

          <button 
            className="ml-auto bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary-container transition-colors shadow-md"
            onClick={() => { setAppliedMinPrice(minPrice); setAppliedMaxPrice(maxPrice); }}
          >
            Apply Range
          </button>
        </div>
      </section>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Product Data Table */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-[1.5rem] shadow-[0_8px_32px_rgba(20,27,43,0.06)] overflow-hidden flex flex-col h-[700px]">
          <div className="p-6 border-b border-surface-container-low flex justify-between items-center bg-white/80 backdrop-blur-sm z-10 sticky top-0">
            <div>
              <h3 className="text-xl font-bold font-headline text-on-surface tracking-tight">Product Catalog</h3>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mt-1">Showing {products.length} active models</p>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Sort columns</span>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-lowest sticky top-0 z-10 shadow-sm shadow-slate-200/50">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
                  <th className={thClass('title')} onClick={() => handleSort('title')}>Product Title {sortCol === 'title' ? (sortAsc ? '↑' : '↓') : ''}</th>
                  <th className={thClass('price')} onClick={() => handleSort('price')}>Price {sortCol === 'price' ? (sortAsc ? '↑' : '↓') : ''}</th>
                  <th className={thClass('rating')} onClick={() => handleSort('rating')}>Rating {sortCol === 'rating' ? (sortAsc ? '↑' : '↓') : ''}</th>
                  <th className={thClass('discount_pct')} onClick={() => handleSort('discount_pct')}>Discount {sortCol === 'discount_pct' ? (sortAsc ? '↑' : '↓') : ''}</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-surface-container-low">
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
                    className={`cursor-pointer transition-colors ${selectedProduct === p.asin ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-surface-container-low/50 border-l-4 border-l-transparent'}`}
                  >
                    <td className="px-4 py-4 max-w-[250px] truncate font-medium text-on-surface" title={p.title}>
                      {p.title}
                    </td>
                    <td className="px-4 py-4 numeric text-slate-600 font-bold">{p.price ? `₹${parseInt(p.price).toLocaleString()}` : "N/A"}</td>
                    <td className="px-4 py-4 numeric">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="material-symbols-outlined text-xs text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                        {parseFloat(p.rating).toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-4 numeric text-secondary font-bold">{p.discount_pct}%</td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-low rounded-full mb-4">
                        <span className="material-symbols-outlined text-outline text-2xl">search_off</span>
                      </div>
                      <p className="text-on-surface-variant font-medium">No products match your current filters.</p>
                      <button onClick={() => {setMinPrice(0); setMaxPrice(20000); setAppliedMinPrice(0); setAppliedMaxPrice(20000); setMinRating(0); setMinSentiment(0);}} className="text-primary text-sm font-bold mt-2 hover:underline">Reset Filters</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Hero Insight / Details */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {product ? (
            <>
              {/* Product Info Card */}
              <div className="bg-primary text-white rounded-[1.5rem] p-8 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-primary/20">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase text-white/90">Detailed View</span>
                    <a href={product.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-white/80 hover:text-white hover:underline uppercase tracking-wide">
                      Amazon <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </div>
                  <h3 className="text-xl font-bold font-headline leading-snug mb-6">{product.title}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-xs uppercase tracking-widest text-primary-fixed-dim">Selling Price</span>
                      <span className="text-2xl font-bold font-headline numeric">{product.price ? `₹${parseInt(product.price).toLocaleString()}` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-xs uppercase tracking-widest text-primary-fixed-dim">Listed MRP</span>
                      <span className="text-sm font-medium numeric opacity-80">{product.mrp ? `₹${parseInt(product.mrp).toLocaleString()}` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-xs uppercase tracking-widest text-primary-fixed-dim">Discount</span>
                      <span className="text-lg font-bold text-secondary-fixed numeric">{product.discount_pct}% OFF</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-xs uppercase tracking-widest text-primary-fixed-dim">Rating</span>
                      <span className="text-sm font-medium numeric">{parseFloat(product.rating).toFixed(1)} ★</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-xs uppercase tracking-widest text-primary-fixed-dim">Review Volume</span>
                      <span className="text-sm font-medium numeric">{parseInt(product.review_count).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-container rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              </div>

              {/* Per-Product Review Synthesis Card */}
              {synth && (
                <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_32px_rgba(20,27,43,0.06)] border border-surface-container-low">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-on-surface font-headline">Review Synthesis</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${synth.sentiment >= 65 ? 'bg-secondary-container text-on-secondary-container' : synth.sentiment >= 50 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}`}>
                      {synth.sentiment.toFixed(1)} / 100
                    </span>
                  </div>
                  
                  {/* Sentiment bar */}
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-4">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${synth.sentiment}%`,
                      backgroundColor: synth.sentiment >= 65 ? '#006c49' : synth.sentiment >= 50 ? '#a36700' : '#ba1a1a'
                    }}/>
                  </div>

                  {/* Star distribution */}
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>thumb_up</span>
                      {synth.five_star_pct}% five-star
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-error" style={{fontVariationSettings: "'FILL' 1"}}>thumb_down</span>
                      {synth.one_star_pct}% one-star
                    </span>
                  </div>

                  {/* Praise themes */}
                  {synth.top_praise.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-2">Top Praise</p>
                      <div className="flex flex-wrap gap-1.5">
                        {synth.top_praise.map((t, i) => (
                          <span key={i} className="px-2.5 py-1 bg-secondary-container/40 text-on-secondary-container rounded-full text-[11px] font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complaint themes */}
                  {synth.top_complaints.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-error mb-2">Top Complaints</p>
                      <div className="flex flex-wrap gap-1.5">
                        {synth.top_complaints.map((t, i) => (
                          <span key={i} className="px-2.5 py-1 bg-error-container/40 text-on-error-container rounded-full text-[11px] font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {synth.top_praise.length === 0 && synth.top_complaints.length === 0 && (
                    <p className="text-xs text-on-surface-variant italic">Not enough review text to extract specific themes for this product.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden flex-1 shadow-[0_8px_32px_rgba(20,27,43,0.06)] border border-dashed border-outline-variant/50">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">touch_app</span>
              <h4 className="text-lg font-bold text-on-surface font-headline">No Product Selected</h4>
              <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-[200px]">Click any product from the catalog grid to view a comprehensive breakdown.</p>
            </div>
          )}

          {/* Aspect sentiment for this brand */}
          <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_32px_rgba(20,27,43,0.06)]">
            <h4 className="text-sm font-bold text-on-surface font-headline mb-4">Brand Aspect Sentiment</h4>
            <div className="-ml-6 -mb-6 mt-2">
              <Plot
                data={[{
                  type: 'bar',
                  orientation: 'h',
                  x: aspectEntries.map(([, v]) => v),
                  y: aspectEntries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
                  marker: {
                    color: aspectEntries.map(([, v]) =>
                      v > 65 ? '#006c49' : v > 50 ? '#a36700' : '#ba1a1a'
                    ),
                    borderRadius: 2
                  },
                  text: aspectEntries.map(([, v]) => v.toFixed(1)),
                  textposition: 'outside',
                  textfont: { size: 10, color: '#424754', family: 'Inter', weight: 600 }
                }]}
                layout={{
                  height: 200,
                  margin: { t: 0, b: 20, l: 70, r: 40 },
                  xaxis: { range: [0, 100], gridcolor: '#f1f3ff', zerolinecolor: '#dce2f7', tickfont: { size: 10, color: '#727785' } },
                  yaxis: { tickfont: { size: 11, color: '#141b2b', weight: 600 } },
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

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_32px_rgba(20,27,43,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-on-surface font-headline">Recently Viewed</h4>
                <span className="material-symbols-outlined text-outline text-sm">history</span>
              </div>
              <ul className="space-y-3">
                {recentlyViewed.map(asin => {
                  const rvItem = (brand?.products || []).find(x => x.asin === asin);
                  if (!rvItem) return null;
                  return (
                    <li key={asin} className="flex justify-between items-center group">
                      <a 
                        href="/" 
                        onClick={(e) => { e.preventDefault(); setSelectedProduct(asin); }}
                        className="text-sm font-medium text-primary hover:text-primary-container truncate mr-4 transition-colors"
                      >
                        {rvItem.title} 
                      </a>
                      <span className="text-xs font-bold text-outline numeric bg-surface-container-high px-2 py-0.5 rounded-full whitespace-nowrap">
                        {rvItem.price ? `₹${parseInt(rvItem.price).toLocaleString()}` : '-'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}