import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError("Passwords don't match")
            return
        }

        setSubmitting(true)
        try {
            await api.post(`/auth/reset-password/${token}`, { password })
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="auth-shell">
            <p className="eyebrow">CoWork</p>
            <h1>Reset password</h1>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-text">{error}</p>}
                    <div className="field">
                        <label htmlFor="reset-password">New password</label>
                        <input
                            id="reset-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="reset-password-confirm">Confirm new password</label>
                        <input
                            id="reset-password-confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                    </div>
                    <button type="submit" disabled={submitting}>Reset password</button>
                </form>
                <div className="card-footer">
                    <Link to="/login">Back to log in</Link>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
