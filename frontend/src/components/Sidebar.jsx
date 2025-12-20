import { useState } from "react";

function Sidebar({ role, courses = [], onSelectCourse }) {
  const [openCourses, setOpenCourses] = useState(false);

  return (
    <nav className="sidebar">
      <ul>
        {/* DASHBOARD */}
        <li onClick={() => onSelectCourse(null)}>
          Dashboard
        </li>

        {/* CURSOS */}
        <li onClick={() => setOpenCourses(!openCourses)}>
          Cursos {openCourses ? "▲" : "▼"}
        </li>

        {openCourses && courses.length === 0 && (
          <li style={{ paddingLeft: "30px", opacity: 0.7 }}>
            (Sin cursos)
          </li>
        )}

        {openCourses &&
          courses.map(course => (
            <li
              key={course.course_group_id ?? course.id}
              style={{ paddingLeft: "30px" }}
              onClick={() =>
                onSelectCourse(
                  course.course_group_id ?? course.id
                )
              }
            >
              {course.title}
              {course.group_name
                ? ` – ${course.group_name}`
                : ""}
            </li>
          ))}

        {/* OPCIONES EXTRA */}
        {role === "STUDENT" && (
          <>
            <li>Horario</li>
            <li>Tareas</li>
            <li>Calificaciones</li>
            <li>Biblioteca</li>
          </>
        )}

        {role === "TEACHER" && (
          <>
            <li>Horario</li>
            <li>Entregas</li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Sidebar;
