function StudentDashboard() {
  return (
    <div className="cards">
      <div className="card">
        <h2>Cursos inscritos</h2>
        <ul>
          <li>Matemática</li>
          <li>Programación</li>
          <li>Física</li>
        </ul>
      </div>

      <div className="card">
        <h2>Próximas tareas</h2>
        <ul>
          <li>Algoritmos — <span>20/09</span></li>
          <li>Física I — <span>22/09</span></li>
        </ul>
      </div>

      <div className="card">
        <h2>Resumen académico</h2>
        <p className="highlight">Promedio actual: 8.6</p>
      </div>

      <div className="card">
        <h2>Horario de hoy</h2>
        <ul>
          <li>10:00 – Matemática</li>
          <li>14:00 – Programación</li>
        </ul>
      </div>
    </div>
  );
}

export default StudentDashboard;
