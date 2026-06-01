import { AlertCircle } from 'lucide-react'

export default function EmptyState({ 
  icon: Icon = AlertCircle, 
  title = "No results found", 
  description = "We couldn't find anything matching your search criteria. Try adjusting your filters.",
  actionLabel,
  onAction
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ 
        width: '64px', height: '64px', 
        borderRadius: '50%', background: 'rgba(255,255,255,0.03)', 
        border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <Icon size={32} color="var(--text-muted)" />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px', marginBottom: actionLabel ? '24px' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-secondary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
