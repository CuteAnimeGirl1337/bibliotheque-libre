const sizes = [
  { id: 'small', label: 'A', class: 'text-xs' },
  { id: 'medium', label: 'A', class: 'text-base' },
  { id: 'large', label: 'A', class: 'text-lg' },
]

export default function FontSizeControl({ fontSize, setFontSize }) {
  return (
    <div className="flex items-center gap-1">
      {sizes.map(s => (
        <button
          key={s.id}
          onClick={() => setFontSize(s.id)}
          className={`w-8 h-8 rounded-md flex items-center justify-center font-serif transition-all ${
            fontSize === s.id
              ? 'bg-accent text-white'
              : 'bg-ink/5 text-ink-light hover:bg-ink/10'
          } ${s.class}`}
          title={s.id}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
