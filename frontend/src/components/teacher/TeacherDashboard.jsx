import { useEffect, useState } from "react";
import TeacherCourseView from "./TeacherCourseView";

function TeacherDashboard({ selectedCourseId, setSelectedCourseId }) {
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [schedule, setSchedule] = useState([]);

  const token = localStorage.getItem("token");

  // ==========================
  // ENTREGAS PENDIENTES
  // ==========================
  useEffect(() => {
    fetch("http://localhost:4000/courses/teacher", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(async courses => {
        const all = [];

        for (const c of courses) {
          const res = await fetch(
            `http://localhost:4000/assignments/submissions/course/${c.id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          const data = await res.json();

          data
            .filter(s => s.status === "SUBMITTED")
            .forEach(s => {
              all.push({
                ...s,
                course: c.title,
                group: c.group_name
              });
            });
        }

        setPendingSubmissions(all);
      })
      .catch(() => setPendingSubmissions([]));
  }, [token]);

  // ==========================
  // HORARIO DE HOY
  // ==========================
  useEffect(() => {
    fetch("http://localhost:4000/dashboard/teacher/schedule/today", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSchedule)
      .catch(() => setSchedule([]));
  }, [token]);

  // ==========================
  // DASHBOARD GENERAL
  // ==========================
  if (!selectedCourseId) {
    return (
      <>
        <h1>Dashboard del profesor</h1>

        <div className="cards">
          {/* ENTREGAS */}
          <div className="card">
            <h2>Entregas pendientes</h2>

            {pendingSubmissions.length === 0 ? (
              <p>No hay entregas pendientes.</p>
            ) : (
              <ul>
                {pendingSubmissions.map(s => (
                  <li key={s.submission_id}>
                    <strong>{s.assignment_title}</strong><br />
                    {s.student_name} — {s.course} ({s.group})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* HORARIO */}
          <div className="card">
            <h2>Horario de hoy</h2>

            {schedule.length === 0 ? (
              <p>No tienes clases hoy.</p>
            ) : (
              <ul>
                {schedule.map((s, i) => (
                  <li key={i}>
                    {s.start_time} - {s.end_time}<br />
                    {s.course} ({s.group_name})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </>
    );
  }

  // ==========================
  // VISTA DE CURSO (RESTAURADA)
  // ==========================
  return (
    <TeacherCourseView
      courseGroupId={selectedCourseId}
      onBack={() => setSelectedCourseId(null)}
    />
  );
}

export default TeacherDashboard;
