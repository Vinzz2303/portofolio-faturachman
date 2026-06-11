export function computePortfolioImpact(weight: number, pctMove: number, portfolioValue: number) {
  return weight * pctMove * portfolioValue
}
