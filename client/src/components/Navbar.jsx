import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { treasury } = useGame();

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/lab" className="navbar-brand">GhostKitchen</Link>
      <div className="navbar-links">
        <Link to="/lab">Lab</Link>
        <Link to="/recipes">Recipes</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/service">Service</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
      <div className="navbar-right">
        <span className="navbar-treasury">{treasury}$</span>
        <span className="navbar-user">{user.name}</span>
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}
