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
import TournamentDetail from './pages/TournamentDetail';
import TournamentMatches from './pages/TournamentMatches';
import TournamentManagement from "./pages/TournamentManagement.jsx";
import EditProfile from './pages/EditProfile';
import EditTournament from "./pages/EditTournament.jsx";
import TournamentPlayersManagement from "./pages/TournamentPlayersManagement.jsx";
import TopPlayers from "./pages/TopPlayers.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

const AdminRoute = ({ children }) => {
    const role = localStorage.getItem('role');
    return role === 'ADMIN' ? children : <Navigate to="/" />;
};

function App() {
  return (
      <Router>
          <div className="app-container">
              <div className="content-wrapper"> {/* НОВЫЙ контейнер */}
                  <Navbar />
                  <div className="main-content">
                      <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/tournament/:id" element={<TournamentDetail />} />
            <Route path="/matches/:tournamentId" element={<TournamentMatches />} />
            <Route path="/admin/tournament/:tournamentId/:roundId" element={<TournamentManagement />} />
            <Route path="/admin/tournament/:tournamentId/edit" element={<EditTournament />} />
            <Route path="/admin/players/:tournamentId" element={<TournamentPlayersManagement />} />
            <Route path="/top" element={<TopPlayers />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                }
            />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminPage />
                    </AdminRoute>
                }
            />
                      </Routes>
                  </div>
              </div>
              <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4 className="footer-title">ChessUnion</h4>
                    <p className="footer-text">Шахматный клуб в Сочи</p>
                </div>
                <div className="footer-section">
                    <h4 className="footer-title">Контактная информация</h4>
                    <p className="footer-text">ИП Ковалёв Борис Геннадьевич</p>
                    <p className="footer-text">ОРГНИП 325237500429920</p>
                    <p className="footer-text">ИНН 671206955889</p>
                </div>
                <div className="footer-section">
                    <h4 className="footer-title">Адрес</h4>
                    <p className="footer-text">Краснодарский Край, Адлерский район</p>
                    <p className="footer-text">г. Сочи, ул. Искры, 88к3, кВ 131</p>
                </div>
                <div className="footer-section">
                    <h4 className="footer-title">Email</h4>
                    <a href="mailto:boris.kovalyov.05.04@yandex.ru" className="footer-link">
                        boris.kovalyov.05.04@yandex.ru
                    </a>
                </div>
            </div>
              </footer>
          </div>
      </Router>
  );
}

export default App;