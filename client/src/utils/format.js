const STATUS_PILL = {
    open: 'pill--amber',
    pending: 'pill--amber',
    submitted: 'pill--amber',
    in_progress: 'pill--amber',
    accepted: 'pill--green',
    approved: 'pill--green',
    completed: 'pill--green',
    rejected: 'pill--rust',
    cancelled: 'pill--rust',
    revision_requested: 'pill--rust',
    withdrawn: 'pill--slate',
}

export function pillClass(status) {
    return STATUS_PILL[status] || 'pill--slate'
}

export function formatStatus(status) {
    return (status || '').replace(/_/g, ' ')
}

export function formatMoney(n) {
    return `$${Number(n).toLocaleString()}`
}

export function formatDate(value) {
    if (!value) return ''
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatRelativeTime(value) {
    if (!value) return ''
    const diffMs = Date.now() - new Date(value).getTime()
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    if (diffMs < hour) return `${Math.max(1, Math.round(diffMs / minute))}m ago`
    if (diffMs < day) return `${Math.round(diffMs / hour)}h ago`
    if (diffMs < 30 * day) return `${Math.round(diffMs / day)}d ago`
    return formatDate(value)
}

export function truncate(str, max) {
    if (!str) return ''
    return str.length > max ? `${str.slice(0, max).trimEnd()}…` : str
}
