import { useState } from 'react';
import './App.css';
import insightsData from './data/insights.json';
import Overview from './components/Overview';
import BrandComparison from './components/BrandComparison';
import ProductDrilldown from './components/ProductDrilldown';
import AgentInsights from './components/AgentInsights';

const NAV = [
  { id: 'overview',    label: 'Overview',         icon: '◈' },
  { id: 'comparison',  label: 'Brand comparison',  icon: '⊞' },
  { id: 'drilldown',   label: 'Product drilldown', icon: '◎' },
  { id: 'insights',    label: 'Agent insights',    icon: '◆' },
];

export default function App() {
  const [page, setPage] = useState('overview');
  const brands = Object.values(insightsData);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          Luggage Intel
          <span>Amazon India · 6 brands</span>
        </div>
        <nav>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        {page === 'overview'   && <Overview brands={brands} />}
        {page === 'comparison' && <BrandComparison brands={brands} />}
        {page === 'drilldown'  && <ProductDrilldown brands={brands} />}
        {page === 'insights'   && <AgentInsights brands={brands} />}
      </main>
    </div>
  );
}