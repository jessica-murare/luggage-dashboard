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

  const activeClass = "text-primary bg-primary/10";
  const getSortClass = (col) => `cursor-pointer transition-colors hover:text-slate-900 ${sortCol === col ? activeClass : ''}`;

  const names     = brands.map(b => b.brand);
  const sentiment = brands.map(b => b.sentiment_score);
  const prices    = brands.map(b => b.avg_price);
  const discounts = brands.map(b => b.avg_discount_pct);

  // Modern SaaS Color Palette matching Tailwind config
  const COLORS = ['#0058be', '#006c49', '#825100', '#001a42', '#2170e4', '#ba1a1a'];

  // Find the brand with best and worst sentiment for highlights
  const bestBrand = [...brands].sort((a, b) => b.sentiment_score - a.sentiment_score)[0];
  const worstBrand = [...brands].sort((a, b) => a.sentiment_score - b.sentiment_score)[0];

  return (
    <>
      {/* Dashboard Header */}
      <div className="mb-8 mt-2">
        <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight mb-1">Dashboard Overview</h1>
        <p className="text-on-surface-variant text-body-md">Comprehensive analysis of luggage market performance and brand sentiment.</p>
      </div>

      {/* KPI Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Brands Tracked */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Brands Tracked</p>
            <h3 className="text-5xl font-bold text-on-surface font-headline">{brands.length.toString().padStart(2, '0')}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">ACTIVE</span>
            <span className="text-slate-400 text-xs">Major Market Players</span>
          </div>
        </div>

        {/* Total Supply */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Supply</p>
            <h3 className="text-5xl font-bold text-on-surface font-headline">{total_products}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
            <span className="text-secondary text-xs font-semibold">Unique models</span>
          </div>
        </div>

        {/* Review Volume */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Review Volume</p>
            <h3 className="text-5xl font-bold text-on-surface font-headline">{total_reviews.toLocaleString()}</h3>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary w-full h-full"></div>
            </div>
            <p className="text-slate-400 text-[10px] mt-2">Real Amazon India Reviews</p>
          </div>
        </div>

        {/* Market Avg Sentiment */}
        <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl shadow-lg flex flex-col justify-between text-white">
          <div>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">Market Sentiment</p>
            <h3 className="text-5xl font-bold font-headline">{avg_sentiment}</h3>
            <p className="text-white/60 text-xs">out of 100 points</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">STABLE</span>
            <span className="text-white/80 text-[10px] ml-1">{avg_discount}% avg discount</span>
          </div>
        </div>
      </div>

      {/* Analytical Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Sentiment Score Distribution */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-on-surface font-headline">Sentiment Distribution</h3>
          </div>
          <div className="flex-1 -mx-4">
            <Plot
              data={[{
                type: 'bar',
                x: names,
                y: sentiment,
                marker: { color: COLORS, line: { width: 0 }, borderRadius: 4 },
                text: sentiment.map(s => s.toFixed(1)),
                textposition: 'outside',
                textfont: { size: 10, color: '#424754', family: 'Inter' }
              }]}
              layout={{
                height: 250,
                margin: { t: 20, b: 30, l: 30, r: 10 },
                yaxis: { range: [0, 100], gridcolor: '#f1f3ff', zerolinecolor: '#dce2f7', tickfont: { size: 10, color: '#727785' } },
                xaxis: { tickfont: { size: 10, color: '#424754', weight: 500 } },
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

        {/* Price vs Discount Positioning */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-on-surface font-headline">Price vs Discount Positioning</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><span className="w-2 h-2 rounded-full bg-primary"></span> BRAND</span>
            </div>
          </div>
          <div className="flex-1 -ml-4">
            <Plot
              data={[{
                type: 'scatter',
                mode: 'markers+text',
                x: prices,
                y: discounts,
                text: names,
                textposition: 'top center',
                marker: { color: COLORS, size: 16, line: { color: 'white', width: 2 } },
                textfont: { size: 11, color: '#141b2b', family: 'Inter', weight: 500 }
              }]}
              layout={{
                height: 250,
                margin: { t: 20, b: 40, l: 40, r: 20 },
                xaxis: { title: 'Avg Selling Price (₹)', titlefont: { size: 10, color: '#727785' }, gridcolor: '#f1f3ff', tickfont: { size: 10, color: '#727785' } },
                yaxis: { title: 'Avg Discount %', titlefont: { size: 10, color: '#727785' }, gridcolor: '#f1f3ff', tickfont: { size: 10, color: '#727785' } },
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

      {/* Thematic Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Market Leader Themes */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] overflow-hidden">
          <div className="p-6 bg-secondary text-white">
            <h3 className="font-headline text-lg">Market Leader: Praised Themes</h3>
            <p className="text-xs opacity-80 mt-1">Primary Performance: {bestBrand.brand} ({bestBrand.sentiment_score.toFixed(1)})</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {(bestBrand?.themes?.top_positives || []).map((t, i) => (
                <span key={i} className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-wide">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Market Laggard Themes */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] overflow-hidden">
          <div className="p-6 bg-error text-white">
            <h3 className="font-headline text-lg">Market Laggard: Complaint Themes</h3>
            <p className="text-xs opacity-80 mt-1">Primary Performance: {worstBrand.brand} ({worstBrand.sentiment_score.toFixed(1)})</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {(worstBrand?.themes?.top_negatives || []).map((t, i) => (
                <span key={i} className="px-4 py-2 bg-error-container text-on-error-container rounded-full text-xs font-bold uppercase tracking-wide">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Full Market Snapshot Table */}
      <section className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] overflow-hidden">
        <div className="p-8 border-b border-surface-container-low flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface font-headline">Full Market Snapshot</h3>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Click headers to sort</span>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
              <tr>
                <th className="px-8 py-4">Brand</th>
                <th className={`px-6 py-4 ${getSortClass('avg_price')}`} onClick={() => handleSort('avg_price')}>Avg Price {sortCol === 'avg_price' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={`px-6 py-4 ${getSortClass('avg_discount_pct')}`} onClick={() => handleSort('avg_discount_pct')}>Avg Discount {sortCol === 'avg_discount_pct' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={`px-6 py-4 ${getSortClass('avg_rating')}`} onClick={() => handleSort('avg_rating')}>Avg Rating {sortCol === 'avg_rating' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={`px-6 py-4 ${getSortClass('sentiment_score')}`} onClick={() => handleSort('sentiment_score')}>Sentiment {sortCol === 'sentiment_score' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={`px-6 py-4 ${getSortClass('value_for_money')}`} onClick={() => handleSort('value_for_money')}>Value Index {sortCol === 'value_for_money' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className="px-6 py-4">Price Band</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container-low">
              {sorted.map((b) => (
                <tr key={b.brand} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-4 font-bold text-on-surface">{b.brand}</td>
                  <td className="px-6 py-4 text-slate-600 numeric">₹{b.avg_price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-secondary font-semibold numeric">{b.avg_discount_pct.toFixed(1)}%</td>
                  <td className="px-6 py-4 numeric">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="material-symbols-outlined text-xs text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      {b.avg_rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 numeric">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.sentiment_score >= 65 ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface'}`}>
                      {b.sentiment_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-primary numeric">{b.value_for_money.value_index.toFixed(1)}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 bg-surface-container-high px-2 py-1 rounded-full uppercase tracking-tighter">
                      {b.value_for_money.price_band}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}