import { useState } from "react";
import "../styles/login.css"; // reutilizamos el mismo estilo
import { useNavigate } from "react-router-dom";


function Register({ onRegisterSuccess }) {
    const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      if (!res.ok) {
        setError("No se pudo registrar el usuario");
        return;
      }

      // Registro correcto → volver a login
      navigate("/login");
      onRegisterSuccess();

    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      <h1>Registro</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>Nombre completo</label>
        <input
          type="text"
          placeholder="Juan Pérez"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <button type="submit">Registrarse</button>

        <p className="register-link">
          ¿Ya tienes cuenta?{" "}
          <a href="#" onClick={onRegisterSuccess}>
            Inicia sesión
          </a>
        </p>

        {error && (
          <p className="error-message">{error}</p>
        )}
      </form>
    </div>
  );
}

export default Register;
