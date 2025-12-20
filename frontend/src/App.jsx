import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./components/cards/StudentDashboard";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import MockScheduleCalendar from "./components/schedule/MockScheduleCalendar";

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [studentCourses, setStudentCourses] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedView, setSelectedView] = useState("dashboard");

  // =========================
  // Cargar usuario
  // =========================
  const loadUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetch("http://localhost:4000/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUser();
  }, []);

  // =========================
  // Cargar cursos
  // =========================
  useEffect(() => {
    if (!user) return;

    const url =
      user.role === "STUDENT"
        ? "http://localhost:4000/courses/my"
        : "http://localhost:4000/courses/teacher";

    fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(user.role === "STUDENT" ? setStudentCourses : setTeacherCourses)
      .catch(() => {
        setStudentCourses([]);
        setTeacherCourses([]);
      });
  }, [user]);

  // =========================
  // Logout con redirección
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSelectedCourseId(null);
    setSelectedView("dashboard");

    navigate("/login");
  };

  // =========================
  // Loading
  // =========================
  if (loading) {
    return <p style={{ padding: 20 }}>Cargando...</p>;
  }

  // =========================
  // SIN USUARIO
if (!user) {
  return (
    <Routes>
      {/* REDIRECCIÓN AUTOMÁTICA */}
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login onLoginSuccess={loadUser} />} />
      <Route path="/register" element={<Register />} />

      {/* CUALQUIER OTRA RUTA */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}


  // =========================
  // CON USUARIO
  // =========================
  return (
    <>
      <Header user={user} onLogout={logout} />

      <div className="layout">
        <Sidebar
          role={user.role}
          courses={user.role === "STUDENT" ? studentCourses : teacherCourses}
          onSelectCourse={(id) => {
            setSelectedCourseId(id);
            setSelectedView(id ? "course" : "dashboard");
          }}
          onSelectSchedule={() => {
            setSelectedCourseId(null);
            setSelectedView("schedule");
          }}
        />

        <main className="content">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  {selectedView === "schedule" ? (
                    <MockScheduleCalendar />
                  ) : user.role === "STUDENT" ? (
                    <StudentDashboard
                      selectedCourseId={selectedCourseId}
                      setSelectedCourseId={setSelectedCourseId}
                    />
                  ) : (
                    <TeacherDashboard
                      selectedCourseId={selectedCourseId}
                      setSelectedCourseId={setSelectedCourseId}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

/**
 * Router único en toda la app
 */
export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
