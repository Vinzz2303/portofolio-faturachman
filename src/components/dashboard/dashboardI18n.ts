import type { DashboardCopy, Language } from './types'

const dashboardTranslations = {
  en: {
    heroTitle: 'Today Status',
    heroLead: 'A clarity-first read on market state, portfolio fit, and the next sensible action.',
    marketLabel: 'Market',
    riskLabel: 'Risk',
    youLabel: 'You',
    planLabel: 'Plan',
    todayInsight: 'Today Insight',
    portfolioFit: 'Portfolio Fit',
    aiReasoning: 'AI Reasoning',
    advancedContext: 'Advanced Context',
    marketConditionLabel: 'Market Condition',
    riskLevelLabel: 'Risk Level',
    portfolioFitLabel: 'Portfolio Fit',
    confidenceLabel: 'Confidence',
    loadingBrief: 'Loading brief...',
    noInsight: 'No insight is available yet.',
    freeTeaser: 'Free gives awareness. Pro gives deeper implication.',
    proTeaser: 'Pro unlocks fuller reasoning and portfolio implication.',
    secondaryContext: 'Secondary context',
    whatChanged: 'What changed',
    whatToWatch: 'What to watch',
    nextStep: 'Next step',
    actionStance: 'Action stance',
    actionSummary: 'Action summary',
    actionFocus: 'Action focus',
    decisionIntelligenceLabel: 'Decision Intelligence',
    signalAgreementLabel: 'Signal agreement',
    confidenceLevelLabel: 'Confidence level',
    triggerGuidanceLabel: 'What would change this',
    claritySnapshot: 'Clarity Snapshot',
    heroSummary: 'Market, risk, and implication at a glance.',
    contextLayer: 'Context Layer',
    contextLayerLead: 'Quick supporting market context to frame the main read without turning this into a full data dashboard.',
    contextWaiting: 'Waiting',
    goldLabel: 'Gold',
    bitcoinLabel: 'Bitcoin',
    usIndexLabel: 'US Index',
    ihsgLabel: 'IHSG',
    lastUpdateLabel: 'Last update',
    changeLabel: 'Change',
    newsIntelligence: 'News Intelligence',
    newsIntelligenceLead: 'A small relevance layer to help read whether a headline still matters, is likely priced in, or is mostly noise.',
    relevanceFresh: 'Fresh',
    relevanceLikelyPricedIn: 'Likely priced in',
    relevanceNoise: 'Noise',
    relevanceHigh: 'High relevance',
    relevanceLabel: 'Relevance',
    askTingAi: 'Ask Ting AI',
    askTingAiLead: 'Use reasoning-first prompts to explore context, pricing, and portfolio risk without turning this into a signal box.',
    askTingAiPlaceholder: 'Ask about market context, risk, pricing, or headline behavior...',
    askTingAiDisabled: 'Prototype only. Interactive answers are not enabled yet.',
    askPromptOne: 'What is the market pricing in today?',
    askPromptTwo: 'Is this news already priced in?',
    askPromptThree: 'What is my biggest risk?',
    askPromptFour: 'Why is the market moving against the headline?',
    planPro: 'Pro',
    planFree: 'Free',
    mainImplicationLabel: 'Main implication',
    fitLevelLabel: 'Fit level',
    userStatusLabel: 'User status',
    whyItFitsLabel: 'Why it fits',
    portfolioPostureLabel: 'Portfolio posture',
    exposureNoteLabel: 'Exposure note',
    situationLabel: 'Situation',
    myConditionLabel: 'My condition',
    implicationLabel: 'Implication',
    insightHighlightsLabel: 'Insight Highlights',
    insightModeLabel: 'Insight Mode',
    insightModeText: 'Default mode stays meaning-first. Raw detail stays below the fold.',
    screenerLabel: 'Screener',
    screenerInsightLabel: 'Screener insight',
    screenerInsightText: 'Many assets are oversold, indicating strong selling pressure.',
    screenerSummaryLabel: 'Summary',
    dataModeLabel: 'Data mode',
    screenerDataText: 'OpenBB or screener rows can appear here after the user expands this section.',
    technicalLabel: 'Technical',
    technicalInsightLabel: 'Technical insight',
    technicalInsightText: 'Volatility is increasing, showing a less stable market.',
    technicalPostureLabel: 'Technical posture',
    technicalDataText: 'Indicators like RSI, trend, and volatility are only shown after expansion.',
    macroLabel: 'Macro',
    macroInsightLabel: 'Macro insight',
    macroInsightText: 'Defensive assets are gaining strength while risk assets weaken.',
    macroRelationLabel: 'Macro relation',
    macroDataText: 'Yield, gold, equity, and proxy relations stay hidden until the user expands.',
    showDataDetailLabel: 'Show data detail',
    dataDetailText:
      'Raw market detail stays behind this expand action to keep the main dashboard responsive.',
    marketRegime_defensive: 'Defensive',
    marketRegime_risk_on: 'Risk appetite improving',
    marketRegime_neutral: 'Neutral',
    riskLevel_high: 'High',
    riskLevel_elevated: 'Elevated',
    riskLevel_moderate: 'Moderate',
    fitLevel_good_fit: 'Good fit',
    fitLevel_moderate_fit: 'Moderate fit',
    fitLevel_weak_fit: 'Weak fit',
    userStatus_overexposed: 'Overexposed',
    userStatus_watchful: 'Watchful',
    userStatus_defensive_tilt: 'Defensive tilt',
    userStatus_concentrated: 'Concentrated',
    userStatus_reasonably_aligned: 'Reasonably aligned',
    userStatus_selective: 'Selective',
    implication_aggressive_regime:
      'Your portfolio is leaning too aggressively for the current regime, which makes downside pressure more relevant.',
    implication_growth_pressure:
      'Your portfolio still carries growth pressure, so a defensive market can reduce your margin for error.',
    implication_defensive_tilt:
      'Your portfolio is relatively protected, but a stronger risk-on tape may leave some upside participation behind.',
    implication_concentrated:
      'Your portfolio may still work in this regime, but concentration keeps the outcome tied too closely to a narrow set of positions.',
    implication_reasonably_aligned:
      'Your portfolio looks reasonably aligned with current conditions, so discipline matters more than a major repositioning.',
    implication_selective:
      'Your portfolio is still workable in the current regime, but selectivity matters because the fit is not fully clean.',
    portfolioFit_aligned: 'Portfolio fit looks reasonably aligned with the current regime.',
    portfolioFit_attention: 'Portfolio fit needs closer attention against the current regime.',
    concentrationRisk_default: 'Concentration risk deserves attention before adding exposure.',
    stance_hold_steady: 'Hold steady',
    stance_be_selective: 'Be selective',
    stance_tighten_risk: 'Tighten risk',
    stance_reduce_concentration: 'Reduce concentration',
    signalAgreement_aligned: 'Aligned',
    signalAgreement_mixed: 'Mixed',
    signalAgreement_defensive: 'Defensive',
    signalAgreement_constructive: 'Constructive',
    confidence_low: 'Low',
    confidence_moderate: 'Moderate',
    confidence_high: 'High',
    decisionSummary_defensive_low:
      'Signals are defensive and confidence is low, so this read is better treated as a warning than a firm conclusion.',
    decisionSummary_defensive_moderate:
      'Signals are leaning defensive with moderate confidence, so caution is justified even though confirmation is still incomplete.',
    decisionSummary_defensive_high:
      'Signals are clearly defensive and confidence is high enough that downside sensitivity deserves respect.',
    decisionSummary_mixed_low:
      'Signals are mixed and confidence is low, so this read should stay lightweight until the market looks cleaner.',
    decisionSummary_mixed_moderate:
      'Signals are mixed with moderate confidence, so this is useful as guidance but not yet clean confirmation.',
    decisionSummary_mixed_high:
      'Signals are still mixed, but confidence is high enough to stay disciplined around the main conflict rather than forcing a clean narrative.',
    decisionSummary_aligned_low:
      'Portfolio fit still looks aligned, but confidence is low, so stay measured and let the next confirmation arrive first.',
    decisionSummary_aligned_moderate:
      'Portfolio fit looks aligned with moderate confidence, so the read is usable but still needs discipline.',
    decisionSummary_aligned_high:
      'Portfolio fit looks aligned and confidence is high enough to trust the current read without forcing extra action.',
    decisionSummary_constructive_low:
      'Signals are becoming constructive, but confidence is still low, so treat this as an early improvement rather than full confirmation.',
    decisionSummary_constructive_moderate:
      'Signals are constructive with moderate confidence, so the setup looks healthier but still needs selectivity.',
    decisionSummary_constructive_high:
      'Signals are constructive and confidence is strong enough that the current setup deserves respect.',
    reasoningImplication_good:
      'Because market conditions and portfolio structure are still fairly aligned, the main job now is to protect quality and avoid unnecessary repositioning.',
    reasoningImplication_moderate:
      'Because support is not fully clean yet, results will be driven more by selectivity and sizing than by taking many actions.',
    reasoningImplication_weak:
      'Because market direction and portfolio structure are not supporting each other well, even small pressure can feel larger in portfolio results.',
    trigger_defensive_1: 'This stance improves if market pressure becomes less defensive.',
    trigger_defensive_2: 'This stance changes faster if concentration and downside sensitivity come down.',
    trigger_mixed_1: 'This stance improves if portfolio fit starts to look cleaner against the regime.',
    trigger_mixed_2: 'This stance weakens if concentration rises while conditions stay uneven.',
    trigger_constructive_1: 'This stance softens if risk pressure rises or regime support fades.',
    trigger_constructive_2: 'This stance stays constructive while concentration remains controlled.',
    trigger_aligned_1: 'This stance holds while portfolio fit stays consistent with current conditions.',
    trigger_aligned_2: 'This stance changes if concentration or risk pressure starts to climb.',
    trigger_low_1: 'Confidence rises if exposure becomes easier to defend.',
    trigger_low_2: 'Confidence stays low while concentration and risk pressure remain elevated.',
    trigger_moderate_1: 'Confidence improves if regime and portfolio fit move into cleaner alignment.',
    trigger_moderate_2: 'Confidence falls if the portfolio starts leaning harder against the market.',
    trigger_high_1: 'Confidence stays strong while regime tone remains supportive.',
    trigger_high_2: 'Confidence drops if concentration starts to narrow portfolio flexibility.',
    advancedScreener_weakening: 'Most assets are weakening and breadth still looks fragile.',
    advancedScreener_selective_strength:
      'Selective strength is emerging, but leadership is not yet broad.',
    advancedScreener_broad_strength:
      'Leadership is broadening and market participation is starting to look healthier.',
    advancedScreener_breadth_limited:
      'Breadth remains limited, so confirmation still looks uneven.',
    advancedScreenerDetail_weakening:
      'Weak breadth still means selling pressure is doing more of the talking than leadership.',
    advancedScreenerDetail_selective_strength:
      'Strength is showing up in pockets, but the market is not yet moving with broad participation.',
    advancedScreenerDetail_broad_strength:
      'More groups are helping the move, so market support looks wider than a narrow bounce.',
    advancedScreenerDetail_breadth_limited:
      'Participation is still thin, so a few strong names are not enough to confirm a broader shift.',
    advancedContext_holdback: 'Macro pressure is still holding confirmation back.',
    advancedContext_support_building: 'Support is improving, but confirmation is still limited.',
    advancedContext_confirmation_limited: 'Confirmation still looks limited.',
    advancedTechnical_improving:
      'Momentum is improving, but follow-through still needs confirmation.',
    advancedTechnical_weakening:
      'Technical posture is weakening and short-term pressure is still present.',
    advancedTechnical_mixed:
      'Technical posture is mixed, so short-term conviction still looks limited.',
    advancedTechnical_butMacroRestrictive:
      'Technical conditions are improving, but macro pressure remains restrictive.',
    advancedTechnical_supportNotBroken:
      'Broader support is not fully breaking, but pressure still needs watching.',
    advancedTechnical_confirmationLimited:
      'Signals are becoming more active, but confirmation is still limited.',
    advancedTechnical_followThroughWatch:
      'Signals look cleaner, but follow-through still needs watching.',
    advancedTechnicalDetail_improving:
      'Momentum and trend are leaning better, but volatility still decides whether the move can hold.',
    advancedTechnicalDetail_weakening:
      'Momentum is still slipping and short-term pressure is making the tape easier to break than to trust.',
    advancedTechnicalDetail_mixed:
      'Trend and pressure are not yet lining up cleanly, so short-term conviction should stay measured.',
    advancedMacro_supportive:
      'Current macro relation is supportive enough for a constructive stance, with discipline still needed.',
    advancedMacro_neutral:
      'Current macro relation is neutral, so market context is not giving a strong extra push yet.',
    advancedMacro_restrictive:
      'Current macro relation is restrictive, so adding risk needs more caution.',
    advancedMacro_stressStillHigh:
      'Market stress is still elevated, so confirmation should stay selective.',
    advancedMacro_pressureEasing:
      'Pressure is easing a bit, but it is not fully out of the way yet.',
    advancedMacro_otherSignalsLead:
      'Other signals still need to do more of the work here.',
    advancedMacroDetail_supportive:
      'Macro pressure is not getting in the way enough to dominate the current market read.',
    advancedMacroDetail_neutral:
      'Macro is not clearly helping or hurting yet, so other signals still deserve more weight.',
    advancedMacroDetail_restrictive:
      'Macro pressure is still tight enough that upside needs stronger confirmation before it looks durable.',
    actionSummary_reduce_concentration:
      'Keep new adds measured and reduce dependence on a narrow set of positions before pressing further.',
    actionSummary_tighten_risk:
      'Protect downside first so the portfolio is not carrying more pressure than this regime supports.',
    actionSummary_be_selective:
      'The portfolio can still work here, but quality of positioning matters more than speed.',
    actionSummary_hold_steady:
      'Current posture looks constructive enough to stay disciplined without forcing major changes.',
    actionSummary_default:
      'Stay practical and keep the next move measured until the portfolio fit becomes clearer.',
    actionBullet_reduce_concentration_1: 'Avoid adding aggressively into the same crowded exposure.',
    actionBullet_reduce_concentration_2: 'Use this stretch to rebalance toward a steadier mix.',
    actionBullet_reduce_concentration_3: 'Let concentration come down before taking bigger risk.',
    actionBullet_tighten_risk_1: 'Slow down new risk until portfolio posture looks cleaner.',
    actionBullet_tighten_risk_2: 'Trim the exposures that are most vulnerable in this regime.',
    actionBullet_tighten_risk_3: 'Favor resilience over chasing short-term moves.',
    actionBullet_be_selective_1: 'Keep new adds focused on the clearest setups.',
    actionBullet_be_selective_2: 'Avoid letting mixed conditions push you into noisy decisions.',
    actionBullet_be_selective_3:
      'Watch whether concentration starts to make the fit less stable.',
    actionBullet_hold_steady_1: 'Let alignment work before making unnecessary adjustments.',
    actionBullet_hold_steady_2: 'Keep position quality high instead of reaching for extra risk.',
    actionBullet_hold_steady_3: 'Reassess only if regime tone starts to shift.',
    actionBullet_default_1: 'Prioritize clearer opportunities over broad risk-taking.',
    actionBullet_default_2: 'Keep the portfolio flexible while conditions remain mixed.',
    aiPreview_situation_defensive: 'Market is leaning defensive.',
    aiPreview_situation_risk_on: 'Market risk appetite is improving.',
    aiPreview_situation_neutral: 'Market is staying balanced.',
    aiFull_situation_defensive: 'Market is leaning defensive and downside sensitivity is higher.',
    aiFull_situation_risk_on: 'Risk appetite is improving, but selectivity still matters.',
    aiFull_situation_neutral: 'Market conditions are balanced and still require discipline.',
    aiFull_condition_good:
      '{userStatus}. Portfolio posture still looks aligned with the current regime.',
    aiFull_condition_moderate:
      '{userStatus}. Portfolio can still work, but it needs tighter positioning in this regime.',
    aiFull_condition_weak:
      '{userStatus}. Portfolio posture is not lining up well with the current regime.',
    aiFull_watch_good:
      'Keep monitoring whether the current alignment still holds if market tone starts to shift.',
    aiFull_watch_moderate:
      'Watch whether concentration and exposure become harder to defend if volatility rises again.',
    aiFull_watch_weak:
      'Watch whether current exposure and concentration make the portfolio too vulnerable for this market tone.',
    portfolioWhy_good:
      'Positioning still looks aligned because portfolio posture matches the current market tone.',
    portfolioWhy_moderate:
      'Positioning is only partly aligned because the portfolio can still work, but it needs tighter selectivity.',
    portfolioWhy_weak:
      'Positioning looks misaligned because portfolio posture is leaning against the current market regime.',
    portfolioPosture_good: 'Portfolio posture still looks compatible with the current market regime.',
    portfolioPosture_moderate:
      'Portfolio stance is still workable, but it needs more selectivity in this regime.',
    portfolioPosture_weak: 'Portfolio posture is not lining up well with the current market regime.',
    exposureNote_overexposed: 'Exposure still looks too aggressive for the current market tone.',
    exposureNote_watchful: 'Positioning is manageable, but concentration still needs attention.',
    exposureNote_aligned: 'Exposure still looks balanced enough for the current backdrop.',
    advancedLine_overexposed:
      'Your exposure looks heavier than the current regime can comfortably absorb.',
    advancedLine_watchful:
      'Conditions are mixed, so staying selective matters more than acting fast.',
    advancedLine_aligned: 'Alignment is acceptable, but the regime still calls for discipline.',
    previewCta_free: 'Understand the portfolio impact',
    previewCta_pro: 'View the full implication',
    changeAwareness: 'Change Awareness',
    conditionMostlyUnchanged: 'Condition mostly unchanged',
    mainPoint: 'Main point',
    tradeOff: 'Trade-off',
    basedOn: 'Based on',
    viewFullExplanation: 'View full explanation',
    optional: 'Optional',
    allocationWeight: 'Allocation weight',
    pressureLevel: 'Pressure level',
    nextSensibleAction: 'Next sensible action',
    nextSensibleActionText: 'Pause adding new exposure until market pressure becomes clearer.',
    whyCheckAgain: 'Why check again',
    marketSummary: 'Market summary',
    insightBadgeLabel: 'Main insight',
    portfolioAware: 'Portfolio-aware',
    portfolioPending: 'Portfolio pending'
  },
  id: {
    heroTitle: 'Status Hari Ini',
    heroLead: 'Pembacaan ringkas tentang kondisi pasar, kecocokan portofolio, dan langkah masuk akal berikutnya.',
    marketLabel: 'Pasar',
    riskLabel: 'Risiko',
    youLabel: 'Anda',
    planLabel: 'Paket',
    todayInsight: 'Insight Hari Ini',
    portfolioFit: 'Kecocokan Portofolio',
    aiReasoning: 'Penjelasan AI',
    advancedContext: 'Konteks Lanjutan',
    marketConditionLabel: 'Kondisi Pasar',
    riskLevelLabel: 'Tingkat Risiko',
    portfolioFitLabel: 'Kecocokan Portofolio',
    confidenceLabel: 'Keyakinan',
    loadingBrief: 'Memuat status hari ini...',
    noInsight: 'Insight belum tersedia.',
    freeTeaser: 'Mode gratis memberi gambaran awal. Pro memberi implikasi yang lebih dalam.',
    proTeaser: 'Pro membuka penjelasan yang lebih utuh dan relevan terhadap portofolio Anda.',
    secondaryContext: 'Konteks tambahan',
    whatChanged: 'Apa yang berubah',
    whatToWatch: 'Yang perlu diperhatikan',
    nextStep: 'Langkah berikutnya',
    actionStance: 'Arah tindakan',
    actionSummary: 'Ringkasan tindakan',
    actionFocus: 'Fokus tindakan',
    decisionIntelligenceLabel: 'Inteligensi keputusan',
    signalAgreementLabel: 'Keselarasan sinyal',
    confidenceLevelLabel: 'Tingkat keyakinan',
    triggerGuidanceLabel: 'Apa yang akan mengubah ini',
    claritySnapshot: 'Ringkasan Jernih',
    heroSummary: 'Pasar, risiko, dan implikasi dalam satu pandangan.',
    contextLayer: 'Lapisan Konteks',
    contextLayerLead: 'Konteks pasar pendukung yang cepat dibaca untuk membantu membingkai pembacaan utama tanpa mengubah dashboard ini menjadi panel data penuh.',
    contextWaiting: 'Menunggu',
    goldLabel: 'Emas',
    bitcoinLabel: 'Bitcoin',
    usIndexLabel: 'Indeks AS',
    ihsgLabel: 'IHSG',
    lastUpdateLabel: 'Pembaruan terakhir',
    changeLabel: 'Perubahan',
    newsIntelligence: 'Inteligensi Berita',
    newsIntelligenceLead: 'Lapisan relevansi ringan untuk membantu membaca apakah sebuah headline masih penting, kemungkinan sudah tercermin, atau hanya menjadi noise.',
    relevanceFresh: 'Baru',
    relevanceLikelyPricedIn: 'Kemungkinan sudah tercermin',
    relevanceNoise: 'Informasi kurang relevan',
    relevanceHigh: 'Relevansi tinggi',
    relevanceLabel: 'Relevansi',
    askTingAi: 'Tanya Ting AI',
    askTingAiLead: 'Gunakan prompt berbasis reasoning untuk mengeksplor konteks, pricing, dan risiko portofolio tanpa mengubah panel ini menjadi kotak signal.',
    askTingAiPlaceholder: 'Tanyakan konteks pasar, risiko, pricing, atau perilaku headline...',
    askTingAiDisabled: 'Masih berupa prototipe. Jawaban interaktif belum diaktifkan.',
    askPromptOne: 'Apa yang sedang dihargai pasar hari ini?',
    askPromptTwo: 'Apakah berita ini sudah tercermin di harga?',
    askPromptThree: 'Apa risiko terbesar saya?',
    askPromptFour: 'Kenapa market bergerak berlawanan dengan headline?',
    planPro: 'Pro',
    planFree: 'Gratis',
    mainImplicationLabel: 'Implikasi utama',
    fitLevelLabel: 'Tingkat kecocokan',
    userStatusLabel: 'Status Anda',
    whyItFitsLabel: 'Kenapa ini cocok',
    portfolioPostureLabel: 'Posisi portofolio',
    exposureNoteLabel: 'Catatan eksposur',
    situationLabel: 'Situasi',
    myConditionLabel: 'Kondisi saya',
    implicationLabel: 'Implikasi',
    insightHighlightsLabel: 'Sorotan insight',
    insightModeLabel: 'Mode insight',
    insightModeText: 'Mode default tetap fokus pada makna. Detail mentah tetap berada di bagian bawah.',
    screenerLabel: 'Screener',
    screenerInsightLabel: 'Insight screener',
    screenerInsightText: 'Banyak aset sudah berada di area jenuh jual, menandakan tekanan jual masih kuat.',
    screenerSummaryLabel: 'Ringkasan',
    dataModeLabel: 'Mode data',
    screenerDataText: 'Baris OpenBB atau data screener bisa muncul di sini setelah pengguna membuka bagian ini.',
    technicalLabel: 'Teknikal',
    technicalInsightLabel: 'Insight teknikal',
    technicalInsightText: 'Volatilitas sedang naik, menandakan pasar kurang stabil.',
    technicalPostureLabel: 'Postur teknikal',
    technicalDataText:
      'Indikator seperti RSI, tren, dan volatilitas hanya ditampilkan setelah dibuka.',
    macroLabel: 'Makro',
    macroInsightLabel: 'Insight makro',
    macroInsightText: 'Aset defensif menguat saat aset berisiko mulai melemah.',
    macroRelationLabel: 'Relasi makro',
    macroDataText:
      'Relasi yield, emas, ekuitas, dan proxy tetap tersembunyi sampai pengguna membuka bagian ini.',
    showDataDetailLabel: 'Tampilkan detail data',
    dataDetailText:
      'Detail pasar mentah tetap disimpan di balik bagian buka ini agar dashboard utama tetap responsif.',
    marketRegime_defensive: 'Defensif',
    marketRegime_risk_on: 'Minat risiko membaik',
    marketRegime_neutral: 'Netral',
    riskLevel_high: 'Tinggi',
    riskLevel_elevated: 'Meningkat',
    riskLevel_moderate: 'Sedang',
    fitLevel_good_fit: 'Cocok',
    fitLevel_moderate_fit: 'Cukup cocok',
    fitLevel_weak_fit: 'Kurang cocok',
    userStatus_overexposed: 'Terlalu terekspos',
    userStatus_watchful: 'Perlu waspada',
    userStatus_defensive_tilt: 'Condong defensif',
    userStatus_concentrated: 'Terkonsentrasi',
    userStatus_reasonably_aligned: 'Cukup selaras',
    userStatus_selective: 'Perlu selektif',
    implication_aggressive_regime:
      'Portofolio Anda terlalu agresif untuk kondisi saat ini, sehingga tekanan turun menjadi lebih relevan.',
    implication_growth_pressure:
      'Portofolio Anda masih membawa tekanan pertumbuhan, sehingga pasar defensif bisa mempersempit ruang untuk salah langkah.',
    implication_defensive_tilt:
      'Portofolio Anda relatif lebih terlindungi, tetapi fase minat risiko yang lebih kuat bisa membuat sebagian potensi kenaikan tertinggal.',
    implication_concentrated:
      'Portofolio Anda masih bisa berjalan di kondisi ini, tetapi konsentrasi membuat hasil terlalu bergantung pada sedikit posisi.',
    implication_reasonably_aligned:
      'Portofolio Anda terlihat cukup selaras dengan kondisi saat ini, jadi disiplin lebih penting daripada reposisi besar.',
    implication_selective:
      'Portofolio Anda masih cukup bisa berjalan di kondisi saat ini, tetapi selektivitas penting karena kecocokannya belum benar-benar bersih.',
    portfolioFit_aligned: 'Kecocokan portofolio terlihat cukup selaras dengan kondisi saat ini.',
    portfolioFit_attention: 'Kecocokan portofolio perlu perhatian lebih terhadap kondisi saat ini.',
    concentrationRisk_default: 'Risiko konsentrasi perlu diperhatikan sebelum menambah eksposur.',
    stance_hold_steady: 'Tetap tenang',
    stance_be_selective: 'Lebih selektif',
    stance_tighten_risk: 'Perketat risiko',
    stance_reduce_concentration: 'Kurangi konsentrasi',
    signalAgreement_aligned: 'Selaras',
    signalAgreement_mixed: 'Campuran',
    signalAgreement_defensive: 'Defensif',
    signalAgreement_constructive: 'Konstruktif',
    confidence_low: 'Rendah',
    confidence_moderate: 'Sedang',
    confidence_high: 'Tinggi',
    decisionSummary_defensive_low:
      'Sinyal masih defensif dan keyakinannya rendah, jadi pembacaan ini lebih tepat dianggap peringatan daripada kesimpulan yang kuat.',
    decisionSummary_defensive_moderate:
      'Sinyal cenderung defensif dengan keyakinan sedang, jadi sikap hati-hati tetap masuk akal meski konfirmasi belum penuh.',
    decisionSummary_defensive_high:
      'Sinyal terlihat jelas defensif dan keyakinannya cukup kuat untuk menghormati risiko penurunan.',
    decisionSummary_mixed_low:
      'Sinyal masih campuran dan keyakinannya rendah, jadi pembacaan ini sebaiknya tetap ringan sampai pasar terlihat lebih bersih.',
    decisionSummary_mixed_moderate:
      'Sinyal masih campuran dengan keyakinan sedang, jadi pembacaan ini berguna sebagai panduan tetapi belum layak dianggap konfirmasi penuh.',
    decisionSummary_mixed_high:
      'Sinyal masih campuran, tetapi keyakinannya cukup kuat untuk fokus pada konflik utama tanpa memaksa satu narasi yang terlalu bersih.',
    decisionSummary_aligned_low:
      'Kecocokan portofolio masih terlihat selaras, tetapi keyakinannya rendah, jadi tetap terukur sambil menunggu konfirmasi berikutnya.',
    decisionSummary_aligned_moderate:
      'Kecocokan portofolio terlihat selaras dengan keyakinan sedang, jadi pembacaan ini bisa dipakai tetapi tetap perlu disiplin.',
    decisionSummary_aligned_high:
      'Kecocokan portofolio terlihat selaras dan keyakinannya cukup kuat untuk mempercayai pembacaan saat ini tanpa memaksakan aksi tambahan.',
    decisionSummary_constructive_low:
      'Sinyal mulai terlihat konstruktif, tetapi keyakinannya masih rendah, jadi anggap ini sebagai perbaikan awal, bukan konfirmasi penuh.',
    decisionSummary_constructive_moderate:
      'Sinyal terlihat konstruktif dengan keyakinan sedang, jadi kondisi membaik tetapi selektivitas tetap penting.',
    decisionSummary_constructive_high:
      'Sinyal terlihat konstruktif dan keyakinannya cukup kuat sehingga kondisi saat ini layak dihormati.',
    reasoningImplication_good:
      'Karena kondisi pasar dan susunan portofolio masih cukup sejalan, tugas utama sekarang adalah menjaga kualitas posisi dan menghindari reposisi yang tidak perlu.',
    reasoningImplication_moderate:
      'Karena dukungan pasar belum sepenuhnya bersih, hasil akan lebih ditentukan oleh selektivitas dan ukuran posisi daripada banyaknya aksi.',
    reasoningImplication_weak:
      'Karena arah pasar dan susunan portofolio belum saling mendukung dengan baik, tekanan kecil bisa terasa lebih besar pada hasil portofolio.',
    trigger_defensive_1: 'Pandangan ini membaik jika tekanan pasar tidak lagi terlalu defensif.',
    trigger_defensive_2:
      'Pandangan ini lebih cepat berubah jika konsentrasi dan sensitivitas downside mulai turun.',
    trigger_mixed_1:
      'Pandangan ini membaik jika kecocokan portofolio mulai terlihat lebih bersih terhadap kondisi saat ini.',
    trigger_mixed_2:
      'Pandangan ini melemah jika konsentrasi naik saat kondisi pasar masih campuran.',
    trigger_constructive_1:
      'Pandangan ini melembut jika tekanan risiko naik atau dukungan kondisi mulai hilang.',
    trigger_constructive_2:
      'Pandangan ini tetap konstruktif selama konsentrasi tetap terkendali.',
    trigger_aligned_1:
      'Pandangan ini bertahan selama kecocokan portofolio tetap konsisten dengan kondisi saat ini.',
    trigger_aligned_2:
      'Pandangan ini berubah jika konsentrasi atau tekanan risiko mulai naik.',
    trigger_low_1: 'Keyakinan akan naik jika eksposur menjadi lebih mudah dipertahankan.',
    trigger_low_2:
      'Keyakinan tetap rendah selama konsentrasi dan tekanan risiko masih tinggi.',
    trigger_moderate_1:
      'Keyakinan membaik jika kondisi pasar dan kecocokan portofolio bergerak ke keselarasan yang lebih bersih.',
    trigger_moderate_2:
      'Keyakinan melemah jika portofolio mulai semakin berlawanan dengan pasar.',
    trigger_high_1:
      'Keyakinan tetap kuat selama kondisi pasar masih mendukung.',
    trigger_high_2:
      'Keyakinan turun jika konsentrasi mulai mempersempit fleksibilitas portofolio.',
    advancedScreener_weakening:
      'Sebagian besar aset sedang melemah dan breadth pasar masih rapuh.',
    advancedScreener_selective_strength:
      'Kekuatan mulai muncul secara selektif, tetapi kepemimpinan pasar belum melebar.',
    advancedScreener_broad_strength:
      'Kepemimpinan pasar mulai melebar dan partisipasi pasar terlihat lebih sehat.',
    advancedScreener_breadth_limited:
      'Partisipasi pasar masih terbatas, jadi konfirmasi pasar belum terlihat merata.',
    advancedScreenerDetail_weakening:
      'Partisipasi pasar yang lemah berarti tekanan jual masih lebih dominan daripada kepemimpinan pasar.',
    advancedScreenerDetail_selective_strength:
      'Kekuatan mulai muncul di beberapa area, tetapi pasar belum bergerak dengan partisipasi yang luas.',
    advancedScreenerDetail_broad_strength:
      'Semakin banyak kelompok aset ikut menopang gerakan ini, jadi dukungan pasar terlihat lebih lebar.',
    advancedScreenerDetail_breadth_limited:
      'Partisipasi masih tipis, jadi beberapa nama kuat saja belum cukup untuk mengonfirmasi perubahan yang lebih luas.',
    advancedContext_holdback:
      'Tekanan makro masih menahan konfirmasi pasar.',
    advancedContext_support_building:
      'Dukungan mulai membaik, tetapi konfirmasi masih terbatas.',
    advancedContext_confirmation_limited:
      'Konfirmasi masih terlihat terbatas.',
    advancedTechnical_improving:
      'Momentum mulai membaik, tetapi kelanjutan kenaikan masih perlu konfirmasi.',
    advancedTechnical_weakening:
      'Postur teknikal sedang melemah dan tekanan jangka pendek masih terasa.',
    advancedTechnical_mixed:
      'Postur teknikal masih campuran, jadi keyakinan jangka pendek masih terbatas.',
    advancedTechnical_butMacroRestrictive:
      'Kondisi teknikal membaik, tetapi tekanan makro masih restriktif.',
    advancedTechnical_supportNotBroken:
      'Dukungan yang lebih luas belum benar-benar patah, tetapi tekanannya masih perlu dipantau.',
    advancedTechnical_confirmationLimited:
      'Sinyal mulai lebih aktif, tetapi konfirmasinya masih terbatas.',
    advancedTechnical_followThroughWatch:
      'Sinyal terlihat lebih bersih, tetapi kelanjutan kenaikan masih perlu dipantau.',
    advancedTechnicalDetail_improving:
      'Momentum dan trend mulai membaik, tetapi volatilitas tetap menentukan apakah gerakan ini bisa bertahan.',
    advancedTechnicalDetail_weakening:
      'Momentum masih melemah dan tekanan jangka pendek membuat pasar lebih mudah patah daripada dipercaya.',
    advancedTechnicalDetail_mixed:
      'Trend dan tekanan belum benar-benar selaras, jadi keyakinan jangka pendek tetap perlu dijaga.',
    advancedMacro_supportive:
      'Relasi makro saat ini cukup mendukung untuk sikap yang konstruktif, tetapi disiplin tetap penting.',
    advancedMacro_neutral:
      'Relasi makro saat ini netral, jadi konteks pasar belum memberi dorongan tambahan yang kuat.',
    advancedMacro_restrictive:
      'Relasi makro saat ini restriktif, jadi penambahan risiko perlu lebih hati-hati.',
    advancedMacro_stressStillHigh:
      'Stress pasar masih tinggi, jadi konfirmasi tetap perlu dijaga selektif.',
    advancedMacro_pressureEasing:
      'Tekanan mulai sedikit mereda, tetapi belum sepenuhnya lewat.',
    advancedMacro_otherSignalsLead:
      'Sinyal lain masih perlu bekerja lebih banyak di area ini.',
    advancedMacroDetail_supportive:
      'Tekanan makro belum cukup kuat untuk mendominasi pembacaan pasar saat ini.',
    advancedMacroDetail_neutral:
      'Makro belum terlihat benar-benar membantu atau menghambat, jadi sinyal lain masih perlu diberi bobot lebih besar.',
    advancedMacroDetail_restrictive:
      'Tekanan makro masih cukup ketat, jadi upside butuh konfirmasi yang lebih kuat sebelum terlihat tahan lama.',
    actionSummary_reduce_concentration:
      'Jaga penambahan posisi tetap terukur dan kurangi ketergantungan pada sedikit posisi sebelum melangkah lebih jauh.',
    actionSummary_tighten_risk:
      'Lindungi downside lebih dulu agar portofolio tidak membawa tekanan lebih besar dari yang didukung kondisi ini.',
    actionSummary_be_selective:
      'Portofolio masih bisa berjalan di sini, tetapi kualitas posisi lebih penting daripada kecepatan.',
    actionSummary_hold_steady:
      'Posisi saat ini cukup konstruktif untuk tetap disiplin tanpa memaksakan perubahan besar.',
    actionSummary_default:
      'Tetap praktis dan jaga langkah berikutnya tetap terukur sampai kecocokan portofolio menjadi lebih jelas.',
    actionBullet_reduce_concentration_1: 'Hindari menambah agresif pada eksposur yang sama dan sudah padat.',
    actionBullet_reduce_concentration_2: 'Gunakan fase ini untuk menyeimbangkan portofolio ke komposisi yang lebih stabil.',
    actionBullet_reduce_concentration_3: 'Turunkan konsentrasi dulu sebelum mengambil risiko yang lebih besar.',
    actionBullet_tighten_risk_1: 'Perlambat penambahan risiko baru sampai posisi portofolio lebih bersih.',
    actionBullet_tighten_risk_2: 'Kurangi eksposur yang paling rentan di kondisi ini.',
    actionBullet_tighten_risk_3: 'Utamakan ketahanan daripada mengejar gerakan jangka pendek.',
    actionBullet_be_selective_1: 'Fokuskan penambahan baru pada setup yang paling jelas.',
    actionBullet_be_selective_2: 'Jangan biarkan kondisi campuran mendorong keputusan yang dipenuhi informasi berlebih.',
    actionBullet_be_selective_3:
      'Perhatikan apakah konsentrasi mulai membuat kecocokan portofolio semakin rapuh.',
    actionBullet_hold_steady_1: 'Biarkan keselarasan bekerja sebelum membuat penyesuaian yang tidak perlu.',
    actionBullet_hold_steady_2: 'Jaga kualitas posisi tetap tinggi daripada mengejar risiko tambahan.',
    actionBullet_hold_steady_3: 'Evaluasi ulang hanya jika arah kondisi pasar mulai berubah.',
    actionBullet_default_1: 'Utamakan peluang yang lebih jelas daripada mengambil risiko yang terlalu luas.',
    actionBullet_default_2: 'Jaga portofolio tetap fleksibel selama kondisi masih campuran.',
    aiPreview_situation_defensive: 'Pasar sedang cenderung defensif.',
    aiPreview_situation_risk_on: 'Selera risiko pasar sedang membaik.',
    aiPreview_situation_neutral: 'Pasar sedang bergerak seimbang.',
    aiFull_situation_defensive: 'Pasar sedang cenderung defensif dan sensitivitas downside lebih tinggi.',
    aiFull_situation_risk_on: 'Selera risiko membaik, tetapi selektivitas tetap penting.',
    aiFull_situation_neutral: 'Kondisi pasar seimbang dan tetap memerlukan disiplin.',
    aiFull_condition_good:
      '{userStatus}. Posisi portofolio masih terlihat selaras dengan kondisi saat ini.',
    aiFull_condition_moderate:
      '{userStatus}. Portofolio masih bisa berjalan, tetapi butuh penataan posisi yang lebih ketat di kondisi ini.',
    aiFull_condition_weak:
      '{userStatus}. Posisi portofolio belum terlihat selaras dengan kondisi saat ini.',
    aiFull_watch_good:
      'Tetap pantau apakah keselarasan saat ini masih bertahan jika arah pasar mulai bergeser.',
    aiFull_watch_moderate:
      'Perhatikan apakah konsentrasi dan eksposur menjadi semakin sulit dipertahankan jika volatilitas naik lagi.',
    aiFull_watch_weak:
      'Perhatikan apakah eksposur dan konsentrasi saat ini membuat portofolio terlalu rentan untuk kondisi pasar ini.',
    portfolioWhy_good:
      'Posisi masih terlihat selaras karena susunan portofolio cocok dengan kondisi pasar saat ini.',
    portfolioWhy_moderate:
      'Posisi hanya sebagian selaras karena portofolio masih bisa berjalan, tetapi membutuhkan selektivitas yang lebih ketat.',
    portfolioWhy_weak:
      'Posisi terlihat kurang selaras karena susunan portofolio bergerak melawan kondisi pasar saat ini.',
    portfolioPosture_good: 'Susunan portofolio masih terlihat kompatibel dengan kondisi pasar saat ini.',
    portfolioPosture_moderate:
      'Susunan portofolio masih bisa berjalan, tetapi membutuhkan selektivitas yang lebih tinggi di kondisi ini.',
    portfolioPosture_weak:
      'Susunan portofolio belum terlihat selaras dengan kondisi pasar saat ini.',
    exposureNote_overexposed: 'Eksposur masih terlihat terlalu agresif untuk kondisi pasar saat ini.',
    exposureNote_watchful:
      'Posisi masih bisa dijaga, tetapi konsentrasi tetap perlu perhatian.',
    exposureNote_aligned: 'Eksposur masih terlihat cukup seimbang untuk situasi saat ini.',
    advancedLine_overexposed:
      'Eksposur Anda terlihat lebih berat daripada yang nyaman ditopang kondisi saat ini.',
    advancedLine_watchful:
      'Kondisi masih campuran, jadi selektivitas lebih penting daripada bertindak cepat.',
    advancedLine_aligned: 'Keselarasan masih cukup baik, tetapi kondisi ini tetap meminta disiplin.',
    previewCta_free: 'Pahami dampaknya ke portofolio Anda',
    previewCta_pro: 'Lihat implikasi lengkap',
    changeAwareness: 'KESADARAN PERUBAHAN',
    conditionMostlyUnchanged: 'Kondisi relatif belum berubah',
    mainPoint: 'POIN UTAMA',
    tradeOff: 'KONSEKUENSI',
    basedOn: 'BERDASARKAN',
    viewFullExplanation: 'Lihat penjelasan lengkap',
    optional: 'OPSIONAL',
    allocationWeight: 'Bobot alokasi',
    pressureLevel: 'Tingkat tekanan',
    nextSensibleAction: 'Langkah masuk akal berikutnya',
    nextSensibleActionText: 'Tahan penambahan posisi baru sampai tekanan pasar lebih jelas.',
    whyCheckAgain: 'KENAPA PERLU CEK ULANG',
    marketSummary: 'Ringkasan pasar',
    insightBadgeLabel: 'INSIGHT UTAMA',
    portfolioAware: 'Sadar portofolio',
    portfolioPending: 'Portofolio belum siap'
  }
} as const

