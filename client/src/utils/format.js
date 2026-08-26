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
