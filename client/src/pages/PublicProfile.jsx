import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

function PublicProfile() {
    const { id } = useParams()
    const [profile, setProfile] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchProfile() {
            try {
                const [profileRes, reviewsRes] = await Promise.all([
                    api.get(`/users/public/${id}`),
                    api.get(`/users/${id}/reviews`),
                ])
                setProfile(profileRes.data.data)
                setReviews(reviewsRes.data)
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile')
                setLoading(false)
            }
        }
        fetchProfile()
    }, [id])

    if (loading) return <div className="container"><p className="loading-state">Loading profile&hellip;</p></div>
    if (error) return <div className="container"><p className="error-text">{error}</p></div>

    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null

    return (
        <div className="container">
            <div className="card">
                <p className="eyebrow">Public Profile</p>
                <h1>{profile.name}</h1>
                {profile.bio && <p>{profile.bio}</p>}
                {(profile.skills || []).length > 0 && (
                    <div className="row">
                        {profile.skills.map((s) => (
                            <span key={s} className="pill pill--slate">{s}</span>
                        ))}
                    </div>
                )}
                <p className="rating-line">
                    <span className="num">{avgRating ? `${avgRating} / 5` : '—'}</span>
                    <span className="rating-line-meta"> &middot; {reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
                </p>
            </div>

            <div className="section">
                <h2>Reviews</h2>
                {reviews.length === 0 && <p className="empty-state">No reviews yet.</p>}
                {reviews.map((r) => (
                    <div className="ledger-row" key={r._id}>
                        <div className="ledger-row-label">
                            <span className="ledger-row-title">{r.reviewer?.name}</span>
                            <p className="ledger-row-body">{r.comment}</p>
                        </div>
                        <div className="ledger-row-value">
                            <span className="num">{r.rating} / 5</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PublicProfile
