import { useEffect, useState } from "react";
import AssignmentSubmitForm from "../assignments/AssignmentSubmitForm";


function StudentDashboard({ selectedCourseId, setSelectedCourseId }) {
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);


  const token = localStorage.getItem("token");

  // Cargar cursos del estudiante (para tarjetas del body)
  useEffect(() => {
    fetch("http://localhost:4000/courses/my", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  // Cargar detalle del curso seleccionado
  useEffect(() => {
    if (!selectedCourseId) {
      setSummary(null);
      setTopics([]);
      return;
    }


    fetch(`http://localhost:4000/courses/${selectedCourseId}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setSummary);

    fetch(`http://localhost:4000/courses/${selectedCourseId}/topics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setTopics);

    console.log("Selected course group:", selectedCourseId);

    fetch(`http://localhost:4000/assignments/course/${selectedCourseId}`, {
    headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setAssignments);

  }, [selectedCourseId]);

  // SIN CURSO SELECCIONADO → tarjetas
// =====================
// DASHBOARD GENERAL
// =====================
if (!selectedCourseId) {
  return (
    <>
      <h1>Dashboard</h1>
      <p>Bienvenido al portal estudiantil.</p>

      <div className="cards">
        {courses.length === 0 && (
          <p>No estás inscrito en ningún curso.</p>
        )}

        {courses.map((course) => (
          <div
            key={course.course_group_id}
            className="card"
            onClick={() => setSelectedCourseId(course.course_group_id)}
            style={{ cursor: "pointer" }}
          >
            <h2>{course.title}</h2>
            <p>Profesor: {course.teacher}</p>
            <p className="highlight-blue">
              Click para ver el curso
            </p>
          </div>
        ))}
      </div>
    </>
  );
}


  // CON CURSO SELECCIONADO → detalle
  return (
    <>
      <button onClick={() => setSelectedCourseId(null)}>← Volver</button>

      {!summary ? (
        <p>Cargando curso...</p>
      ) : (
        <>
          <h1>{summary.title}</h1>
          <p>Promedio: {summary.average}</p>
          <p>Tareas pendientes: {summary.pending_assignments}</p>

          <h2>Tareas</h2>

            {assignments.length === 0 && (
            <p>No hay tareas asignadas.</p>
            )}

            {assignments.map(a => (
            <div key={a.id} className="card">
                <h3>{a.title}</h3>
                <p>Entrega: {new Date(a.due_at).toLocaleDateString()}</p>

                {a.submission_status === "REVIEWED" && (
                <p className="highlight-green">Calificada</p>
                )}

                {a.submission_status !== "REVIEWED" && (
                <AssignmentSubmitForm
                    assignmentId={a.id}
                    onSuccess={() => {
                    // recargar tareas tras subir
                    fetch(`http://localhost:4000/assignments/course/${selectedCourseId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                        .then(res => res.json())
                        .then(setAssignments);
                    }}
                />
                )}
            </div>
            ))}


          <h2>Temas</h2>

          {topics.length === 0 && <p>No hay temas publicados.</p>}

          {topics.map((t) => (
            <div key={`${t.topic_id}-${t.resource_id ?? "none"}`} className="card">
              <h3>{t.topic_title}</h3>

              {t.resource_id ? (
                <a href={t.file_url} download>
                  {t.resource_title}
                </a>
              ) : (
                <p>(Sin recursos)</p>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default StudentDashboard;
