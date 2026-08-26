import React from 'react'
import { useState } from 'react';
import api from '../api/axios'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
        const [mail, setmail] = useState('')
        const [pass, setpass] = useState('');
        const[role,setrole]= useState('client')
        const [name,setname]=useState("")
        const { login } = useAuth()
        const [error,seterror]=useState("")
        const nav = useNavigate();
async function handelSubmit(e){
e.preventDefault()
seterror("");
    try {
        await api.post("/auth/register",{
            name: name,
            email: mail,
            password: pass,
            role: role
        })
        const res = await api.post("/auth/login", { email: mail, password: pass });
        const { token, refreshToken, user } = res.data;
        login(user, token);
        localStorage.setItem('refreshToken', refreshToken);
        nav("/");



    } catch (error) {
        seterror(error.response?.data?.message || 'Something went wrong');
    }


}

  return (
    <div className="auth-shell">
        <p className="eyebrow">CoWork</p>
        <h1>Create an account</h1>
        <div className="card">
            <form onSubmit={handelSubmit}>
                {error && <p className="error-text">{error}</p>}

                <div className="field">
                    <label htmlFor="register-name">Full name</label>
                    <input
                        id="register-name"
                        type="text"
                        value={name}
                        onChange={(e) => setname(e.target.value)}
                        placeholder="Jane Doe"
                    />
                </div>

                <div className="field">
                    <label htmlFor="register-email">Email</label>
                    <input
                        id="register-email"
                        type="email"
                        value={mail}
                        onChange={(e) => setmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>

                <div className="field">
                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        value={pass}
                        onChange={(e) => setpass(e.target.value)}
                        placeholder="********"
                    />
                </div>

                <div className="field">
                    <label htmlFor="register-role">I am a&hellip;</label>
                    <select id="register-role" value={role} onChange={(e) => setrole(e.target.value)}>
                        <option value="client">Client — I want to hire</option>
                        <option value="freelancer">Freelancer — I want to work</option>
                    </select>
                </div>

                <button type="submit">Register</button>
            </form>
        </div>
    </div>
  )
}

export default Register
