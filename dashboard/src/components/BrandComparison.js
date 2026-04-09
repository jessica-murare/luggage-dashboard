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

  const COLORS = ['#0058be', '#006c49', '#825100', '#001a42', '#2170e4', '#ba1a1a'];

  const toggleBrand = (name) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortAsc(!sortAsc);
    else { setSortBy(col); setSortAsc(false); }
  };

  const activeClass = "text-primary bg-primary/5";
  const thClass = (col) => `px-6 py-4 cursor-pointer transition-colors hover:text-slate-900 ${sortBy === col ? activeClass : ''}`;

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
    <div className="space-y-8 mt-2">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface font-headline">Brand Comparison</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl font-body">Evaluating market positioning and consumer perception across top luggage brands.</p>
        </div>
        <div className="flex items-center gap-3 p-1.5 bg-surface-container-low rounded-xl">
          <button className="px-4 py-2 bg-surface-container-lowest text-primary rounded-lg text-sm font-semibold shadow-sm">Compare Tool</button>
        </div>
      </section>

      {/* Filters (Modeled from Stitch) */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center flex-wrap gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Brands:</span>
          {brands.map((b, i) => {
            const isSelected = selected.includes(b.brand);
            return (
              <label key={b.brand} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-surface-container-high text-slate-500 hover:bg-surface-container-low'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isSelected}
                  onChange={() => toggleBrand(b.brand)}
                />
                <span className={`w-2 h-2 rounded-full ${isSelected ? '' : 'bg-slate-300'}`} style={{ backgroundColor: isSelected ? COLORS[i % COLORS.length] : undefined }}></span>
                {b.brand}
              </label>
            );
          })}
        </div>
        <div className="flex items-center gap-4 border-l border-surface-container-high pl-6">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min Sentiment:</span>
          <select 
            className="bg-surface-container-high border-none rounded-lg text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer p-2 pr-8"
            value={minSentiment} 
            onChange={e => setMinSentiment(parseFloat(e.target.value))}
          >
            {[0, 50, 55, 60, 65, 70].map(v => <option key={v} value={v}>{v === 0 ? 'Any Score' : `${v}+ Score`}</option>)}
          </select>
        </div>
      </section>

      {/* Analytics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Sentiment Distribution */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold text-on-surface font-headline">Sentiment Score</h4>
          </div>
          <div className="-mx-4">
            <Plot
              data={[{
                type: 'bar',
                x: filtered.map(b => b.brand),
                y: filtered.map(b => b.sentiment_score),
                marker: { color: filtered.map((_, i) => COLORS[i % COLORS.length]), borderRadius: 4, line: { width: 0 } },
                text: filtered.map(b => b.sentiment_score.toFixed(1)),
                textposition: 'outside',
                textfont: { size: 12, color: '#424754', family: 'Inter' }
              }]}
              layout={{
                autosize: true,
                height: 250,
                margin: { t: 10, b: 30, l: 30, r: 10 },
                yaxis: { range: [0, 100], gridcolor: '#f1f3ff', zerolinecolor: '#dce2f7', tickfont: { size: 10, color: '#727785' } },
                xaxis: { tickfont: { size: 11, color: '#424754', weight: 500 } },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                showlegend: false,
                font: { family: 'Inter, sans-serif' },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </div>
        </div>

        {/* Value Index */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold text-on-surface font-headline">Value Index (Price adjusted)</h4>
          </div>
          <div className="-mx-4">
            <Plot
              data={[{
                type: 'bar',
                x: filtered.map(b => b.brand),
                y: filtered.map(b => b.value_for_money.value_index),
                marker: { color: filtered.map((_, i) => COLORS[i % COLORS.length]), borderRadius: 4, line: { width: 0 } },
                text: filtered.map(b => b.value_for_money.value_index.toFixed(1)),
                textposition: 'outside',
                textfont: { size: 12, color: '#424754', family: 'Inter' }
              }]}
              layout={{
                autosize: true,
                height: 250,
                margin: { t: 10, b: 30, l: 30, r: 10 },
                yaxis: { gridcolor: '#f1f3ff', zerolinecolor: '#dce2f7', tickfont: { size: 10, color: '#727785' } },
                xaxis: { tickfont: { size: 11, color: '#424754', weight: 500 } },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                showlegend: false,
                font: { family: 'Inter, sans-serif' },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </div>
        </div>

      </section>

      {/* Radar chart */}
      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)]">
        <div className="mb-4 text-center space-y-2">
          <h4 className="text-xl font-bold text-on-surface font-headline">Consumer Aspect Perception Matrix</h4>
          <p className="text-on-surface-variant font-body text-sm">Cross-referencing durability, style, and functionality scores.</p>
        </div>
        <div className="flex justify-center">
          <Plot
            data={radarData}
            layout={{
              autosize: true,
              height: 400,
              polar: {
                radialaxis: { visible: true, range: [0, 100], gridcolor: '#e1e8fd', tickfont: { size: 10, color: '#727785' } },
                angularaxis: { gridcolor: '#e1e8fd', tickfont: { size: 12, color: '#141b2b', weight: 600 } },
                bgcolor: '#f9f9ff'
              },
              paper_bgcolor: 'transparent',
              font: { family: 'Inter, sans-serif' },
              legend: { orientation: 'h', y: -0.1, font: { size: 12, color: '#424754' } },
              margin: { t: 20, b: 60, l: 40, r: 40 },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%', maxWidth: '700px', height: '100%' }}
            useResizeHandler={true}
          />
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(20,27,43,0.06)] overflow-hidden">
        <div className="p-8 border-b border-surface-container-low flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface font-headline">Full Comparison Table</h3>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Click headers to sort</span>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
              <tr>
                <th className="px-8 py-4">Brand</th>
                <th className={thClass('avg_price')} onClick={() => handleSort('avg_price')}>Avg Price {sortBy === 'avg_price' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={thClass('avg_mrp')} onClick={() => handleSort('avg_mrp')}>Avg MRP {sortBy === 'avg_mrp' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={thClass('avg_discount_pct')} onClick={() => handleSort('avg_discount_pct')}>Discount {sortBy === 'avg_discount_pct' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={thClass('avg_rating')} onClick={() => handleSort('avg_rating')}>Rating {sortBy === 'avg_rating' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={thClass('review_count')} onClick={() => handleSort('review_count')}>Reviews {sortBy === 'review_count' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={thClass('sentiment_score')} onClick={() => handleSort('sentiment_score')}>Sentiment {sortBy === 'sentiment_score' ? (sortAsc ? '↑' : '↓') : ''}</th>
                <th className={thClass('value_for_money')} onClick={() => handleSort('value_for_money')}>Value {sortBy === 'value_for_money' ? (sortAsc ? '↑' : '↓') : ''}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container-low">
              {filtered.map((b, i) => (
                <tr key={b.brand} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-4 font-bold" style={{ color: COLORS[i % COLORS.length] }}>{b.brand}</td>
                  <td className="px-6 py-4 numeric text-slate-700">₹{b.avg_price.toLocaleString()}</td>
                  <td className="px-6 py-4 numeric text-slate-500">₹{b.avg_mrp.toLocaleString()}</td>
                  <td className="px-6 py-4 numeric text-secondary font-semibold">{b.avg_discount_pct.toFixed(1)}%</td>
                  <td className="px-6 py-4 numeric">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="material-symbols-outlined text-xs text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      {b.avg_rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 numeric text-slate-500">{b.review_count.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-right font-bold numeric text-[13px]">{b.sentiment_score.toFixed(1)}</span>
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full" style={{
                          width: `${b.sentiment_score}%`,
                          backgroundColor: b.sentiment_score > 65 ? '#006c49' : b.sentiment_score > 55 ? '#a36700' : '#ba1a1a'
                        }}/>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 numeric font-mono font-bold text-primary">{b.value_for_money.value_index.toFixed(1)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-8 py-12 text-center text-slate-500 font-medium">
                    No brands match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}