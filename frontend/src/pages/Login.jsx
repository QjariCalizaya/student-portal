import { useState } from "react";
import "../styles/login.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        setError("Credenciales incorrectas");
        return;
      }

      const data = await res.json();

      // Guardar token
      localStorage.setItem("token", data.token);

      // Notificar a App.jsx
      onLoginSuccess();

    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar sesión</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>Correo electrónico</label>
        <input
          type="email"
          placeholder="usuario@correo.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Contraseña</label>
        <input
          type="password"
          placeholder="••••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Entrar</button>

        <p className="register-link">
          ¿No tienes cuenta? <a href="#">Regístrate</a>
        </p>

        {error && (
          <p className="error-message">{error}</p>
        )}
      </form>
    </div>
  );
}

export default Login;
