const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const mockData = {
  Lunes: [
    { time: "08:00 - 09:30", course: "Matemática", room: "A-101" },
    { time: "10:00 - 11:30", course: "Física", room: "B-202" }
  ],
  Martes: [
    { time: "09:00 - 10:30", course: "Programación", room: "Lab 1" }
  ],
  Miércoles: [],
  Jueves: [
    { time: "14:00 - 15:30", course: "Bases de Datos", room: "C-303" }
  ],
  Viernes: [
    { time: "08:00 - 09:30", course: "Redes", room: "A-101" }
  ]
};

function MockScheduleCalendar() {
  return (
    <>
      <h1>Horario</h1>

      {days.map(day => (
        <div key={day} className="card">
          <h3>{day}</h3>

          {mockData[day].length === 0 ? (
            <p>Sin clases</p>
          ) : (
            <ul>
              {mockData[day].map((c, i) => (
                <li key={i}>
                  <strong>{c.time}</strong> — {c.course} ({c.room})
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}

export default MockScheduleCalendar;
