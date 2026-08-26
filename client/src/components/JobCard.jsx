import React from 'react'
import { Link } from 'react-router-dom'
import { pillClass, formatStatus, formatMoney } from '../utils/format'

function JobCard({ job, actions }) {
    return (
        <div className="ledger-row">
            <div className="ledger-row-label">
                <Link to={`/jobs/${job._id}`} className="ledger-row-title">{job.title}</Link>
                <div className="ledger-row-meta">
                    <span>{job.category}</span>
                    <span className={`pill ${pillClass(job.status)}`}>{formatStatus(job.status)}</span>
                </div>
            </div>
            <div className="ledger-row-value">
                <span className="num">{formatMoney(job.budget.min)} &ndash; {formatMoney(job.budget.max)}</span>
                {actions && <div className="ledger-row-actions">{actions}</div>}
            </div>
        </div>
    )
}

export default JobCard
