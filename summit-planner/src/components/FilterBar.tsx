import { useState } from 'react'
import type { Filters } from '../types'

interface FilterBarProps {
  filters: Filters
  onChange: (key: keyof Filters, value: string[]) => void
  onClear: () => void
  hasActiveFilters: boolean
  activeFilterCount: number
  options: {
    types: string[]
    levels: string[]
    rooms: string[]
    times: string[]
    industries: string[]
    jobRoles: string[]
    services: string[]
    areasOfInterest: string[]
    speakers: string[]
    sessionFeatures: string[]
  }
}

const sections: { key: keyof Filters; label: string; optionsKey: keyof FilterBarProps['options'] }[] = [
  { key: 'types', label: 'Type', optionsKey: 'types' },
  { key: 'levels', label: 'Level', optionsKey: 'levels' },
  { key: 'rooms', label: 'Room', optionsKey: 'rooms' },
  { key: 'times', label: 'Time', optionsKey: 'times' },
  { key: 'industries', label: 'Industry', optionsKey: 'industries' },
  { key: 'jobRoles', label: 'Job Role', optionsKey: 'jobRoles' },
  { key: 'services', label: 'AWS Service', optionsKey: 'services' },
  { key: 'areasOfInterest', label: 'Area of Interest', optionsKey: 'areasOfInterest' },
  { key: 'speakers', label: 'Speaker/Company', optionsKey: 'speakers' },
  { key: 'sessionFeatures', label: 'Features', optionsKey: 'sessionFeatures' },
]

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="multi-select" onMouseLeave={() => setOpen(false)}>
      <button
        className={`multi-select-trigger ${selected.length ? 'has-selection' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{label}</span>
        <span className="multi-select-count">
          {selected.length > 0 ? ` (${selected.length})` : ''}
        </span>
        <span className="multi-select-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="multi-select-dropdown">
          {options.map(opt => (
            <label key={opt} className="multi-select-option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span className="option-label">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function FilterBar({ filters, onChange, onClear, hasActiveFilters, activeFilterCount, options }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-scroll">
        {sections.map(section => (
          <MultiSelect
            key={section.key}
            label={section.label}
            options={options[section.optionsKey]}
            selected={filters[section.key] as string[]}
            onChange={values => onChange(section.key, values)}
          />
        ))}
      </div>
      {hasActiveFilters && (
        <button className="clear-filters" onClick={onClear}>
          Clear filters ({activeFilterCount})
        </button>
      )}
    </div>
  )
}
