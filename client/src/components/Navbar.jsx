import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const { user, logout, unreadCount } = useAuth();   // CHANGED — added unreadCount
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">Co<span className="navbar-brand-accent">Work</span></Link>

                <div className="navbar-links">
                    <NavLink to="/jobs" className="navbar-link">Browse Jobs</NavLink>

                    {user && user.role === 'client' && (
                        <>
                            <NavLink to="/my-jobs" className="navbar-link">My Jobs</NavLink>
                            <NavLink to="/jobs/new" className="navbar-link">Post a Job</NavLink>
                        </>
                    )}
                    {user && user.role === 'freelancer' && (
                        <NavLink to="/my-proposals" className="navbar-link">My Proposals</NavLink>
                    )}
                    {user && user.role === 'admin' && (
                        <NavLink to="/admin" className="navbar-link">Admin</NavLink>
                    )}
                    {user && (
                        <>
                            <NavLink to="/messages" className="navbar-link">Messages</NavLink>
                            <NavLink to="/notifications" className="navbar-link">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="navbar-badge">{unreadCount}</span>
                                )}
                            </NavLink>
                            <NavLink to="/profile" className="navbar-link">Profile</NavLink>
                        </>
                    )}
                </div>

                {user ? (
                    <div className="navbar-user">
                        <span className="navbar-avatar">{user.name?.[0]?.toUpperCase() || '?'}</span>
                        <span className="navbar-name">{user.name}</span>
                        <button className="btn-secondary btn-sm" onClick={logout}>Logout</button>
                    </div>
                ) : (
                    <div className="navbar-user">
                        <NavLink to="/login" className="navbar-link">Login</NavLink>
                        <NavLink to="/register" className="navbar-link">Register</NavLink>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar