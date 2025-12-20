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
        setError("Неверный адрес электронной почты или пароль");
        return;
      }

      const data = await res.json();

      // Сохранить токен
      localStorage.setItem("token", data.token);

      // Уведомить App.jsx
      onLoginSuccess();

    } catch (err) {
      setError("Ошибка подключения к серверу");
    }
  };

  return (
    <div className="login-container">
      <h1>Вход в систему</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>Электронная почта</label>
        <input
          type="email"
          placeholder="user@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Пароль</label>
        <input
          type="password"
          placeholder="••••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Войти</button>

        <p className="register-link">
          Нет аккаунта? <a href="#">Зарегистрироваться</a>
        </p>

        {error && (
          <p className="error-message">{error}</p>
        )}
      </form>
    </div>
  );
}

export default Login;
