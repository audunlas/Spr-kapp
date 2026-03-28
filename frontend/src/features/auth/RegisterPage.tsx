import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

    setIsLoading(true);
    setError(null);
    try {
      await register(username, password, email);
      navigate("/");
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
