import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

interface FavoritesContextType {
  favorites: Set<string>
  toggle: (id: string) => void
  isFavorite: (id: string) => boolean
  count: number
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

interface FavoritesProviderProps {
  children: ReactNode
  cityId: string
}

export function FavoritesProvider({ children, cityId }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`favorites_${cityId}`)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    localStorage.setItem(`favorites_${cityId}`, JSON.stringify([...favorites]))
  }, [favorites, cityId])

  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites])

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite, count: favorites.size }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
