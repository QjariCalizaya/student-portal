import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [studentCourses, setStudentCourses] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedView, setSelectedView] = useState("dashboard");
  // dashboard | course | schedule

  // =========================
  // Cargar usuario
  // =========================
  const loadUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:4000/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadUser();
  }, []);

  // =========================
  // Cursos estudiante
  // =========================
  useEffect(() => {
    if (!user || user.role !== "STUDENT") {
      setStudentCourses([]);
      return;
    }

    fetch("http://localhost:4000/courses/my", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(setStudentCourses)
      .catch(() => setStudentCourses([]));
  }, [user]);

  // =========================
  // Cursos profesor
  // =========================
  useEffect(() => {
    if (!user || user.role !== "TEACHER") {
      setTeacherCourses([]);
      return;
    }

    fetch("http://localhost:4000/courses/teacher", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(setTeacherCourses)
      .catch(() => setTeacherCourses([]));
  }, [user]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Cargando...</p>;
  }

  return (
    <Router>
      <Header user={user} onLogout={logout} />

      <div className="layout">
        {user && (
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
        )}

        <main className="content">
          <Routes>

            {/* HOME */}
            <Route
              path="/"
              element={!user ? <Home /> : <Navigate to="/dashboard" />}
            />

            {/* LOGIN */}
            <Route
              path="/login"
              element={!user ? <Login onLoginSuccess={loadUser} /> : <Navigate to="/dashboard" />}
            />

            {/* REGISTER */}
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/dashboard" />}
            />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  {selectedView === "schedule" ? (
                    <MockScheduleCalendar />
                  ) : user.role === "STUDENT" ? (
                    <StudentDashboard
                      selectedCourseId={selectedCourseId}
                      setSelectedCourseId={(id) => {
                        setSelectedCourseId(id);
                        setSelectedView(id ? "course" : "dashboard");
                      }}
                    />
                  ) : (
                    <TeacherDashboard
                      selectedCourseId={selectedCourseId}
                      setSelectedCourseId={(id) => {
                        setSelectedCourseId(id);
                        setSelectedView(id ? "course" : "dashboard");
                      }}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
