import { useNavigate } from "react-router-dom";

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="logo">
        <img
          src="/logo.svg"
          alt="Студенческий портал"
          className="logo-img"
        />

      </div>

      <div className="system-name">
        Система управления учебным процессом
      </div>

      <div className="user-info">
        {!user && (
          <>
            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Войти
            </button>
            <button
              className="register-btn"
              onClick={() => navigate("/register")}
            >
              Регистрация
            </button>
          </>
        )}

        {user && (
          <>
            <span>{user.name}</span>
            <button
              className="logout-btn"
              onClick={() => {
                onLogout();
                navigate("/");
              }}
            >
              Выйти
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
