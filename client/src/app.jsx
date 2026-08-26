import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import MyJobs from './pages/MyJobs';
import MyProposals from './pages/MyProposals';
import PublicProfile from './pages/PublicProfile';
import ProfileEdit from './pages/ProfileEdit';
import ChangePassword from './pages/ChangePassword';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import ProtectedRout from './routes/ProtectedRout';

function App() {
    return (
        // wrap everything in AuthProvider, then BrowserRouter, then Routes
        // add two routes: /login -> Login, /register -> Register
    <AuthProvider>
        <BrowserRouter>
        <Navbar/>
        <Routes>
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/new" element={<ProtectedRout role="client"><CreateJob /></ProtectedRout>} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/jobs/:id/edit" element={<ProtectedRout role="client"><EditJob /></ProtectedRout>} />
            <Route path="/my-jobs" element={<ProtectedRout role="client"><MyJobs /></ProtectedRout>} />
            <Route path="/my-proposals" element={<ProtectedRout role="freelancer"><MyProposals /></ProtectedRout>} />
            <Route path="/users/:id" element={<PublicProfile />} />
            <Route path="/profile" element={<ProtectedRout><ProfileEdit /></ProtectedRout>} />
            <Route path="/profile/change-password" element={<ProtectedRout><ChangePassword /></ProtectedRout>} />
            <Route path="/notifications" element={<ProtectedRout><Notifications /></ProtectedRout>} />
            <Route path="/messages" element={<ProtectedRout><Messages /></ProtectedRout>} />


        </Routes>



        </BrowserRouter>
        

    </AuthProvider>
    );
}

export default App;