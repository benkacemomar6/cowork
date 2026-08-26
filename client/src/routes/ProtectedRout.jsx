import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function ProtectedRout({children, role}) {
    const {user}=useAuth();


     if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/jobs" />;
    }

    return children;
}

export default ProtectedRout