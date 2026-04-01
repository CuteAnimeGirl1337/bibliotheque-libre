import { Link } from 'react-router-dom'

const COLORS = [
  ['#8b4513', '#d4a574'], ['#2c3e50', '#85929e'], ['#1a1a2e', '#c8a45e'],
  ['#4a0e2e', '#c89eb8'], ['#1b4332', '#95d5b2'], ['#3c1518', '#dda15e'],
  ['#2d3436', '#74b9ff'], ['#4a1942', '#c19ee0'], ['#1e3a5f', '#7ec8e3'],
  ['#3d0c02', '#d4a373'],
]

// 8 cover patterns as subtle CSS background-images
const PATTERNS = [
  'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 16px)',
  'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.05) 2px, transparent 2px)',
  'repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(255,255,255,0.03) 12px, rgba(255,255,255,0.03) 13px)',
  'repeating-linear-gradient(90deg, transparent, transparent 14px, rgba(255,255,255,0.04) 14px, rgba(255,255,255,0.04) 15px), repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(255,255,255,0.04) 14px, rgba(255,255,255,0.04) 15px)',
  'repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.03) 12px)',
  'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(circle at 20px 20px, rgba(255,255,255,0.04) 1px, transparent 1px)',
  'linear-gradient(30deg, rgba(255,255,255,0.03) 12%, transparent 12%, transparent 87%, rgba(255,255,255,0.03) 87%)',
  'repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px',
]

// 8 frame/border design templates
const TEMPLATES = [
  // 0: Double border frame
  { frame: 'double', inset: 10, borderWidth: 3 },
  // 1: Single gold inner frame
  { frame: 'single', inset: 14, borderWidth: 1 },
  // 2: Top & bottom lines only
  { frame: 'lines' },
  // 3: Corner accents
  { frame: 'corners' },
  // 4: Dashed inner rectangle
  { frame: 'dashed', inset: 12, borderWidth: 1 },
  // 5: Thick top bar + thin bottom
  { frame: 'topbar' },
  // 6: No frame, large drop letter
  { frame: 'dropcap' },
  // 7: Diamond ornament at top
  { frame: 'diamond' },
]

function hashTitle(title) {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0
  return Math.abs(hash)
}

export function getBookColor(title) {
  return COLORS[hashTitle(title) % COLORS.length]
}

function getTemplate(title) {
  return TEMPLATES[hashTitle(title) % TEMPLATES.length]
}

function getPattern(title) {
  return PATTERNS[(hashTitle(title) + 3) % PATTERNS.length]
}

function getTitleExcerpt(title) {
  const clean = title.replace(/[_]/g, ' ')
  if (clean.length <= 28) return clean
  const cut = clean.substring(0, 28)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 10 ? cut.substring(0, lastSpace) : cut) + '…'
}

export function formatAuthor(authors) {
  if (!authors?.length) return 'Auteur inconnu'
  const name = authors[0].name
  const parts = name.split(', ')
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name
}