export type DashboardTranslationKey = keyof typeof dashboardTranslations.en

export const t = (
  key: DashboardTranslationKey,
  language: Language,
  variables?: Record<string, string>
) : string => {
  let text: string = dashboardTranslations[language][key]
  if (!variables) return text

  return Object.entries(variables).reduce(
    (result, [variableKey, value]) => result.split(`{${variableKey}}`).join(value),
    text
  )
}

export const getDashboardCopy = (language: Language): DashboardCopy => ({
  language,
  heroTitle: t('heroTitle', language),
  heroLead: t('heroLead', language),
  marketLabel: t('marketLabel', language),
  riskLabel: t('riskLabel', language),
  youLabel: t('youLabel', language),
  planLabel: t('planLabel', language),
  todayInsight: t('todayInsight', language),
  portfolioFit: t('portfolioFit', language),
  aiReasoning: t('aiReasoning', language),
  advancedContext: t('advancedContext', language),
  heroSummary: t('heroSummary', language),
  contextLayer: t('contextLayer', language),
  contextLayerLead: t('contextLayerLead', language),
  contextWaiting: t('contextWaiting', language),
  goldLabel: t('goldLabel', language),
  bitcoinLabel: t('bitcoinLabel', language),
  usIndexLabel: t('usIndexLabel', language),
  ihsgLabel: t('ihsgLabel', language),
  lastUpdateLabel: t('lastUpdateLabel', language),
  changeLabel: t('changeLabel', language),
  newsIntelligence: t('newsIntelligence', language),
  newsIntelligenceLead: t('newsIntelligenceLead', language),
  relevanceFresh: t('relevanceFresh', language),
  relevanceLikelyPricedIn: t('relevanceLikelyPricedIn', language),
  relevanceNoise: t('relevanceNoise', language),
  relevanceHigh: t('relevanceHigh', language),
  relevanceLabel: t('relevanceLabel', language),
  askTingAi: t('askTingAi', language),
  askTingAiLead: t('askTingAiLead', language),
  askTingAiPlaceholder: t('askTingAiPlaceholder', language),
  askTingAiDisabled: t('askTingAiDisabled', language),
  askPromptOne: t('askPromptOne', language),
  askPromptTwo: t('askPromptTwo', language),
  askPromptThree: t('askPromptThree', language),
  askPromptFour: t('askPromptFour', language),
  claritySnapshot: t('claritySnapshot', language),
  marketConditionLabel: t('marketConditionLabel', language),
  riskLevelLabel: t('riskLevelLabel', language),
  portfolioFitLabel: t('portfolioFitLabel', language),
  confidenceLabel: t('confidenceLabel', language),
  loadingBrief: t('loadingBrief', language),
  noInsight: t('noInsight', language),
  freeTeaser: t('freeTeaser', language),
  proTeaser: t('proTeaser', language),
  secondaryContext: t('secondaryContext', language),
  whatChanged: t('whatChanged', language),
  whatToWatch: t('whatToWatch', language),
  nextStep: t('nextStep', language),
  actionStance: t('actionStance', language),
  actionSummary: t('actionSummary', language),
  actionFocus: t('actionFocus', language),
  changeAwareness: t('changeAwareness', language),
  conditionMostlyUnchanged: t('conditionMostlyUnchanged', language),
  mainPoint: t('mainPoint', language),
  tradeOff: t('tradeOff', language),
  basedOn: t('basedOn', language),
  viewFullExplanation: t('viewFullExplanation', language),
  optional: t('optional', language),
  allocationWeight: t('allocationWeight', language),
  pressureLevel: t('pressureLevel', language),
  nextSensibleAction: t('nextSensibleAction', language),
  nextSensibleActionText: t('nextSensibleActionText', language),
  whyCheckAgain: t('whyCheckAgain', language),
  marketSummary: t('marketSummary', language),
  insightBadgeLabel: t('insightBadgeLabel', language),
  portfolioAware: t('portfolioAware', language),
  portfolioPending: t('portfolioPending', language)
})
