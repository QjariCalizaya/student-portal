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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentCourses, setStudentCourses] = useState([]);
const [selectedCourseId, setSelectedCourseId] = useState(null);
const [teacherCourses, setTeacherCourses] = useState([]);



  const loadUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:4000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

// 1️⃣ Cargar usuario
useEffect(() => {
  loadUser();
}, []);


// 2️⃣ Cargar cursos del ESTUDIANTE
useEffect(() => {
  if (!user || user.role !== "STUDENT") {
    setStudentCourses([]);
    return;
  }

  const token = localStorage.getItem("token");

  fetch("http://localhost:4000/courses/my", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(setStudentCourses)
    .catch(() => setStudentCourses([]));
}, [user]);


// 3️⃣ Cargar cursos del PROFESOR
useEffect(() => {
  if (!user || user.role !== "TEACHER") {
    setTeacherCourses([]);
    return;
  }

  const token = localStorage.getItem("token");

  fetch("http://localhost:4000/courses/teacher", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(setTeacherCourses)
    .catch(() => setTeacherCourses([]));
    console.log("Teacher courses:", teacherCourses);

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
      <Header
        user={user}
        onLogout={logout}
      />

      <div className="layout">
    {user && (
      <Sidebar
        role={user.role}
        courses={
          user.role === "STUDENT"
            ? studentCourses
            : teacherCourses
        }
        onSelectCourse={setSelectedCourseId}
      />
    )}



        <main className="content">
          <Routes>

            {/* HOME PUBLICO */}
            <Route
              path="/"
              element={!user ? <Home /> : <Navigate to="/dashboard" />}
            />

            {/* LOGIN */}
            <Route
              path="/login"
              element={!user
                ? <Login onLoginSuccess={loadUser} />
                : <Navigate to="/dashboard" />
              }
            />

            {/* REGISTER */}
            <Route
              path="/register"
              element={!user
                ? <Register />
                : <Navigate to="/dashboard" />
              }
            />

            {/* DASHBOARD PROTEGIDO */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  {user?.role === "STUDENT" ? (
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


            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
