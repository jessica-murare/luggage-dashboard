import { useState } from 'react';
import './App.css';
import insightsData from './data/insights.json';
import Overview from './components/Overview';
import BrandComparison from './components/BrandComparison';
import ProductDrilldown from './components/ProductDrilldown';
import AgentInsights from './components/AgentInsights';

const NAV = [
  { id: 'overview',    label: 'Overview',         icon: 'dashboard' },
  { id: 'comparison',  label: 'Brand Comparison', icon: 'compare_arrows' },
  { id: 'drilldown',   label: 'Product Drilldown',icon: 'luggage' },
  { id: 'insights',    label: 'Agent Insights',   icon: 'psychology' },
];

export default function App() {
  const [page, setPage] = useState('overview');
  const brands = Object.values(insightsData);

  return (
    <>
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 dark:bg-slate-900 flex flex-col py-6 px-4 z-50">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg overflow-hidden">
            <img alt="Market Intelligence Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzBwMoebTMp0gpOePK-DFYGSHmlP3pyJ7xFIbG_-4bjNx4vvyFyJSxXX5uM7AZfWk-SKFLlnba7Q0_YiEoTXMXvQoylNxCSwU2x8hc3rgSq-MwRNgSbYP1PrWeF4n15c_in-qtsKdPyiN9dhXmWkztPyW8SXUaFlseZHHInxnr_z2OFRxDwDuADFhQBRzuC1ODJc4BaAdBRPYT_6HiZY9s9-nchufLtlR56-_J18arUhvy5u5WXfA1oN9l2QpvjHtY2U2dEl_pl0t0"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-headline leading-tight">Insight Curator</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Luggage Category</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {NAV.map(n => {
            const isActive = page === n.id;
            const activeClass = "flex items-center gap-3 px-4 py-3 rounded-lg text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 bg-white/50 dark:bg-white/5 transition-all";
            const inactiveClass = "flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-200";
            
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`w-full text-left ${isActive ? activeClass : inactiveClass}`}
              >
                <span className="material-symbols-outlined">{n.icon}</span>
                <span className="font-headline tracking-tight">{n.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto space-y-1 border-t border-slate-200 dark:border-slate-800 pt-6">
          <button className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-200">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-headline tracking-tight">Settings</span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 w-full z-40 ml-64 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex justify-end items-center h-16 px-8 max-w-[calc(100%-16rem)]">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ml-2 border border-slate-300">
            <img alt="User Executive Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrKNBtaqSnFWMJwaH6jQb2nlAzU4t5aZaVFnYnSu6XTrBkcWjfbA3T4-I8bF3jRqzTzO4pOo64U-Rrp_YE07-FYeCrW7doJWWkNQ3Kvurweb1kjPDPAA1sHeRTeVM1b6Fik9kBf8_Z61RiHBDW_Ciz5qy7x3EByd_Cg71hvwA5E-fGnabou3abEbeq-i3figEj9TSSCZVlb36ycrB934ZED5GA-1KbZf3UcZIv9sK7s0XoRowLhB2gvz8z49VlB-FLvEyreoneHj-A"/>
          </div>
        </div>
      </header>

      <main className="ml-64 p-8 bg-surface min-h-[calc(100vh-64px)]">
        {page === 'overview'   && <Overview brands={brands} />}
        {page === 'comparison' && <BrandComparison brands={brands} />}
        {page === 'drilldown'  && <ProductDrilldown brands={brands} />}
        {page === 'insights'   && <AgentInsights brands={brands} />}
      </main>
    </>
  );
}