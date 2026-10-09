import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, LockKeyhole, ShieldCheck } from "lucide-react";
import { adminLogin, usingDefaultCredentials } from "./auth";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(username, password)) {
      onLogin();
      return;
    }
    setError("Those credentials don't match. Please try again.");
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <Link to="/" className="brand login-brand">
          <span className="brand-mark"><Home size={18}/></span>
          <span>Aura Estates<span className="brand-dot">.</span><small>ADMINISTRATION</small></span>
        </Link>
        <div className="eyebrow"><span/> Restricted area</div>
        <h1>Admin <em>portal.</em></h1>
        <p className="login-lede">Sign in to manage properties, review inquiries, and use the AI assistant.</p>
        <form className="login-form" onSubmit={submit}>
          <label>Username
            <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Admin username" required autoFocus/>
          </label>
          <label>Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Your password" required/>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-dark full-width" type="submit">Sign in <ArrowRight size={16}/></button>
        </form>
        {import.meta.env.DEV && usingDefaultCredentials && (
          <p className="login-hint"><LockKeyhole size={14}/>
            <span>Demo credentials: <b>admin / aura2026</b>. Set <code>VITE_ADMIN_USERNAME</code> and <code>VITE_ADMIN_PASSWORD</code> in a <code>.env</code> file to change them.</span>
          </p>
        )}
        <div className="login-footnote"><ShieldCheck size={14}/> Sign-in lasts until you close this browser tab.</div>
        <Link className="login-back" to="/"><ArrowLeft size={14}/> Back to the public site</Link>
      </div>
    </main>
  );
}
