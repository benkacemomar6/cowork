import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { pillClass, formatStatus, formatMoney, formatDate } from '../utils/format'

function MyProposals() {
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchProposals() {
            try {
                const res = await api.get('/proposals/me')
                setProposals(res.data)
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load your proposals')
                setLoading(false)
            }
        }
        fetchProposals()
    }, [])

    async function handleWithdraw(proposalId) {
        try {
            await api.delete(`/proposals/${proposalId}`)
            setProposals((prev) =>
                prev.map((p) => (p._id === proposalId ? { ...p, status: 'withdrawn' } : p))
            )
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to withdraw proposal')
        }
    }

    if (loading) return <div className="container"><p className="loading-state">Loading your proposals&hellip;</p></div>
    if (error) return <div className="container"><p className="error-text">{error}</p></div>

    return (
        <div className="container">
            <p className="eyebrow">Freelancer Dashboard</p>
            <h1>My Proposals</h1>

            {proposals.length === 0 && <p className="empty-state">You haven't submitted any proposals yet.</p>}
            {proposals.map((p) => (
                <div className="ledger-row" key={p._id}>
                    <div className="ledger-row-label">
                        <Link to={`/jobs/${p.jobId}`} className="ledger-row-title">View job</Link>
                        <div className="ledger-row-meta">
                            <span className={`pill ${pillClass(p.status)}`}>{formatStatus(p.status)}</span>
                            <span className="num">{formatDate(p.createdAt)}</span>
                        </div>
                        <p className="ledger-row-body">{p.coverLetter}</p>
                    </div>
                    <div className="ledger-row-value">
                        <span className="num">{formatMoney(p.bidAmount)}</span>
                        {p.status === 'pending' && (
                            <div className="ledger-row-actions">
                                <button className="btn-danger btn-sm" onClick={() => handleWithdraw(p._id)}>Withdraw</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MyProposals
