import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Wallet } from 'lucide-react'
import { pillClass, formatStatus, formatMoney, formatRelativeTime, truncate } from '../utils/format'

function JobCard({ job, actions }) {
    return (
        <div className="job-card">
            <div className="job-card-top">
                <span className="pill pill--slate">{job.category}</span>
                <span className={`pill ${pillClass(job.status)}`}>{formatStatus(job.status)}</span>
            </div>

            <Link to={`/jobs/${job._id}`} className="job-card-title">{job.title}</Link>
            <p className="job-card-desc">{truncate(job.description, 130)}</p>

            <div className="job-card-footer">
                <span className="job-card-budget num">
                    <Wallet size={14} />
                    {formatMoney(job.budget.min)}&ndash;{formatMoney(job.budget.max)}
                    {job.budget.type === 'hourly' && <span className="job-card-budget-type">/hr</span>}
                </span>
                <span className="job-card-meta">
                    <Clock size={13} />
                    {formatRelativeTime(job.createdAt)}
                </span>
            </div>

            <div className="job-card-actions">
                {actions || <Link to={`/jobs/${job._id}`} className="btn-secondary btn-sm">View job</Link>}
            </div>
        </div>
    )
}

export default JobCard
