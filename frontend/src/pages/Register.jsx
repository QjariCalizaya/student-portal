import { useState } from "react";
import "../styles/login.css"; // используем тот же стиль
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
        setError("Не удалось зарегистрировать пользователя");
        return;
      }

      // Успешная регистрация → возврат на страницу входа
      navigate("/login");
      onRegisterSuccess();

    } catch (err) {
      setError("Ошибка подключения к серверу");
    }
  };

  return (
    <div className="login-container">
      <h1>Регистрация</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>Полное имя</label>
        <input
          type="text"
          placeholder="Иван Иванов"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <button type="submit">Зарегистрироваться</button>

        <p className="register-link">
          Уже есть аккаунт?{" "}
          <a href="#" onClick={onRegisterSuccess}>
            Войти
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
