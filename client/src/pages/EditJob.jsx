import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'

function EditJob() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [minBudget, setMinBudget] = useState('')
    const [maxBudget, setMaxBudget] = useState('')
    // Not shown as a field (spec only asks for title/description/category/budget.min/max),
    // but carried through on PATCH so a partial `budget` update doesn't wipe it out —
    // jobService.updateJob passes req.body straight into findByIdAndUpdate with no merge.
    const [budgetType, setBudgetType] = useState('fixed')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function fetchJob() {
            try {
                const res = await api.get(`/jobs/${id}`)
                const job = res.data
                setTitle(job.title)
                setDescription(job.description)
                setCategory(job.category)
                setMinBudget(job.budget.min)
                setMaxBudget(job.budget.max)
                setBudgetType(job.budget.type)
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load job')
                setLoading(false)
            }
        }
        fetchJob()
    }, [id])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            await api.patch(`/jobs/${id}`, {
                title,
                description,
                category,
                budget: { min: Number(minBudget), max: Number(maxBudget), type: budgetType },
            })
            navigate(`/jobs/${id}`)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save job')
            setSaving(false)
        }
    }

    if (loading) return <div className="container"><p className="loading-state">Loading&hellip;</p></div>

    return (
        <div className="container">
            <p className="eyebrow">Edit Contract</p>
            <h1>Edit Job</h1>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-text">{error}</p>}
                    <div className="field">
                        <label htmlFor="job-title">Title</label>
                        <input
                            id="job-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="job-description">Description</label>
                        <textarea
                            id="job-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="job-category">Category</label>
                        <input
                            id="job-category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>
                    <div className="row">
                        <div className="field">
                            <label htmlFor="job-min">Min budget</label>
                            <input
                                id="job-min"
                                type="number"
                                value={minBudget}
                                onChange={(e) => setMinBudget(e.target.value)}
                                required
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="job-max">Max budget</label>
                            <input
                                id="job-max"
                                type="number"
                                value={maxBudget}
                                onChange={(e) => setMaxBudget(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={saving}>
                        Save changes
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditJob
