import { useEffect, useState } from 'react'

export type LanguageCode = 'id' | 'en'

const LANGUAGE_KEY = 'ting_ai_language'
const LANGUAGE_EVENT = 'ting-ai-language'

export const getStoredLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') return 'id'
  const value = window.localStorage.getItem(LANGUAGE_KEY)
  return value === 'en' ? 'en' : 'id'
}

export const setStoredLanguage = (language: LanguageCode) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LANGUAGE_KEY, language)
  window.dispatchEvent(new Event(LANGUAGE_EVENT))
}

export const useLanguagePreference = () => {
  const [language, setLanguageState] = useState<LanguageCode>(getStoredLanguage)

  useEffect(() => {
    setStoredLanguage(language)
  }, [language])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleLanguageChange = () => {
      setLanguageState(getStoredLanguage())
    }

    window.addEventListener(LANGUAGE_EVENT, handleLanguageChange)
    window.addEventListener('storage', handleLanguageChange)

    return () => {
      window.removeEventListener(LANGUAGE_EVENT, handleLanguageChange)
      window.removeEventListener('storage', handleLanguageChange)
    }
  }, [])

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage)
  }

  return {
    language,
    setLanguage
  }
}
