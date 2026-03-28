import { type FormEvent, useState } from "react";
import { useAuthContext } from "../auth/AuthContext";
import { updateSettings } from "../../api/auth";
import { LANGUAGES } from "../../constants/languages";

export function SettingsPage() {
  const { user, setUser } = useAuthContext();
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nativeLanguage = (form.elements.namedItem("native_language") as HTMLSelectElement).value;

    setIsLoading(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updateSettings(nativeLanguage);
      setUser(updated);
      setSaved(true);
    } catch {
      setError("Failed to save settings.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Settings</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="native_language">Your native language</label>
          <select id="native_language" name="native_language" defaultValue={user?.native_language ?? "en"}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
        {saved && <p className="success">Settings saved.</p>}
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
