import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function CreateJob() {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [minBudget, setMinBudget] = useState('')
    const [maxBudget, setMaxBudget] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            const res = await api.post('/jobs', {
                title,
                description,
                category,
                budget: { min: Number(minBudget), max: Number(maxBudget) },
            })
            navigate(`/jobs/${res.data._id}`)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create job')
            setSaving(false)
        }
    }

    return (
        <div className="container">
            <p className="eyebrow">New Contract</p>
            <h1>Post a Job</h1>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-text">{error}</p>}
                    <div className="field">
                        <label htmlFor="job-title">Title</label>
                        <input
                            id="job-title"
                            type="text"
                            placeholder="e.g. Build a landing page"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="job-description">Description</label>
                        <textarea
                            id="job-description"
                            placeholder="What needs to get done?"
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
                            placeholder="e.g. Design"
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
                                placeholder="500"
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
                                placeholder="1500"
                                value={maxBudget}
                                onChange={(e) => setMaxBudget(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={saving}>
                        Post job
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateJob
