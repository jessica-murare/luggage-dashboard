export default function AgentInsights({ brands }) {
  const insights = brands[0]?.agent_insights || [];
  const topBrand = [...brands].sort((a, b) => b.sentiment_score - a.sentiment_score)[0];
  const bestValue = [...brands].sort((a, b) => b.value_for_money.value_index - a.value_for_money.value_index)[0];
  const mostDiscount = [...brands].sort((a, b) => b.avg_discount_pct - a.avg_discount_pct)[0];

  // Anomaly detection: high rating but low sentiment, or poor aspect despite good overall
  const anomalies = [];
  for (const b of brands) {
    if (b.avg_rating >= 4.0 && b.sentiment_score < 60) {
      anomalies.push(`${b.brand} maintains a ${b.avg_rating.toFixed(1)}★ average rating but has a sentiment score of only ${b.sentiment_score.toFixed(1)}/100. This suggests a disconnect between star ratings and actual review text — customers may leave high ratings out of habit while expressing real dissatisfaction in writing.`);
    }
    const asp = b.aspect_sentiment || {};
    for (const [aspect, score] of Object.entries(asp)) {
      if (score !== null && score < 50 && b.avg_rating >= 4.0) {
        anomalies.push(`${b.brand} has a high overall rating (${b.avg_rating.toFixed(1)}★) but poor ${aspect} sentiment (${score.toFixed(1)}/100). This indicates recurring ${aspect}-related complaints that are hidden behind good headline metrics.`);
      }
    }
    // High discount but low value index
    if (b.avg_discount_pct > 70 && b.value_for_money.value_index < 40) {
      anomalies.push(`${b.brand} offers deep discounts (${b.avg_discount_pct.toFixed(1)}% avg) but still scores a low value index (${b.value_for_money.value_index.toFixed(1)}). Steep discounting is not translating into perceived value, suggesting inflated MRPs or quality issues outweighing savings.`);
    }
  }

  // Actionable recommendations per insight
  const recommendations = [
    "→ Action: Brands competing against Skybags in the budget segment should invest in quality assurance and warranty messaging to differentiate on reliability.",
    "→ Action: Buyers should compare Nasher Miles actual selling prices to competitors rather than relying on the displayed discount percentage.",
    "→ Action: VIP needs to either justify premium pricing through measurable quality improvements, or reposition into the mid-range segment.",
    "→ Action: Safari should invest in post-purchase customer engagement and address root causes of negative review text to align sentiment with its star ratings.",
    "→ Action: Aristocrat should maintain its current positioning and consider modest price increases that preserve its value advantage while improving margins."
  ];

  return (
    <>
      <div className="page-header">
        <h1>Agent Insights</h1>
        <p>AI-generated conclusions and anomaly detection from market data</p>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-label">Sentiment Leader</div>
          <div className="kpi-value" style={{ color: 'var(--brand-primary)' }}>{topBrand.brand}</div>
          <div className="kpi-sub">Score {topBrand.sentiment_score.toFixed(1)}/100</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Best Value For Money</div>
          <div className="kpi-value" style={{ color: '#059669' }}>{bestValue.brand}</div>
          <div className="kpi-sub">Value index {bestValue.value_for_money.value_index.toFixed(1)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Highest Average Discount</div>
          <div className="kpi-value" style={{ color: '#d97706' }}>{mostDiscount.brand}</div>
          <div className="kpi-sub">{mostDiscount.avg_discount_pct.toFixed(1)}% avg off MRP</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Executive Summary: 5 Non-Obvious Conclusions</div>
        {insights.map((insight, i) => (
          <div className="insight-card" key={i}>
            <div className="insight-number">Insight 0{i + 1}</div>
            <div style={{ paddingBottom: 6 }}>{insight}</div>
            {recommendations[i] && (
              <div className="action-rec">
                {recommendations[i]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Anomaly detection */}
      {anomalies.length > 0 && (
        <div className="card">
          <div className="card-title">⚠ Automated Anomaly Detection</div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            Our system flagged algorithmic contradictions between ratings, sentiment, aspect scores, and pricing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {anomalies.map((a, i) => (
              <div className="anomaly-alert" key={i}>
                <span className="anomaly-icon">⚠️</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Review Authenticity & Trust Signals</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Analyzed {brands.reduce((s, b) => s + b.review_count, 0).toLocaleString()} reviews for suspicious patterns.
        </p>
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Verified Purchase %</th>
              <th>Rating Skew</th>
              <th>Repetition Score</th>
              <th>System Flags</th>
            </tr>
          </thead>
          <tbody>
            {brands.map(b => (
              <tr key={b.brand}>
                <td style={{ fontWeight: 600 }}>{b.brand}</td>
                <td className="numeric">{b.trust_signals.verified_pct.toFixed(1)}%</td>
                <td className="numeric">{b.trust_signals.rating_skew.toFixed(1)}%</td>
                <td className="numeric">{b.trust_signals.repetition_score.toFixed(1)}%</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {b.trust_signals.flags?.length > 0
                      ? b.trust_signals.flags.map((f, i) => (
                          <span key={i} className="badge badge-amber">{f}</span>
                        ))
                      : <span className="badge badge-green">No suspicious patterns</span>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}