import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../features/auth/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <Link to="/" className="brand">Språkapp</Link>
        {user && (
          <div className="nav-actions">
            <span className="nav-user">{user.username}</span>
            <Link to="/upload">Upload</Link>
            <button onClick={handleLogout} className="btn-link">Log out</button>
          </div>
        )}
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
