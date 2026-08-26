import React from 'react'

function Pagination({ page, pages, onChange }) {
    if (pages <= 1) return null

    return (
        <div className="pagination">
            <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                Previous
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                    key={n}
                    className={`btn-sm num ${n === page ? '' : 'btn-secondary'}`}
                    disabled={n === page}
                    onClick={() => onChange(n)}
                >
                    {n}
                </button>
            ))}
            <button className="btn-secondary btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
                Next
            </button>
        </div>
    )
}

export default Pagination
