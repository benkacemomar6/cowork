import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { pillClass, formatStatus, formatMoney } from '../utils/format'

function JobDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchJob() {
            try {
                const res = await api.get(`/jobs/${id}`);
                setJob(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load job');
                setLoading(false);
            }
        }
        fetchJob();
    }, [id]);

    const isOwner = Boolean(user && job && user._id === job.client)
    const isFreelancer = user?.role === 'freelancer'

    // --- Proposals (owner sees the list, freelancers can submit one) ---
    const [proposals, setProposals] = useState([])
    const [proposalsLoading, setProposalsLoading] = useState(false)
    const [proposalsError, setProposalsError] = useState('')

    async function fetchProposals() {
        setProposalsLoading(true)
        try {
            const res = await api.get(`/jobs/${id}/proposals`)
            setProposals(res.data)
        } catch (err) {
            setProposalsError(err.response?.data?.message || 'Failed to load proposals')
        } finally {
            setProposalsLoading(false)
        }
    }

    useEffect(() => {
        if (!isOwner) return
        fetchProposals()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOwner, id])

    const [coverLetter, setCoverLetter] = useState('')
    const [bidAmount, setBidAmount] = useState('')
    const [proposalSubmitting, setProposalSubmitting] = useState(false)
    const [proposalError, setProposalError] = useState('')
    const [proposalSuccess, setProposalSuccess] = useState(false)

    async function handleSubmitProposal(e) {
        e.preventDefault()
        setProposalError('')
        setProposalSubmitting(true)
        try {
            await api.post(`/jobs/${id}/proposals`, { coverLetter, bidAmount: Number(bidAmount) })
            setProposalSuccess(true)
            setCoverLetter('')
            setBidAmount('')
        } catch (err) {
            setProposalError(err.response?.data?.message || 'Failed to submit proposal')
        } finally {
            setProposalSubmitting(false)
        }
    }

    async function handleAcceptProposal(proposalId) {
        try {
            const res = await api.patch(`/proposals/${proposalId}/accept`)
            setJob(res.data.job)
            fetchProposals()
        } catch (err) {
            setProposalsError(err.response?.data?.message || 'Failed to accept proposal')
        }
    }

    async function handleRejectProposal(proposalId) {
        try {
            const res = await api.patch(`/proposals/${proposalId}/reject`)
            setJob(res.data.job)
            fetchProposals()
        } catch (err) {
            setProposalsError(err.response?.data?.message || 'Failed to reject proposal')
        }
    }

    // --- Milestones ---
    const [milestones, setMilestones] = useState([])
    const [milestonesLoading, setMilestonesLoading] = useState(false)
    const [milestoneTitle, setMilestoneTitle] = useState('')
    const [milestoneDescription, setMilestoneDescription] = useState('')
    const [milestoneAmount, setMilestoneAmount] = useState('')
    const [milestoneSubmitting, setMilestoneSubmitting] = useState(false)
    const [milestoneError, setMilestoneError] = useState('')

    useEffect(() => {
        if (!job || (job.status !== 'in_progress' && job.status !== 'completed')) return
        let cancelled = false
        async function fetchMilestones() {
            setMilestonesLoading(true)
            try {
                const res = await api.get(`/jobs/${id}/milestones`)
                if (!cancelled) setMilestones(res.data.data.milestones)
            } catch (err) {
                if (!cancelled) setMilestoneError(err.response?.data?.message || 'Failed to load milestones')
            } finally {
                if (!cancelled) setMilestonesLoading(false)
            }
        }
        fetchMilestones()
        return () => { cancelled = true }
    }, [id, job?.status])

    async function handleCreateMilestone(e) {
        e.preventDefault()
        setMilestoneError('')
        setMilestoneSubmitting(true)
        try {
            const res = await api.post(`/jobs/${id}/milestones`, {
                title: milestoneTitle,
                description: milestoneDescription,
                amount: Number(milestoneAmount),
            })
            setMilestones((prev) => [...prev, res.data.data.milestone])
            setMilestoneTitle('')
            setMilestoneDescription('')
            setMilestoneAmount('')
        } catch (err) {
            setMilestoneError(err.response?.data?.message || 'Failed to create milestone')
        } finally {
            setMilestoneSubmitting(false)
        }
    }

    function replaceMilestone(updated) {
        setMilestones((prev) => prev.map((m) => (m._id === updated._id ? updated : m)))
    }

    const [deliverableUrls, setDeliverableUrls] = useState({})

    async function handleSubmitMilestone(milestoneId) {
        try {
            const res = await api.patch(`/milestones/${milestoneId}/submit`, {
                deliverableUrl: deliverableUrls[milestoneId] || '',
            })
            replaceMilestone(res.data.data.submittedMilestone)
        } catch (err) {
            setMilestoneError(err.response?.data?.message || 'Failed to submit milestone')
        }
    }

    async function handleApproveMilestone(milestoneId) {
        try {
            const res = await api.patch(`/milestones/${milestoneId}/approve`)
            replaceMilestone(res.data.data.approvedMilestone)
            // approving the last milestone can flip the job to 'completed' server-side —
            // refetch so the review section shows up without needing a page reload
            const jobRes = await api.get(`/jobs/${id}`)
            setJob(jobRes.data)
        } catch (err) {
            setMilestoneError(err.response?.data?.message || 'Failed to approve milestone')
        }
    }

    async function handleRequestRevision(milestoneId) {
        try {
            const res = await api.patch(`/milestones/${milestoneId}/revision`)
            replaceMilestone(res.data.data.revisedMilestone)
        } catch (err) {
            setMilestoneError(err.response?.data?.message || 'Failed to request revision')
        }
    }

    // --- Review ---
    const [rating, setRating] = useState('5')
    const [comment, setComment] = useState('')
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const [reviewError, setReviewError] = useState('')
    const [reviewSuccess, setReviewSuccess] = useState(false)

    async function handleSubmitReview(e) {
        e.preventDefault()
        setReviewError('')
        setReviewSubmitting(true)
        try {
            await api.post(`/jobs/${id}/reviews`, { rating: Number(rating), comment })
            setReviewSuccess(true)
            setComment('')
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review')
        } finally {
            setReviewSubmitting(false)
        }
    }

    if (loading) return <div className="container"><p className="loading-state">Loading&hellip;</p></div>;
    if (error) return <div className="container"><p className="error-text">{error}</p></div>;

    return (
        <div className="container">
            <div className="card">
                <p className="eyebrow">{job.category}</p>
                <h1>{job.title}</h1>
                <p>{job.description}</p>
                <div className="row">
                    <span className={`pill ${pillClass(job.status)}`}>{formatStatus(job.status)}</span>
                    <span className="num card-lede">{formatMoney(job.budget.min)} &ndash; {formatMoney(job.budget.max)}</span>
                </div>
                {isOwner && (
                    <div className="card-footer">
                        <Link to={`/jobs/${job._id}/edit`}>Edit this job</Link>
                    </div>
                )}
            </div>

            {job.status === 'open' && isFreelancer && (
                <section className="section">
                    <h2>Submit a Proposal</h2>
                    <div className="card">
                        <form onSubmit={handleSubmitProposal}>
                            {proposalSuccess && <p className="success-text">Proposal submitted.</p>}
                            {proposalError && <p className="error-text">{proposalError}</p>}
                            <div className="field">
                                <label htmlFor="cover-letter">Cover letter</label>
                                <textarea
                                    id="cover-letter"
                                    placeholder="Why are you the right fit for this job?"
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="bid-amount">Bid amount</label>
                                <input
                                    id="bid-amount"
                                    type="number"
                                    placeholder="750"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={proposalSubmitting}>Submit Proposal</button>
                        </form>
                    </div>
                </section>
            )}

            {isOwner && (
                <section className="section">
                    <h2>Proposals</h2>
                    {proposalsLoading && <p className="loading-state">Loading proposals&hellip;</p>}
                    {proposalsError && <p className="error-text">{proposalsError}</p>}
                    {!proposalsLoading && proposals.length === 0 && <p className="empty-state">No proposals yet.</p>}
                    {proposals.map((p) => (
                        <div className="ledger-row" key={p._id}>
                            <div className="ledger-row-label">
                                <Link to={`/users/${p.freelancerId}`} className="ledger-row-title">View freelancer profile</Link>
                                <div className="ledger-row-meta">
                                    <span className={`pill ${pillClass(p.status)}`}>{formatStatus(p.status)}</span>
                                </div>
                                <p className="ledger-row-body">{p.coverLetter}</p>
                            </div>
                            <div className="ledger-row-value">
                                <span className="num">{formatMoney(p.bidAmount)}</span>
                                {p.status === 'pending' && (
                                    <div className="ledger-row-actions">
                                        <button className="btn-sm" onClick={() => handleAcceptProposal(p._id)}>Accept</button>
                                        <button className="btn-danger btn-sm" onClick={() => handleRejectProposal(p._id)}>Reject</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {(job.status === 'in_progress' || job.status === 'completed') && (
                <section className="section">
                    <h2>Milestones</h2>
                    {milestonesLoading && <p className="loading-state">Loading milestones&hellip;</p>}
                    {milestoneError && <p className="error-text">{milestoneError}</p>}
                    {!milestonesLoading && milestones.length === 0 && <p className="empty-state">No milestones yet.</p>}

                    {isOwner && job.status === 'in_progress' && (
                        <div className="card">
                            <form onSubmit={handleCreateMilestone}>
                                <div className="field">
                                    <label htmlFor="milestone-title">Milestone title</label>
                                    <input
                                        id="milestone-title"
                                        type="text"
                                        value={milestoneTitle}
                                        onChange={(e) => setMilestoneTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="milestone-description">Description</label>
                                    <textarea
                                        id="milestone-description"
                                        value={milestoneDescription}
                                        onChange={(e) => setMilestoneDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="milestone-amount">Amount</label>
                                    <input
                                        id="milestone-amount"
                                        type="number"
                                        value={milestoneAmount}
                                        onChange={(e) => setMilestoneAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={milestoneSubmitting}>Create Milestone</button>
                            </form>
                        </div>
                    )}

                    {milestones.map((m) => (
                        <div className="ledger-row" key={m._id}>
                            <div className="ledger-row-label">
                                <span className="ledger-row-title">{m.title}</span>
                                <div className="ledger-row-meta">
                                    <span className={`pill ${pillClass(m.status)}`}>{formatStatus(m.status)}</span>
                                </div>
                                <p className="ledger-row-body">{m.description}</p>
                                {m.deliverableUrl && (
                                    <p className="ledger-row-body">
                                        <a href={m.deliverableUrl} target="_blank" rel="noopener noreferrer">View deliverable</a>
                                    </p>
                                )}
                                {isFreelancer && m.status === 'pending' && (
                                    <div className="field field--on-ink">
                                        <label htmlFor={`deliverable-${m._id}`}>Link to your work (Google Drive, GitHub, Figma, etc.)</label>
                                        <input
                                            id={`deliverable-${m._id}`}
                                            type="url"
                                            placeholder="https://..."
                                            value={deliverableUrls[m._id] || ''}
                                            onChange={(e) =>
                                                setDeliverableUrls((prev) => ({ ...prev, [m._id]: e.target.value }))
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="ledger-row-value">
                                <span className="num">{formatMoney(m.amount)}</span>
                                {isFreelancer && m.status === 'pending' && (
                                    <div className="ledger-row-actions">
                                        <button className="btn-sm" onClick={() => handleSubmitMilestone(m._id)}>Submit</button>
                                    </div>
                                )}
                                {isOwner && m.status === 'submitted' && (
                                    <div className="ledger-row-actions">
                                        <button className="btn-sm" onClick={() => handleApproveMilestone(m._id)}>Approve</button>
                                        <button className="btn-danger btn-sm" onClick={() => handleRequestRevision(m._id)}>Request Revision</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {job.status === 'completed' && user && (
                <section className="section">
                    <h2>Leave a Review</h2>
                    <div className="card">
                        <form onSubmit={handleSubmitReview}>
                            {reviewSuccess && <p className="success-text">Review submitted.</p>}
                            {reviewError && <p className="error-text">{reviewError}</p>}
                            <div className="field">
                                <label htmlFor="review-rating">Rating</label>
                                <select id="review-rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>
                            <div className="field">
                                <label htmlFor="review-comment">Comment</label>
                                <textarea
                                    id="review-comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={reviewSubmitting}>Submit Review</button>
                        </form>
                    </div>
                </section>
            )}

            {job.status === 'in_progress' && user && (
                <section className="section">
                    <h2>Messages</h2>
                    <p>
                        <Link to={`/messages?job=${job._id}`}>Open conversation for this job</Link>
                    </p>
                </section>
            )}
        </div>
    );
}

export default JobDetail
