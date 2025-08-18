import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Tournaments from './pages/Tournaments';
import LoginPage from './pages/LoginPage';
import Registration from './pages/Registration';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import PrivateRoute from "./components/PrivateRoute.jsx";

const AdminRoute = ({ children }) => {
    const role = localStorage.getItem('role');
    return role === 'ADMIN' ? children : <Navigate to="/" />;
};

function App() {
  return (
      <Router>
        <Navbar />
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registration" element={<Registration />} />
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminPage />
                    </AdminRoute>
                }
            />
        </Routes>
      </Router>
  );
}

export default App;