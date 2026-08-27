import React from 'react'
import { NavLink } from 'react-router-dom'

function tabClass({ isActive }) {
    return isActive ? 'admin-tab admin-tab--active' : 'admin-tab'
}

function AdminTabs() {
    return (
        <div className="admin-tabs">
            <NavLink to="/admin" end className={tabClass}>Dashboard</NavLink>
            <NavLink to="/admin/users" className={tabClass}>Users</NavLink>
            <NavLink to="/admin/jobs" className={tabClass}>Jobs</NavLink>
        </div>
    )
}

export default AdminTabs
