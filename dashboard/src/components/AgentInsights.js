export default function AgentInsights({ brands }) {
  const insights = brands[0]?.agent_insights || [];
  const topBrand = [...brands].sort((a, b) => b.sentiment_score - a.sentiment_score)[0];
  const bestValue = [...brands].sort((a, b) => b.value_for_money.value_index - a.value_for_money.value_index)[0];
  const mostDiscount = [...brands].sort((a, b) => b.avg_discount_pct - a.avg_discount_pct)[0];

  return (
    <>
      <div className="page-header">
        <h1>Agent insights</h1>
        <p>LLM-generated conclusions from review and pricing data</p>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-label">Sentiment leader</div>
          <div className="kpi-value">{topBrand.brand}</div>
          <div className="kpi-sub">Score {topBrand.sentiment_score.toFixed(1)}/100</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Best value for money</div>
          <div className="kpi-value">{bestValue.brand}</div>
          <div className="kpi-sub">Value index {bestValue.value_for_money.value_index.toFixed(1)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Highest discounter</div>
          <div className="kpi-value">{mostDiscount.brand}</div>
          <div className="kpi-sub">{mostDiscount.avg_discount_pct.toFixed(1)}% avg off MRP</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">5 non-obvious conclusions</div>
        {insights.map((insight, i) => (
          <div className="insight-card" key={i}>
            <div className="insight-number">Insight {i + 1}</div>
            {insight}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Trust signal summary</div>
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Verified %</th>
              <th>Rating skew</th>
              <th>Repetition</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {brands.map(b => (
              <tr key={b.brand}>
                <td style={{ fontWeight: 500 }}>{b.brand}</td>
                <td>{b.trust_signals.verified_pct}%</td>
                <td>{b.trust_signals.rating_skew}%</td>
                <td>{b.trust_signals.repetition_score}%</td>
                <td>
                  {b.trust_signals.flags?.length > 0
                    ? b.trust_signals.flags.map((f, i) => (
                        <span key={i} className="badge badge-red" style={{ marginRight: 4 }}>{f}</span>
                      ))
                    : <span className="badge badge-green">Clean</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}