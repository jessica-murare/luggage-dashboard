export default function AgentInsights({ brands }) {
  const topBrand = [...brands].sort((a, b) => b.sentiment_score - a.sentiment_score)[0];
  const worstBrand = [...brands].sort((a, b) => a.sentiment_score - b.sentiment_score)[0];
  const bestValue = [...brands].sort((a, b) => b.value_for_money.value_index - a.value_for_money.value_index)[0];
  const worstValue = [...brands].sort((a, b) => a.value_for_money.value_index - b.value_for_money.value_index)[0];
  const mostDiscount = [...brands].sort((a, b) => b.avg_discount_pct - a.avg_discount_pct)[0];
  const priciest = [...brands].sort((a, b) => b.avg_price - a.avg_price)[0];

  // Use LLM-generated insights if available, otherwise compute from data
  const llmInsights = brands[0]?.agent_insights || [];

  // Generate data-driven insights from actual brand metrics
  const computedInsights = [];

  // Insight 1: Sentiment-rating disconnect
  const disconnects = brands.filter(b => b.avg_rating >= 4.0 && b.sentiment_score < 62);
  if (disconnects.length > 0) {
    const names = disconnects.map(b => b.brand).join(' and ');
    computedInsights.push(
      `${names} ${disconnects.length > 1 ? 'exhibit' : 'exhibits'} a rating-sentiment paradox: ${disconnects.length > 1 ? 'they maintain' : 'it maintains'} ${disconnects[0].avg_rating.toFixed(1)}★+ ratings but sentiment scores below 62/100. This suggests inflated star ratings possibly driven by return-and-replace cycles, where dissatisfied buyers get replacements and don't update their reviews.`
    );
  } else {
    computedInsights.push(
      `All tracked brands show healthy alignment between star ratings and NLP sentiment scores. ${topBrand.brand} leads with ${topBrand.sentiment_score.toFixed(1)}/100 sentiment at ${topBrand.avg_rating.toFixed(1)}★, indicating genuine customer satisfaction rather than inflated ratings.`
    );
  }

  // Insight 2: Value vs discount paradox
  if (mostDiscount.avg_discount_pct > 65 && mostDiscount.value_for_money.value_index < 45) {
    computedInsights.push(
      `${mostDiscount.brand}'s aggressive ${mostDiscount.avg_discount_pct.toFixed(0)}% average discount strategy is backfiring — its value index is only ${mostDiscount.value_for_money.value_index.toFixed(1)}, compared to ${bestValue.brand}'s ${bestValue.value_for_money.value_index.toFixed(1)}. Inflated MRPs (avg ₹${mostDiscount.avg_mrp?.toLocaleString() || 'N/A'}) are eroding trust rather than creating perceived deals. Buyers are comparing actual selling prices, not discounts.`
    );
  } else {
    computedInsights.push(
      `${bestValue.brand} dominates value perception with a value index of ${bestValue.value_for_money.value_index.toFixed(1)} despite being in the ${bestValue.value_for_money.price_band} segment. This positions it as the optimal choice for value-conscious buyers seeking quality without premium pricing.`
    );
  }

  // Insight 3: Aspect-level hidden weakness
  const hiddenWeaknesses = [];
  for (const b of brands) {
    const asp = b.aspect_sentiment || {};
    for (const [aspect, score] of Object.entries(asp)) {
      if (score !== null && score < 55 && b.avg_rating >= 4.0) {
        hiddenWeaknesses.push({ brand: b.brand, aspect, score });
      }
    }
  }
  if (hiddenWeaknesses.length > 0) {
    const worst = hiddenWeaknesses.sort((a, b) => a.score - b.score)[0];
    computedInsights.push(
      `Hidden quality gap detected: ${worst.brand}'s ${worst.aspect} sentiment is only ${worst.score.toFixed(1)}/100 despite a 4.0+ overall rating. ${hiddenWeaknesses.length > 1 ? `This pattern repeats across ${hiddenWeaknesses.length} brand-aspect combinations.` : ''} These hidden complaints represent a competitive vulnerability that rivals could exploit through targeted messaging.`
    );
  } else {
    computedInsights.push(
      `No critical hidden weaknesses detected across the 6 aspect dimensions (wheels, handle, zipper, material, size, weight). All brands maintain aspect-level sentiment above 55/100, indicating consistent product quality across components.`
    );
  }

  // Insight 4: Premium vs budget positioning
  const cheapest = [...brands].sort((a, b) => a.avg_price - b.avg_price)[0];
  const priceGap = priciest.avg_price - cheapest.avg_price;
  const sentimentGap = cheapest.sentiment_score - priciest.sentiment_score;
  if (sentimentGap > 0) {
    computedInsights.push(
      `${cheapest.brand} at ₹${cheapest.avg_price.toLocaleString()} avg price outperforms ${priciest.brand} at ₹${priciest.avg_price.toLocaleString()} in consumer sentiment (${cheapest.sentiment_score.toFixed(1)} vs ${priciest.sentiment_score.toFixed(1)}). The ₹${priceGap.toLocaleString()} price premium commands no quality premium in the consumer's mind — a failure of brand positioning for ${priciest.brand}.`
    );
  } else {
    computedInsights.push(
      `${priciest.brand}'s premium pricing at ₹${priciest.avg_price.toLocaleString()} avg is justified by superior sentiment (${priciest.sentiment_score.toFixed(1)}/100), validating its brand positioning strategy. Consumers perceive real quality differentiation at higher price points.`
    );
  }

  // Insight 5: Trust signal pattern
  const flaggedBrands = brands.filter(b => b.trust_signals.flags && b.trust_signals.flags.length >= 2);
  if (flaggedBrands.length > 0) {
    computedInsights.push(
      `${flaggedBrands.length} of ${brands.length} brands trigger multiple trust flags (rating skew + repetition). ${flaggedBrands.map(b => b.brand).join(', ')} all show unusual 5★/1★ polarization combined with repeated review text. This bimodal pattern suggests either aggressive solicitation of positive reviews or a genuine love-it-or-hate-it product quality variance.`
    );
  } else {
    computedInsights.push(
      `Review authenticity appears strong across the market. No brands trigger multiple trust flags simultaneously, indicating organic review patterns without significant manipulation.`
    );
  }

  const insights = llmInsights.length >= 5 ? llmInsights : computedInsights;

  // Context-aware recommendations matched to each insight
  const recommendations = [
    disconnects.length > 0
      ? "Invest in post-purchase customer engagement to align sentiment with star ratings. Address root causes of negative reviews rather than relying on replacement cycles."
      : "Maintain current quality standards and continue monitoring sentiment-rating alignment.",
    bestValue.brand === topBrand.brand
      ? `${bestValue.brand} should consider modest price increases that preserve value perception while improving margins.`
      : `Buyers should compare ${mostDiscount.brand}'s actual selling prices to competitors rather than relying on the discount percentage.`,
    hiddenWeaknesses.length > 0
      ? `${hiddenWeaknesses[0].brand} should invest in ${hiddenWeaknesses[0].aspect} quality improvements and warranty messaging to close the hidden complaint gap.`
      : "Continue monitoring aspect-level sentiment for early detection of emerging quality issues.",
    sentimentGap > 0
      ? `${priciest.brand} must justify premium pricing through tangible quality improvements, or reposition into mid-range before losing market share to higher-value competitors.`
      : `${priciest.brand}'s premium positioning is working — consider expanding the product line to capture adjacent segments.`,
    flaggedBrands.length > 0
      ? "Implement review verification programs and encourage photo/video reviews to build authentic trust signals."
      : "Maintain current review authenticity standards and consider highlighting verified purchase rates in marketing."
  ];

  // Anomaly detection
  const anomalies = [];
  for (const b of brands) {
    if (b.avg_rating >= 4.0 && b.sentiment_score < 60) {
      anomalies.push({
        title: "Sentiment vs Rating Skew",
        severity: "CRITICAL",
        text: `${b.brand} maintains a ${b.avg_rating.toFixed(1)}★ rating but has a sentiment of ${b.sentiment_score.toFixed(1)}/100. Disconnect detected.`,
        value: 75
      });
    }
    const asp = b.aspect_sentiment || {};
    for (const [aspect, score] of Object.entries(asp)) {
      if (score !== null && score < 50 && b.avg_rating >= 4.0) {
        anomalies.push({
          title: `Hidden ${aspect} Issues`,
          severity: "MODERATE",
          text: `${b.brand} has high ratings but poor ${aspect} sentiment (${score.toFixed(1)}/100). Hidden complaints identified.`,
          value: 60
        });
      }
    }
    if (b.avg_discount_pct > 70 && b.value_for_money.value_index < 40) {
      anomalies.push({
        title: "Ineffective Discounting",
        severity: "CRITICAL",
        text: `${b.brand} offers ${b.avg_discount_pct.toFixed(1)}% off but scores a low value index. High MRPs may be driving distrust.`,
        value: 85
      });
    }
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Hero Header */}
      <section className="mb-8 p-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface">Agent Insights</h2>
            <p className="text-on-surface-variant font-body max-w-2xl text-lg">Autonomous AI analysis of market positioning, sentiment anomalies, and actionable strategy.</p>
          </div>
          <div className="bg-secondary-container/20 text-on-secondary-container px-4 py-2.5 rounded-xl flex items-center gap-2 border border-secondary-container">
            <span className="material-symbols-outlined text-lg text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-label font-bold text-xs tracking-widest uppercase">Agent Status: Active</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* AI Summary - Primary Hero Card */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[1.5rem] p-8 flex flex-col justify-between relative overflow-hidden group border border-transparent hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                <h3 className="text-2xl font-headline font-bold text-on-surface">Market Intelligence Summary</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest bg-surface-container-low px-3 py-1 rounded-full">Top Insight</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl font-body leading-relaxed text-slate-700">
                {insights[0] || "Waiting for agent analysis to generate initial market insights framework..."}
              </p>
              {recommendations[0] && (
                <div className="mt-4 p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-xl">
                  <p className="text-sm font-bold text-primary-fixed-variant">Recommended Action:</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{recommendations[0]}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mt-6">
                <span className="bg-surface-container-low px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 font-label tracking-tight">#SentimentLeader {topBrand.brand}</span>
                <span className="bg-surface-container-low px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 font-label tracking-tight">#BestValue {bestValue.brand}</span>
                <span className="bg-surface-container-low px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 font-label tracking-tight">#HighDiscount {mostDiscount.brand}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between border-t border-surface-container-low pt-6">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Processed {brands.reduce((s, b) => s + b.review_count, 0).toLocaleString()} Reviews</p>
            <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-body font-semibold text-sm flex items-center gap-2 hover:bg-primary-container transition-all shadow-md shadow-primary/20">
              Deep Dive Report
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Risk Alerts - Vertical Sidebar Card */}
        <div className="col-span-12 lg:col-span-4 bg-error-container/20 rounded-[1.5rem] p-8 border border-error/10 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-headline font-bold text-error flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              Risk Alerts
            </h3>
            <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{Math.min(anomalies.length, 3)} NEW</span>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: '360px' }}>
            {anomalies.slice(0, 4).map((a, i) => (
              <div className="group cursor-pointer" key={i}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-headline font-semibold text-on-surface text-sm">{a.title}</h4>
                  <span className={`${a.severity === 'CRITICAL' ? 'text-error' : 'text-tertiary'} font-label font-bold text-[10px]`}>{a.severity}</span>
                </div>
                <p className="text-xs text-slate-600 font-body mb-2 leading-relaxed">{a.text}</p>
                <div className={`h-1.5 w-full rounded-full ${a.severity === 'CRITICAL' ? 'bg-error/10' : 'bg-tertiary/10'}`}>
                  <div className={`h-full rounded-full ${a.severity === 'CRITICAL' ? 'bg-error' : 'bg-tertiary'}`} style={{ width: `${a.value}%` }}></div>
                </div>
              </div>
            ))}
            {anomalies.length === 0 && (
              <div className="text-sm font-medium text-slate-500 py-10 text-center">No anomalies detected in current active data stream.</div>
            )}
          </div>
        </div>

        {/* Strategic Recommendations - Wide Bento Section */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          {insights[1] && (
            <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm border border-surface-container-low hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                </div>
                <h3 className="text-lg font-headline font-bold mb-3 text-on-surface">Insight 02</h3>
                <p className="text-sm text-slate-600 font-body mb-6 leading-relaxed flex-1">{insights[1]}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-4 p-2 bg-primary/5 rounded-lg">{recommendations[1]}</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary">High Impact</span>
                  <button className="text-primary font-bold text-xs font-label hover:underline">Execute Strategy</button>
                </div>
              </div>
            </div>
          )}

          {/* Card 2 */}
          {insights[2] && (
            <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm border border-surface-container-low hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                </div>
                <h3 className="text-lg font-headline font-bold mb-3 text-on-surface">Insight 03</h3>
                <p className="text-sm text-slate-600 font-body mb-6 leading-relaxed">{insights[2]}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-4 p-2 bg-primary/5 rounded-lg">{recommendations[2]}</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">Efficiency</span>
                  <button className="text-primary font-bold text-xs font-label hover:underline">Review Details</button>
                </div>
              </div>
            </div>
          )}

          {/* Card 3 */}
          {insights[3] && (
            <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm border border-surface-container-low hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                </div>
                <h3 className="text-lg font-headline font-bold mb-3 text-on-surface">Insight 04</h3>
                <p className="text-sm text-slate-600 font-body mb-6 leading-relaxed">{insights[3]}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-4 p-2 bg-primary/5 rounded-lg">{recommendations[3]}</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-tertiary">New Market</span>
                  <button className="text-primary font-bold text-xs font-label hover:underline">Analyze Core</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Top Opportunities / Remaining Insights */}
        {insights[4] && (
          <div className="col-span-12 bg-surface-container-low rounded-[1.5rem] p-8 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-headline font-bold text-on-surface">Final Insight Opportunity</h3>
              <span className="material-symbols-outlined text-primary">rocket_launch</span>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-6 shadow-sm">
              <div className="w-20 h-20 rounded-xl bg-primary-container flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold font-label text-on-primary-container opacity-80">SCORE</span>
                <span className="text-2xl font-bold font-headline text-on-primary-container mt-1">94</span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline text-lg font-bold text-on-surface mb-2">Insight 05</h4>
                <p className="text-sm text-slate-600 font-body leading-relaxed">{insights[4]}</p>
                <p className="text-sm font-semibold text-primary mt-2">Action: {recommendations[4]}</p>
              </div>
              <button className="w-10 h-10 rounded-full hover:bg-surface-container-low flex items-center justify-center transition-colors mr-2">
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
            </div>
          </div>
        )}

        {/* Trust Signals Table (Carried over) */}
        <div className="col-span-12 bg-surface-container-lowest rounded-[1.5rem] shadow-[0_8px_32px_rgba(20,27,43,0.06)] overflow-hidden mt-4">
           <div className="p-8 border-b border-surface-container-low">
              <h3 className="text-xl font-bold font-headline text-on-surface">Review Authenticity & Trust Signals</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">Algorithmic analysis detecting suspicious patterns across {brands.reduce((s, b) => s + b.review_count, 0).toLocaleString()} reviews.</p>
           </div>
           
           <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
                <tr>
                  <th className="px-8 py-4">Brand</th>
                  <th className="px-6 py-4">Verified Purchase %</th>
                  <th className="px-6 py-4">Rating Skew</th>
                  <th className="px-6 py-4">Repetition Score</th>
                  <th className="px-6 py-4">System Flags</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-surface-container-low">
                {brands.map((b, i) => (
                  <tr key={b.brand} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-on-surface">{b.brand}</td>
                    <td className="px-6 py-4 numeric">
                      <span className={`${b.trust_signals.verified_pct < 60 ? 'text-error font-bold' : 'text-slate-600'}`}>
                        {b.trust_signals.verified_pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 numeric">
                      <span className={`${b.trust_signals.rating_skew > 30 ? 'text-error font-bold' : 'text-slate-600'}`}>
                        {b.trust_signals.rating_skew.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 numeric">
                      <span className={`${b.trust_signals.repetition_score > 25 ? 'text-error font-bold' : 'text-slate-600'}`}>
                        {b.trust_signals.repetition_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {b.trust_signals.flags?.length > 0
                          ? b.trust_signals.flags.map((f, idx) => (
                              <span key={idx} className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-bold">{f}</span>
                            ))
                          : <span className="bg-green-100 text-green-800 border border-green-200 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">verified</span> Clean</span>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}