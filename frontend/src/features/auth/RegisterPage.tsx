import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LANGUAGES } from "../../constants/languages";
import { useAuthContext as useAuth } from "./AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value || undefined;
    const nativeLanguage = (form.elements.namedItem("native_language") as HTMLSelectElement).value;
    const targetLanguage = (form.elements.namedItem("target_language") as HTMLSelectElement).value;

    setIsLoading(true);
    setError(null);
    try {
      await register(username, password, nativeLanguage, email);
      localStorage.setItem("targetLanguage", targetLanguage);
      navigate(`/learn/${targetLanguage}`);
    } catch {
      setError("Registration failed. Username may already be taken.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" type="text" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <div className="field">
          <label htmlFor="email">Email (optional)</label>
          <input id="email" name="email" type="email" />
        </div>
        <div className="field">
          <label htmlFor="native_language">Your native language</label>
          <select id="native_language" name="native_language" defaultValue="en">
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="target_language">Language you want to learn</label>
          <select id="target_language" name="target_language" defaultValue="es">
            {LANGUAGES.filter((l) => l.code !== "en").map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Registering…" : "Register"}
          </button>
          <p className="form-link">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </form>
    </div>
  );
}
