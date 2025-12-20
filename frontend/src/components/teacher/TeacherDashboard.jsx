import { useEffect, useState } from "react";
import TeacherCourseView from "./TeacherCourseView";

function TeacherDashboard({ selectedCourseId, setSelectedCourseId }) {
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [schedule, setSchedule] = useState([]);

  const token = localStorage.getItem("token");

  // ==========================
  // НЕПРОВЕРЕННЫЕ РАБОТЫ
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
  // РАСПИСАНИЕ НА СЕГОДНЯ
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
  // ОБЩАЯ ПАНЕЛЬ
  // ==========================
  if (!selectedCourseId) {
    return (
      <>
        <h1>Панель преподавателя</h1>

        <div className="cards">
          {/* НЕПРОВЕРЕННЫЕ РАБОТЫ */}
          <div className="card">
            <h2>Работы на проверке</h2>

            {pendingSubmissions.length === 0 ? (
              <p>Нет работ, ожидающих проверки.</p>
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

          {/* РАСПИСАНИЕ */}
          <div className="card">
            <h2>Расписание на сегодня</h2>

            {schedule.length === 0 ? (
              <p>Сегодня занятий нет.</p>
            ) : (
              <ul>
                {schedule.map((s, i) => (
                  <li key={i}>
                    {s.start_time} – {s.end_time}<br />
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
  // ПРОСМОТР КУРСА
  // ==========================
  return (
    <TeacherCourseView
      courseGroupId={selectedCourseId}
      onBack={() => setSelectedCourseId(null)}
    />
  );
}

export default TeacherDashboard;
