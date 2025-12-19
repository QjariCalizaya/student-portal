function TeacherDashboard() {
  return (
    <div className="cards">
      <div className="card">
        <h2>Cursos impartidos</h2>
        <ul>
          <li>Programación</li>
          <li>Algoritmos</li>
        </ul>
      </div>

      <div className="card">
        <h2>Tareas pendientes</h2>
        <ul>
          <li>Algoritmos — 5 entregas</li>
        </ul>
      </div>

      <div className="card">
        <h2>Actividad reciente</h2>
        <p>3 tareas revisadas hoy</p>
      </div>
    </div>
  );
}

export default TeacherDashboard;
