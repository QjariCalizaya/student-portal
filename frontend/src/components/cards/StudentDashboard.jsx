import { useEffect, useState } from "react";
import AssignmentSubmitForm from "../assignments/AssignmentSubmitForm";
import { downloadFile } from "../../utils/downloadFile";

/**
 * Agrupa filas planas de topics + resources
 * en estructura jerárquica por tema
 */
function groupTopics(rows) {
  const map = new Map();

  for (const r of rows) {
    if (!map.has(r.topic_id)) {
      map.set(r.topic_id, {
        topic_id: r.topic_id,
        topic_title: r.topic_title,
        resources: []
      });
    }

    if (r.resource_id) {
      map.get(r.topic_id).resources.push({
        resource_id: r.resource_id,
        resource_title: r.resource_title
      });
    }
  }

  return Array.from(map.values());
}

function StudentDashboard({ selectedCourseId, setSelectedCourseId }) {
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const token = localStorage.getItem("token");

  // ==========================
  // Cargar cursos del estudiante
  // ==========================
  useEffect(() => {
    fetch("http://localhost:4000/courses/my", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCourses)
      .catch(() => setCourses([]));
  }, [token]);

  // ==========================
  // Cargar datos del curso seleccionado
  // ==========================
  useEffect(() => {
    if (!selectedCourseId) {
      setSummary(null);
      setTopics([]);
      setAssignments([]);
      return;
    }

    // Resumen
    fetch(`http://localhost:4000/courses/${selectedCourseId}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSummary);

    // Temas + materiales (agrupados)
    fetch(`http://localhost:4000/courses/${selectedCourseId}/topics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(rows => setTopics(groupTopics(rows)));

    // Tareas
    fetch(`http://localhost:4000/assignments/course/${selectedCourseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAssignments);

  }, [selectedCourseId, token]);

  // ==========================
  // DASHBOARD GENERAL
  // ==========================
  if (!selectedCourseId) {
    return (
      <>
        <h1>Панель управления</h1>
        <p>Добро пожаловать в студенческий портал.</p>

        <div className="cards">
          {courses.length === 0 && (
            <p>Вы не записаны ни на один курс.</p>
          )}

          {courses.map(course => (
            <div
              key={course.course_group_id}
              className="card"
              onClick={() => setSelectedCourseId(course.course_group_id)}
              style={{ cursor: "pointer" }}
            >
              <h2>{course.title}</h2>
              <p>Преподаватель: {course.teacher}</p>
              <p className="highlight-blue">
                Нажмите, чтобы открыть курс
              </p>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ==========================
  // DETALLE DEL CURSO
  // ==========================
  return (
    <>
      <button onClick={() => setSelectedCourseId(null)}>
        ← Назад
      </button>

      {!summary ? (
        <p>Загрузка курса...</p>
      ) : (
        <>
          <h1>{summary.title}</h1>
          <p>Средний балл: {summary.average}</p>
          <p>Невыполненные задания: {summary.pending_assignments}</p>

          {/* ==========================
              TAREAS
          ========================== */}
          <h2>Задания</h2>

          {assignments.length === 0 && (
            <p>Задания отсутствуют.</p>
          )}

          {assignments.map(a => (
            <div key={a.id} className="card">
              <h3>{a.title}</h3>
              <p>
                Срок сдачи:{" "}
                {new Date(a.due_at).toLocaleDateString()}
              </p>

              {a.submission_status === "REVIEWED" && (
                <p className="highlight-green">Проверено</p>
              )}

              {a.submission_status !== "REVIEWED" && (
                <AssignmentSubmitForm
                  assignmentId={a.id}
                  onSuccess={() => {
                    fetch(
                      `http://localhost:4000/assignments/course/${selectedCourseId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      }
                    )
                      .then(res => res.json())
                      .then(setAssignments);
                  }}
                />
              )}
            </div>
          ))}

          {/* ==========================
              MATERIALES
          ========================== */}
          <h2>Материалы</h2>

          {topics.length === 0 && (
            <p>Материалы не опубликованы.</p>
          )}

          {topics.map(t => (
            <div key={t.topic_id} className="card">
              <h3>{t.topic_title}</h3>

              {t.resources.length === 0 ? (
                <p>(Файлы отсутствуют)</p>
              ) : (
                <ul>
                  {t.resources.map(r => (
                    <li key={r.resource_id}>
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={() =>
                          downloadFile(
                            r.resource_id,
                            r.resource_title
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            downloadFile(
                              r.resource_id,
                              r.resource_title
                            );
                          }
                        }}
                        style={{
                          cursor: "pointer",
                          color: "#2563eb",
                          textDecoration: "underline"
                        }}
                      >
                        {r.resource_title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default StudentDashboard;
