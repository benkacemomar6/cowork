import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminTabs from '../components/AdminTabs'

function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await api.get('/admin/stats')
                setStats(res.data.stats)
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load platform stats')
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="container">
            <p className="eyebrow">Admin</p>
            <h1>Dashboard</h1>
            <AdminTabs />

            {loading && <p className="loading-state">Loading stats&hellip;</p>}
            {error && <p className="error-text">{error}</p>}

            {stats && (
                <div className="admin-stat-grid">
                    <div className="card admin-stat-card">
                        <span className="admin-stat-value num">{stats.totalUsers}</span>
                        <span className="admin-stat-label">Total users</span>
                    </div>
                    <div className="card admin-stat-card">
                        <span className="admin-stat-value num">{stats.totalJobs}</span>
                        <span className="admin-stat-label">Total jobs</span>
                    </div>
                    <div className="card admin-stat-card">
                        <span className="admin-stat-value num">{stats.completedJobs}</span>
                        <span className="admin-stat-label">Completed jobs</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard
