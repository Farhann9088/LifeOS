
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Unable to log in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark"><Sparkles size={21} /></div>
        <span>LifeOS</span>
      </div>

      <section className="auth-card">
        <span className="eyebrow">YOUR LIFE, IN SYNC</span>
        <h1>Welcome back.</h1>
        <p className="auth-description">
          Your next chapter starts with a little progress today.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-switch">
          New to LifeOS? <Link to="/register">Create an account</Link>
        </p>
      </section>

      <p className="auth-footer">A little better, every day.</p>
    </main>
  );
}
