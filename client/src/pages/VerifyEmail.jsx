import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

function VerifyEmail() {
    const { token } = useParams()
    const [status, setStatus] = useState('pending') // pending | success | error
    const [message, setMessage] = useState('')

    useEffect(() => {
        let cancelled = false

        async function verify() {
            try {
                const res = await api.post(`/auth/verify-email/${token}`)
                if (!cancelled) {
                    setStatus('success')
                    setMessage(res.data.message)
                }
            } catch (err) {
                if (!cancelled) {
                    setStatus('error')
                    setMessage(err.response?.data?.message || 'Something went wrong')
                }
            }
        }
        verify()

        return () => { cancelled = true }
    }, [token])

    return (
        <div className="auth-shell">
            <p className="eyebrow">CoWork</p>
            <h1>Email verification</h1>
            <div className="card">
                {status === 'pending' && <p className="loading-state">Verifying your email&hellip;</p>}
                {status === 'success' && <p className="success-text">{message}</p>}
                {status === 'error' && <p className="error-text">{message}</p>}
                <div className="card-footer">
                    <Link to="/login">Back to log in</Link>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail
