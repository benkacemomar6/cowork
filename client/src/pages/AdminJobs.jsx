import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import AdminTabs from '../components/AdminTabs'
import { pillClass, formatStatus, formatMoney } from '../utils/format'

const STATUS_OPTIONS = ['open', 'in_progress', 'completed', 'cancelled']

function AdminJobs() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionError, setActionError] = useState('')

    useEffect(() => {
        async function fetchJobs() {
            try {
                const res = await api.get('/admin/jobs')
                setJobs(res.data.jobs)
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load jobs')
                setLoading(false)
            }
        }
        fetchJobs()
    }, [])

    async function handleModerate(jobId, status) {
        setActionError('')
        try {
            const res = await api.patch(`/admin/jobs/${jobId}/moderate`, { status })
            setJobs((prev) => prev.map((j) => (j._id === jobId ? res.data.job : j)))
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to update job status')
        }
    }

    async function handleRemove(jobId) {
        if (!window.confirm('Remove this job? This cannot be undone.')) return
        setActionError('')
        try {
            await api.delete(`/admin/jobs/${jobId}`)
            setJobs((prev) => prev.filter((j) => j._id !== jobId))
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to remove job')
        }
    }

    if (loading) return <div className="container"><p className="loading-state">Loading jobs&hellip;</p></div>
    if (error) return <div className="container"><p className="error-text">{error}</p></div>

    return (
        <div className="container">
            <p className="eyebrow">Admin</p>
            <h1>Jobs</h1>
            <AdminTabs />

            {actionError && <p className="error-text">{actionError}</p>}
            {jobs.length === 0 && <p className="empty-state">No jobs on the platform yet.</p>}

            {jobs.map((job) => {
                const removable = job.status === 'cancelled' || job.status === 'completed'
                return (
                    <div className="ledger-row" key={job._id}>
                        <div className="ledger-row-label">
                            <Link to={`/jobs/${job._id}`} className="ledger-row-title">{job.title}</Link>
                            <div className="ledger-row-meta">
                                <span>{job.category}</span>
                                <span>{job.client?.name || 'Unknown client'}</span>
                                <span className={`pill ${pillClass(job.status)}`}>{formatStatus(job.status)}</span>
                            </div>
                        </div>
                        <div className="ledger-row-value">
                            <span className="num">{formatMoney(job.budget.min)}&ndash;{formatMoney(job.budget.max)}</span>
                            <div className="ledger-row-actions">
                                <select
                                    className="admin-status-select"
                                    aria-label={`Change status for ${job.title}`}
                                    value={job.status}
                                    onChange={(e) => handleModerate(job._id, e.target.value)}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{formatStatus(s)}</option>
                                    ))}
                                </select>
                                <button
                                    className="btn-danger btn-sm"
                                    disabled={!removable}
                                    title={removable ? 'Remove this job' : 'Only cancelled or completed jobs can be removed'}
                                    onClick={() => handleRemove(job._id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default AdminJobs
