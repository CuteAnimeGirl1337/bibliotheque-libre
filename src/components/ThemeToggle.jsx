const themes = [
  { id: 'light', label: 'Clair', icon: '☀', bg: '#faf6f0', border: '#d4c5b0' },
  { id: 'sepia', label: 'Sépia', icon: '📜', bg: '#f4ecd8', border: '#c8a45e' },
  { id: 'dark', label: 'Sombre', icon: '🌙', bg: '#1a1a2e', border: '#444466' },
]

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="flex items-center gap-1.5">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className={`w-7 h-7 rounded-full border-2 transition-all text-xs ${
            theme === t.id ? 'scale-110 ring-2 ring-accent/40' : 'opacity-60 hover:opacity-100'
          }`}
          style={{ backgroundColor: t.bg, borderColor: t.border }}
        >
          {t.icon}
        </button>
      ))}
    </div>
  )
}
