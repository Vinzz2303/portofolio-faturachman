/**
 * Portfolio allocation validation utilities
 * Ensures portfolio input is clear and prevents common user confusions
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Check if input contains negative percentages
 * Returns error message if found, undefined otherwise
 */
export function validatePortfolioAllocation(input: string): ValidationResult {
  // Check for negative percentages: -10%, -50.5%, etc.
  const negativePercentageRegex = /-\s*\d+(?:\.\d+)?\s*%/
  
  if (negativePercentageRegex.test(input)) {
    return {
      isValid: false,
      error: 'negative'
    }
  }

  return { isValid: true }
}

/**
 * Get localized error message for validation failure
 */
export function getValidationErrorMessage(
  error: string | undefined,
  lang: 'id' | 'en'
): string | undefined {
  if (error === 'negative') {
    return lang === 'id'
      ? 'Porsi portofolio tidak bisa minus. Kalau ingin mencatat untung/rugi, fitur itu belum tersedia di input ini.'
      : 'Portfolio allocation cannot be negative. Profit/loss input is not supported here yet.'
  }
  return undefined
}
