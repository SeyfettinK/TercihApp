import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortablePreferenceProps {
  id: string
  cityName: string
  priority: number
  onRemove: () => void
  disabled?: boolean
}

export default function SortablePreference({ id, cityName, priority, onRemove, disabled }: SortablePreferenceProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
        isDragging
          ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] shadow-lg z-50'
          : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)]'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`flex items-center justify-center w-8 h-8 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] ${
          disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:text-[var(--color-accent)]'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
        priority <= 3 
          ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' 
          : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
      }`}>
        {priority}
      </div>

      <span className="flex-1 text-white font-medium">{cityName}</span>

      {!disabled && (
        <button
          onClick={onRemove}
          className="p-2 text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
