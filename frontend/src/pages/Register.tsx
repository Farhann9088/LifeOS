
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
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
        <span className="eyebrow">START YOUR JOURNEY</span>
        <h1>Make room for growth.</h1>
        <p className="auth-description">
          Create your personal space to plan, build and progress.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />

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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>

      <p className="auth-footer">A little better, every day.</p>
    </main>
  );
}
