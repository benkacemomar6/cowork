import React, { useState } from 'react'
import api from '../api/axios'

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSaved(false)
        setSaving(true)
        try {
            await api.patch('/users/change-password', { currentPassword, newPassword })
            setSaved(true)
            setCurrentPassword('')
            setNewPassword('')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="container">
            <p className="eyebrow">Account</p>
            <h1>Change Password</h1>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    {saved && <p className="success-text">Password changed.</p>}
                    {error && <p className="error-text">{error}</p>}
                    <div className="field">
                        <label htmlFor="current-password">Current password</label>
                        <input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="new-password">New password</label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={saving}>Save</button>
                </form>
            </div>
        </div>
    )
}

export default ChangePassword
