import { useEffect, useState } from "react";

function TeacherDashboard() {
  const [courseGroups, setCourseGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const token = localStorage.getItem("token");

  // Cargar grupos del profesor
  useEffect(() => {
    fetch("http://localhost:4000/courses/teacher", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCourseGroups);
  }, []);

  // Cargar entregas del grupo
  useEffect(() => {
    if (!selectedGroup) return;

    fetch(
      `http://localhost:4000/assignments/submissions/course/${selectedGroup}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => res.json())
      .then(setSubmissions);
  }, [selectedGroup]);

  return (
    <>
      <h1>Panel del profesor</h1>

      {/* Selección de grupo */}
      <select
        value={selectedGroup || ""}
        onChange={(e) => setSelectedGroup(e.target.value)}
      >
        <option value="">Selecciona un grupo</option>
        {courseGroups.map(g => (
          <option key={g.id} value={g.id}>
            {g.title} – {g.group_name}
          </option>
        ))}
      </select>

      {/* Lista de entregas */}
      {selectedGroup && (
        <>
          <h2>Entregas</h2>

          {submissions.length === 0 && (
            <p>No hay entregas.</p>
          )}

          {submissions.map(s => (
            <div key={s.submission_id} className="card">
              <h3>{s.assignment_title}</h3>
              <p>Estudiante: {s.student_name}</p>
              <p>Estado: {s.status}</p>

              <a href={s.file_url} download>
                Descargar archivo
              </a>

              {s.status !== "REVIEWED" && (
                <ReviewForm
                  submissionId={s.submission_id}
                  onSuccess={() => setSelectedGroup(selectedGroup)}
                />
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}

/* ---------- FORMULARIO DE CALIFICACIÓN ---------- */

function ReviewForm({ submissionId, onSuccess }) {
  const [grade, setGrade] = useState("");
  const [comment, setComment] = useState("");

  const token = localStorage.getItem("token");

  const submitReview = async (e) => {
    e.preventDefault();

    await fetch(
      `http://localhost:4000/assignments/submissions/${submissionId}/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ grade, comment })
      }
    );

    onSuccess();
  };

  return (
    <form onSubmit={submitReview}>
      <input
        type="number"
        placeholder="Nota"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        required
      />

      <textarea
        placeholder="Comentario"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button type="submit">Calificar</button>
    </form>
  );
}

export default TeacherDashboard;
