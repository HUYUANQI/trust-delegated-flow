export function PageHeader({ eyebrow, title, description }) {
  return <header className="page-header">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</header>;
}

export function Panel({ children, className = "" }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Progress({ value }) {
  return <div className="progress"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function EmptyState({ children }) {
  return <Panel className="empty-state">{children}</Panel>;
}

