import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useSearchParams } from 'react-router-dom'
import JobCard from '../components/JobCard'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 9

function JobList() {
    const [allJobs, setAllJobs] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [params, setParams] = useSearchParams()

    const search = params.get('search') || ''
    const category = params.get('category') || ''
    const minBudget = params.get('minBudget') || ''
    const maxBudget = params.get('maxBudget') || ''
    const sort = params.get('sort') || 'newest'
    const page = Number(params.get('page')) || 1

    useEffect(() => {
        async function fetchJobs() {
            try {
                // The backend only supports page/limit, no search/filter/sort/total count,
                // so we pull a large batch once and do the rest client-side.
                const res = await api.get('/jobs', { params: { limit: 1000 } })
                setAllJobs(res.data)
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load jobs')
                setLoading(false)
            }
        }
        fetchJobs()
    }, [])

    function updateParam(key, value) {
        const next = new URLSearchParams(params)
        if (value) next.set(key, value)
        else next.delete(key)
        next.delete('page')
        setParams(next)
    }

    function setPage(n) {
        const next = new URLSearchParams(params)
        next.set('page', String(n))
        setParams(next)
    }

    const categories = useMemo(
        () => [...new Set(allJobs.map((j) => j.category))].sort(),
        [allJobs]
    )

    const filtered = useMemo(() => {
        let jobs = allJobs

        if (search) {
            const q = search.toLowerCase()
            jobs = jobs.filter((j) => j.title.toLowerCase().includes(q))
        }
        if (category) {
            jobs = jobs.filter((j) => j.category === category)
        }
        if (minBudget) {
            jobs = jobs.filter((j) => j.budget.max >= Number(minBudget))
        }
        if (maxBudget) {
            jobs = jobs.filter((j) => j.budget.min <= Number(maxBudget))
        }

        jobs = [...jobs].sort((a, b) => {
            if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
            if (sort === 'budget_asc') return a.budget.min - b.budget.min
            if (sort === 'budget_desc') return b.budget.max - a.budget.max
            return new Date(b.createdAt) - new Date(a.createdAt)
        })

        return jobs
    }, [allJobs, search, category, minBudget, maxBudget, sort])

    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const currentPage = Math.min(page, pages)
    const pageJobs = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    if (loading) return <div className="container"><p className="loading-state">Loading jobs&hellip;</p></div>
    if (error) return <div className="container"><p className="error-text">{error}</p></div>

    return (
        <div className="container">
            <p className="eyebrow">Marketplace</p>
            <h1>Browse Jobs</h1>

            <form className="filter-bar" onSubmit={(e) => e.preventDefault()}>
                <div className="field field--on-ink">
                    <label htmlFor="job-search">Search</label>
                    <input
                        id="job-search"
                        type="text"
                        placeholder="Search by title"
                        value={search}
                        onChange={(e) => updateParam('search', e.target.value)}
                    />
                </div>
                <div className="field field--on-ink">
                    <label htmlFor="job-category">Category</label>
                    <select id="job-category" value={category} onChange={(e) => updateParam('category', e.target.value)}>
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="field field--on-ink">
                    <label htmlFor="job-min">Min budget</label>
                    <input
                        id="job-min"
                        type="number"
                        placeholder="$0"
                        value={minBudget}
                        onChange={(e) => updateParam('minBudget', e.target.value)}
                    />
                </div>
                <div className="field field--on-ink">
                    <label htmlFor="job-max">Max budget</label>
                    <input
                        id="job-max"
                        type="number"
                        placeholder="$&infin;"
                        value={maxBudget}
                        onChange={(e) => updateParam('maxBudget', e.target.value)}
                    />
                </div>
                <div className="field field--on-ink">
                    <label htmlFor="job-sort">Sort</label>
                    <select id="job-sort" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="budget_asc">Budget: low to high</option>
                        <option value="budget_desc">Budget: high to low</option>
                    </select>
                </div>
            </form>

            <div>
                {pageJobs.length === 0 && <p className="empty-state">No jobs match your filters.</p>}
                {pageJobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                ))}
            </div>

            <Pagination page={currentPage} pages={pages} onChange={setPage} />
        </div>
    )
}

export default JobList
