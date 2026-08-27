import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'

function Notifications() {
    const { socket, refreshUnreadCount } = useAuth()   // NEW
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // CHANGED — pulled out of useEffect so the socket listener can call it too
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications')
            setNotifications(res.data)
            setLoading(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load notifications')
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // NEW — refetch whenever a live notification arrives
    useEffect(() => {
        if (!socket) return

        function handleNewNotification() {
            fetchNotifications()
        }

        socket.on('new_notification', handleNewNotification)

        return () => {
            socket.off('new_notification', handleNewNotification)
        }
    }, [socket, fetchNotifications])

    async function handleMarkRead(notificationId) {
        try {
            const res = await api.patch(`/notifications/${notificationId}/read`)
            setNotifications((prev) =>
                prev.map((n) => (n._id === notificationId ? res.data : n))
            )
            refreshUnreadCount()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update notification')
        }
    }

    if (loading) return <div className="container"><p className="loading-state">Loading notifications&hellip;</p></div>
    if (error) return <div className="container"><p className="error-text">{error}</p></div>

    return (
        <div className="container">
            <p className="eyebrow">Inbox</p>
            <h1>Notifications</h1>
            {notifications.length === 0 && <p className="empty-state">No notifications yet.</p>}
            {notifications.map((n) => (
                <div
                    key={n._id}
                    className={`ledger-row ${!n.isRead ? 'ledger-row--unread ledger-row--interactive' : ''}`}
                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                >
                    <div className="ledger-row-label">
                        <span className="ledger-row-title">{n.message}</span>
                        <span className="ledger-row-meta"><span className="num">{formatDate(n.createdAt)}</span></span>
                    </div>
                    <div className="ledger-row-value">
                        <span className={`pill ${n.isRead ? 'pill--slate' : 'pill--amber'}`}>
                            {n.isRead ? 'Read' : 'Unread'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Notifications