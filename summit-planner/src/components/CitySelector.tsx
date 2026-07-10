import { useState, useRef, useEffect } from 'react'
import type { CityConfig } from '../types'

interface CitySelectorProps {
  cities: CityConfig[]
  selected: CityConfig
  onSelect: (city: CityConfig) => void
}

export function CitySelector({ cities, selected, onSelect }: CitySelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="city-selector" ref={ref}>
      <button
        className="city-selector-trigger"
        onClick={() => setOpen(!open)}
        title="Switch city"
      >
        📍 {selected.name}
        <span className="city-selector-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="city-selector-dropdown">
          {cities.map(city => (
            <button
              key={city.id}
              className={`city-selector-option ${city.id === selected.id ? 'active' : ''}`}
              onClick={() => { onSelect(city); setOpen(false) }}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
