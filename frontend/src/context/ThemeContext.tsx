import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const val = localStorage.getItem('color-scheme')
    if (val === 'light' || val === 'dark') return val
  } catch {}
  return 'system'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme)

  // Listen to system preference changes and update state dynamically
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  // Listen to storage events for cross-tab synchronization
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'color-scheme') {
        const val = e.newValue
        if (val === 'light' || val === 'dark') {
          setThemeState(val)
        } else {
          setThemeState('system')
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  // Apply theme to DOM element dataset and <meta name="color-scheme">
  useEffect(() => {
    const root = document.documentElement
    const meta = document.querySelector('meta[name="color-scheme"]')

    if (theme === 'system') {
      delete root.dataset.theme
      if (meta) meta.setAttribute('content', 'light dark')
      try {
        localStorage.removeItem('color-scheme')
      } catch {}
    } else {
      root.dataset.theme = theme
      if (meta) meta.setAttribute('content', theme)
      try {
        localStorage.setItem('color-scheme', theme)
      } catch {}
    }

    root.classList.toggle('dark', resolvedTheme === 'dark')
  }, [theme, resolvedTheme])

  const setTheme = (next: Theme) => {
    setThemeState(next)
  }

  const toggleTheme = () => {
    // 2-state toggle honoring modern web guidance:
    // If currently rendered dark, switch to light.
    // If target matches system, remove override (revert to 'system').
    // Otherwise store target explicitly.
    const target = resolvedTheme === 'dark' ? 'light' : 'dark'
    if (target === systemTheme) {
      setThemeState('system')
    } else {
      setThemeState(target)
    }
  }

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, systemTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className={`icon-button theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
    >
      {isDark ? (
        <Sun size={20} weight="bold" className="theme-icon sun-icon" />
      ) : (
        <Moon size={20} weight="bold" className="theme-icon moon-icon" />
      )}
    </button>
  )
}
