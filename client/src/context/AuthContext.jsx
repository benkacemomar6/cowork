import React, { createContext, useContext, useState ,useEffect,useCallback} from 'react'
import { io } from 'socket.io-client'
import api from '../api/axios'
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
    const [socket, setSocket] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)

    const refreshUnreadCount = useCallback(async () => {
        try {
            const res = await api.get('/notifications')
            setUnreadCount(res.data.filter((n) => !n.isRead).length)
        } catch (err) {
            // badge just won't update — notifications failing isn't fatal to auth
        }
    }, [])

function login(userData,authToken){
    setuser(userData);
    settoken(authToken);
    localStorage.setItem('token',authToken)
    localStorage.setItem('user',JSON.stringify(userData))


}
function updateUser(userData){
    setuser(userData);
    localStorage.setItem('user',JSON.stringify(userData))
}
function logout(){
    settoken(null)
    setuser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
}
useEffect(() => {
    if (!user) {
        setSocket(null)
        setUnreadCount(0)
        return
    }

    const newSocket = io('http://localhost:3000', { withCredentials: true })
    newSocket.on('connect', () => {
        newSocket.emit('register', user._id)
    })
    newSocket.on('new_notification', refreshUnreadCount)
    setSocket(newSocket)
    refreshUnreadCount()

    return () => {
        newSocket.off('new_notification', refreshUnreadCount)
        newSocket.disconnect()
    }
}, [user, refreshUnreadCount])

  return (
    <AuthContext.Provider value={{user,token,login,logout,updateUser,socket,unreadCount,refreshUnreadCount}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
    return useContext(AuthContext);
}
