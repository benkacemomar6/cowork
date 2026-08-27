import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function ProfileEdit() {
    const { updateUser } = useAuth()
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [skills, setSkills] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await api.get('/users/profile')
                const profile = res.data.data
                setName(profile.name)
                setBio(profile.bio || '')
                setSkills((profile.skills || []).join(', '))
                setLoading(false)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile')
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSaved(false)
        setSaving(true)
        try {
            const res = await api.patch('/users/profile', {
                name,
                bio,
                skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
            })
            updateUser(res.data.data)
            setSaved(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="container"><p className="loading-state">Loading&hellip;</p></div>

    return (
        <div className="container">
            <p className="eyebrow">Account</p>
            <h1>Edit Profile</h1>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    {saved && <p className="success-text">Profile saved.</p>}
                    {error && <p className="error-text">{error}</p>}
                    <div className="field">
                        <label htmlFor="profile-name">Name</label>
                        <input
                            id="profile-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="profile-bio">Bio</label>
                        <textarea
                            id="profile-bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="profile-skills">Skills (comma separated)</label>
                        <input
                            id="profile-skills"
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={saving}>Save</button>
                </form>
            </div>
            <p><Link to="/profile/change-password">Change password</Link></p>
        </div>
    )
}

export default ProfileEdit
