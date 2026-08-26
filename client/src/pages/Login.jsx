import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';


function Login() {
    const [mail, setmail] = useState('')
    const [pass, setpass] = useState('');
    const { login } = useAuth()
    const [error,seterror]=useState("")

    const nav = useNavigate();
    async function handelsubmit(e) {
        e.preventDefault()
        seterror("");
        try{


        const res = await api.post('/auth/login', { email: mail, password: pass });
        const { token, refreshToken, user } = res.data;
        login(user, token);
        localStorage.setItem('refreshToken', refreshToken);
        nav("/");}
            catch(err){
                seterror(err.response?.data?.message || "Somethnig whent wrong")
            }








    }
    return (
        <div className="auth-shell">
            <p className="eyebrow">CoWork</p>
            <h1>Log in</h1>
            <div className="card">
                <form onSubmit={handelsubmit}>
                    {error && <p className="error-text">{error}</p>}
                    <div className="field">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            value={mail}
                            onChange={(e) => setmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            value={pass}
                            onChange={(e) => setpass(e.target.value)}
                            placeholder="********"
                        />
                    </div>
                    <button type="submit">Log in</button>
                </form>
            </div>
        </div>
    )
}

export default Login
