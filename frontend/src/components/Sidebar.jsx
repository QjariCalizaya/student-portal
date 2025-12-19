function Sidebar({ role }) {
  return (
    <nav className="sidebar">
      <ul>
        <li className="active">Dashboard</li>
        <li>Cursos</li>
        <li>Horario</li>
        <li>Tareas</li>

        {role === "STUDENT" && (
          <>
            <li>Calificaciones</li>
            <li>Biblioteca</li>
            <li>Perfil</li>
          </>
        )}

        {role === "TEACHER" && (
          <>
            <li>Materiales</li>
            <li>Revisar tareas</li>
            <li>Calificaciones</li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Sidebar;
