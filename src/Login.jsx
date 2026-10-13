
import { useState } from "react";
import axios from "axios";
import "./Login.css";

const API = "http://localhost:8080/api/users";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/register" : "/login";
      const payload = isRegister
        ? { name, email, password, role: "USER" }
        : { email, password };

      const response = await axios.post(API + endpoint, payload);

      if (isRegister) {
        setMessage("Account created! You can now sign in.");
        setIsRegister(false);
        setPassword("");
      } else {
        onLogin(response.data);
      }
    } catch (error) {
      const errorText = error.response?.data;
      setMessage(
        typeof errorText === "string"
          ? errorText
          : "Unable to connect. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <a className="login-brand" href="#">
          <span className="login-logo">R</span>
          <span>ReFound<span className="login-dot">.</span></span>
        </a>

        <p className="login-kicker">YOUR CAMPUS LOST & FOUND</p>

        <h1>{isRegister ? "Join ReFound." : "Welcome back."}</h1>
        <p className="login-subtitle">
          {isRegister
            ? "Create an account to help belongings find their way home."
            : "Sign in to reconnect people with their belongings."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>

          {message && (
            <p className="login-message" role="status">{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
            {!loading && <span aria-hidden="true"> →</span>}
          </button>
        </form>

        <p className="login-switch">
          {isRegister ? "Already have an account?" : "New to ReFound?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister ? "Sign in" : "Create an account"}
          </button>
        </p>

        <a className="login-back" href="/">
          ← Back to the community board
        </a>
      </section>
    </main>
  );
}
