import { useNavigate } from "react-router-dom";

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="logo">🎓 Student Portal</div>

      <div className="system-name">
        Sistema de Gestión Académica
      </div>

      <div className="user-info">
        {!user && (
          <>
            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>
            <button
              className="register-btn"
              onClick={() => navigate("/register")}
            >
              Registrarse
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
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
