import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import JobCard from '../components/JobCard'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 9

function MyJobs() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    useEffect(() => {
        async function fetchJobs() {
            try {
                // No GET /jobs/mine on the backend yet, so we fetch everything
                // and filter down to jobs owned by the current user client-side.
                const res = await api.get('/jobs', { params: { limit: 1000 } })
                setJobs(res.data.filter((j) => j.client === user._id))
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load your jobs')
                setLoading(false)
            }
        }
        fetchJobs()
    }, [user._id])

    async function handleDelete(jobId) {
        if (!window.confirm('Delete this job?')) return
        try {
            await api.delete(`/jobs/${jobId}`)
            setJobs((prev) => prev.filter((j) => j._id !== jobId))
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete job')
        }
    }

    if (loading) return <div className="container"><p className="loading-state">Loading your jobs&hellip;</p></div>
    if (error) return <div className="container"><p className="error-text">{error}</p></div>

    const pages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))
    const currentPage = Math.min(page, pages)
    const pageJobs = jobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    return (
        <div className="container">
            <div className="section-title">
                <div>
                    <p className="eyebrow">Client Dashboard</p>
                    <h1>My Jobs</h1>
                </div>
                <Link to="/jobs/new" className="btn">Post a new job</Link>
            </div>

            {jobs.length === 0 && <p className="empty-state">You haven't posted any jobs yet.</p>}
            <div className="job-grid">
                {pageJobs.map((job) => (
                    <JobCard
                        key={job._id}
                        job={job}
                        actions={
                            <>
                                <Link to={`/jobs/${job._id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                                <button className="btn-danger btn-sm" onClick={() => handleDelete(job._id)}>Delete</button>
                            </>
                        }
                    />
                ))}
            </div>

            <Pagination page={currentPage} pages={pages} onChange={setPage} />
        </div>
    )
}

export default MyJobs
