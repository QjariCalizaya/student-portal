import { useState } from "react";

function Sidebar({
  role,
  courses = [],
  onSelectCourse,
  onSelectSchedule
}) {
  const [openCourses, setOpenCourses] = useState(false);

  return (
    <nav className="sidebar">
      <ul>
        {/* DASHBOARD */}
        <li
          onClick={() => {
            onSelectCourse(null);
          }}
        >
          Панель управления
        </li>

        {/* КУРСЫ */}
        <li onClick={() => setOpenCourses(!openCourses)}>
          Курсы {openCourses ? "▲" : "▼"}
        </li>

        {openCourses && courses.length === 0 && (
          <li style={{ paddingLeft: "30px", opacity: 0.7 }}>
            (Курсы отсутствуют)
          </li>
        )}

        {openCourses &&
          courses.map(course => (
            <li
              key={course.course_group_id ?? course.id}
              style={{ paddingLeft: "30px" }}
              onClick={() =>
                onSelectCourse(course.course_group_id ?? course.id)
              }
            >
              {course.title}
              {course.group_name ? ` – ${course.group_name}` : ""}
            </li>
          ))}

        {/* ДОПОЛНИТЕЛЬНЫЕ ОПЦИИ */}
        {role === "STUDENT" && (
          <>
            <li
              onClick={() => {
                onSelectCourse(null);
                onSelectSchedule();
              }}
            >
              Расписание
            </li>
            <li>Задания</li>
            <li>Оценки</li>
            <li>Библиотека</li>
          </>
        )}

        {role === "TEACHER" && (
          <>
            <li
              onClick={() => {
                onSelectCourse(null);
                onSelectSchedule();
              }}
            >
              Расписание
            </li>
            <li>Работы</li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Sidebar;
