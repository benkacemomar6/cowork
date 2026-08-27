import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminTabs from '../components/AdminTabs'
import { formatDate } from '../utils/format'

function AdminUsers() {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionError, setActionError] = useState('')

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await api.get('/admin/users')
                setUsers(res.data.users)
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load users')
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    async function handleToggleBan(userId) {
        setActionError('')
        try {
            const res = await api.patch(`/admin/users/${userId}/ban`)
            setUsers((prev) => prev.map((u) => (u._id === userId ? res.data.user : u)))
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to update user')
        }
    }

    const query = search.trim().toLowerCase()
    const filtered = users.filter((u) => {
        if (!query) return true
        return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    })

    if (loading) return <div className="container"><p className="loading-state">Loading users&hellip;</p></div>
    if (error) return <div className="container"><p className="error-text">{error}</p></div>

    return (
        <div className="container">
            <p className="eyebrow">Admin</p>
            <h1>Users</h1>
            <AdminTabs />

            <div className="field admin-search">
                <label htmlFor="admin-user-search">Search</label>
                <input
                    id="admin-user-search"
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {actionError && <p className="error-text">{actionError}</p>}
            {filtered.length === 0 && <p className="empty-state">No users match your search.</p>}

            {filtered.map((u) => (
                <div className="ledger-row" key={u._id}>
                    <div className="ledger-row-label">
                        <span className="ledger-row-title">{u.name}</span>
                        <div className="ledger-row-meta">
                            <span>{u.email}</span>
                            <span className="pill pill--slate">{u.role}</span>
                            {u.isBlocked && <span className="pill pill--rust">Banned</span>}
                        </div>
                    </div>
                    <div className="ledger-row-value">
                        <span className="num">{formatDate(u.createdAt)}</span>
                        <div className="ledger-row-actions">
                            <button
                                className={u.isBlocked ? 'btn-secondary btn-sm' : 'btn-danger btn-sm'}
                                onClick={() => handleToggleBan(u._id)}
                            >
                                {u.isBlocked ? 'Unban' : 'Ban'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AdminUsers
