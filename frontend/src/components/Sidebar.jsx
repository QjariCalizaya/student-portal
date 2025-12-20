import { useState } from "react";

function Sidebar({ role, courses = [], onSelectCourse }) {
  const [openCourses, setOpenCourses] = useState(false);

  return (
    <nav className="sidebar">
      <ul>
        {role === "STUDENT" ? (
          <>
            {/* DASHBOARD */}
            <li onClick={() => onSelectCourse(null)}>
              Dashboard
            </li>

            {/* CURSOS */}
            <li onClick={() => setOpenCourses(!openCourses)}>
              Cursos {openCourses ? "▲" : "▼"}
            </li>

            {openCourses &&
              courses.map((course) => (
                <li
                  key={course.course_group_id}
                  style={{ paddingLeft: "30px" }}
                  onClick={() => onSelectCourse(course.course_group_id)}
                >
                  {course.title}
                </li>
              ))}

            <li>Horario</li>
            <li>Tareas</li>
            <li>Calificaciones</li>
            <li>Biblioteca</li>
          </>
        ) : (
          <>
            <li>Dashboard</li>
            <li>Cursos</li>
            <li>Materiales</li>
            <li>Tareas</li>
            <li>Calificaciones</li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Sidebar;