function formatReadingTime(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatWords(count) {
  if (!count) return ''
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M mots`
  if (count >= 1000) return `${Math.round(count / 1000)}k mots`
  return `${count} mots`
}

function CoverFrame({ template, color }) {
  const c = color + '60' // 38% opacity hex

  switch (template.frame) {
    case 'double':
      return <div className="absolute z-10 pointer-events-none" style={{
        inset: template.inset, border: `${template.borderWidth}px double ${c}`
      }} />
    case 'single':
      return <div className="absolute z-10 pointer-events-none rounded-sm" style={{
        inset: template.inset, border: `${template.borderWidth}px solid ${c}`
      }} />
    case 'lines':
      return <>
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none" style={{ borderTop: `2px solid ${c}` }} />
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none" style={{ borderTop: `2px solid ${c}` }} />
        <div className="absolute top-5 left-6 right-6 z-10 pointer-events-none" style={{ borderTop: `1px solid ${c}` }} />
      </>
    case 'corners': {
      const s = { position: 'absolute', width: 16, height: 16, zIndex: 10, pointerEvents: 'none' }
      return <>
        <div style={{ ...s, top: 10, left: 10, borderTop: `2px solid ${c}`, borderLeft: `2px solid ${c}` }} />
        <div style={{ ...s, top: 10, right: 10, borderTop: `2px solid ${c}`, borderRight: `2px solid ${c}` }} />
        <div style={{ ...s, bottom: 10, left: 10, borderBottom: `2px solid ${c}`, borderLeft: `2px solid ${c}` }} />
        <div style={{ ...s, bottom: 10, right: 10, borderBottom: `2px solid ${c}`, borderRight: `2px solid ${c}` }} />
      </>
    }
    case 'dashed':
      return <div className="absolute z-10 pointer-events-none" style={{
        inset: template.inset, border: `${template.borderWidth}px dashed ${c}`
      }} />
    case 'topbar':
      return <>
        <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none" style={{ height: 4, background: c }} />
        <div className="absolute bottom-3 left-5 right-5 z-10 pointer-events-none" style={{ borderTop: `1px solid ${c}` }} />
      </>
    case 'diamond':
      return <>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{
          width: 10, height: 10, background: c, transform: 'translateX(-50%) rotate(45deg)'
        }} />
        <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none" style={{ borderTop: `1px solid ${c}` }} />
      </>
    default:
      return null
  }
}

export default function BookCard({ book }) {
  const [bgColor, textColor] = getBookColor(book.title)
  const template = getTemplate(book.title)
  const pattern = getPattern(book.title)
  const excerpt = getTitleExcerpt(book.title)
  const author = formatAuthor(book.authors)
  const isDropcap = template.frame === 'dropcap'

  return (
    <Link
      to={`/book/${book.id}`}
      className="group block rounded-xl overflow-hidden bg-cream-dark/50 shadow-sm hover:shadow-xl transition-all duration-500"
      style={{ perspective: 800 }}
    >
      {/* Cover with 3D tilt */}
      <div
        className="aspect-[3/4] flex items-center justify-center relative overflow-hidden transition-transform duration-500 ease-out group-hover:[transform:rotateY(-3deg)_rotateX(1.5deg)_scale(1.02)]"
        style={{ backgroundColor: bgColor, transformStyle: 'preserve-3d' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: '40px 40px' }} />

        {/* Frame decoration */}
        <CoverFrame template={template} color={textColor} />

        {/* Title content */}
        <div className="text-center px-5 relative z-20">
          {isDropcap ? (
            <>
              <span className="text-6xl font-serif font-bold block mb-1 leading-none" style={{ color: textColor }}>
                {book.title.charAt(0)}
              </span>
              <span className="text-[10px] font-serif leading-tight block opacity-80 mt-2" style={{ color: textColor }}>
                {excerpt}
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-serif font-bold leading-snug block mb-3" style={{ color: textColor }}>
                {excerpt}
              </span>
              <div className="w-8 h-px mx-auto mb-3 opacity-40" style={{ background: textColor }} />
            </>
          )}
          <span className="text-[9px] font-medium tracking-widest uppercase block opacity-60" style={{ color: textColor }}>
            {author}
          </span>
        </div>

        {/* Spine — gradient for depth */}
        <div className="absolute left-0 top-0 bottom-0 w-[5px]" style={{
          background: `linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.1), rgba(255,255,255,0.05))`
        }} />

        {/* Page edge effect — right side */}
        <div className="absolute right-0 top-1 bottom-1 w-[6px]" style={{
          background: `repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 3px)`,
          borderRadius: '0 2px 2px 0'
        }} />

        {/* Bottom shadow inside cover */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-serif font-bold text-ink text-sm leading-snug mb-1 group-hover:text-accent transition-colors line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-ink-light mb-2 truncate">{author}</p>
        <div className="flex items-center gap-3 text-xs text-ink-light/60">
          {book.stats?.reading_time_minutes && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatReadingTime(book.stats.reading_time_minutes)}
            </span>
          )}
          {book.stats?.total_words && (
            <span>{formatWords(book.stats.total_words)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
