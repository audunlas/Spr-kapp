import { Link, useLocation, useNavigate } from "react-router-dom";
import { LANGUAGES } from "../constants/languages";
import { useAuthContext } from "../features/auth/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const langMatch = location.pathname.match(/^\/learn\/([a-z]+)/);
  const currentLang = langMatch?.[1] ?? localStorage.getItem("targetLanguage") ?? "es";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value;
    localStorage.setItem("targetLanguage", lang);
    navigate(`/learn/${lang}`);
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <Link to={`/learn/${currentLang}`} className="brand">Språkapp</Link>
        {user && (
          <div className="nav-actions">
            <select
              className="lang-switcher"
              value={currentLang}
              onChange={handleLangChange}
              aria-label="Switch language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            <Link to={`/learn/${currentLang}/upload`}>Upload</Link>
            <Link to={`/learn/${currentLang}/vocab`}>Vocab</Link>
            <Link to="/classes">Classes</Link>
            <Link to="/settings">Settings</Link>
            <span className="nav-divider" aria-hidden="true" />
            <span className="nav-user">{user.username}</span>
            <button onClick={handleLogout} className="btn-link">Log out</button>
          </div>
        )}
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
