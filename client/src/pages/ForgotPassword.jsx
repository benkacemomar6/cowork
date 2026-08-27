import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setMessage('')
        setSubmitting(true)
        try {
            const res = await api.post('/auth/forgot-password', { email })
            setMessage(res.data.message)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="auth-shell">
            <p className="eyebrow">CoWork</p>
            <h1>Forgot password</h1>
            <div className="card">
                {message ? (
                    <p className="success-text">{message}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <p className="error-text">{error}</p>}
                        <p className="card-lede">Enter your account email and we'll send you a link to reset your password.</p>
                        <div className="field">
                            <label htmlFor="forgot-email">Email</label>
                            <input
                                id="forgot-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <button type="submit" disabled={submitting}>Send reset link</button>
                    </form>
                )}
                <div className="card-footer">
                    <Link to="/login">Back to log in</Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
