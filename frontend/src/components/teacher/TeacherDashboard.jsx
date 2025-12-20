import { useEffect, useState } from "react";
import TeacherCourseView from "./TeacherCourseView";

function TeacherDashboard({ selectedCourseId, setSelectedCourseId }) {
  if (!selectedCourseId) {
    return (
      <>
        <h1>Dashboard del profesor</h1>
        <p>Resumen general</p>

        <div className="cards">
          <div className="card">
            <h2>Tareas pendientes</h2>
            <p>Por revisar</p>
          </div>

          <div className="card">
            <h2>Horario de hoy</h2>
            <p>Ver clases programadas</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <TeacherCourseView
      courseGroupId={selectedCourseId}
      onBack={() => setSelectedCourseId(null)}
    />
  );
}

export default TeacherDashboard;
