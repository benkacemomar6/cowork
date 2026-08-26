import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function readStoredUser() {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const[user,setuser]=useState(readStoredUser);
    const [token,settoken]=useState(()=>localStorage.getItem('token'))
function login(userData,authToken){
    setuser(userData);
    settoken(authToken);
    localStorage.setItem('token',authToken)
    localStorage.setItem('user',JSON.stringify(userData))


}
function logout(){
    settoken(null)
    setuser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
}
  return (
    <AuthContext.Provider value={{user,token,login,logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
    return useContext(AuthContext);
}
