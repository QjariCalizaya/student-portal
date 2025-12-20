const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];

const mockData = {
  Понедельник: [
    { time: "08:00 - 09:30", course: "Математика", room: "A-101" },
    { time: "10:00 - 11:30", course: "Физика", room: "B-202" }
  ],
  Вторник: [
    { time: "09:00 - 10:30", course: "Программирование", room: "Лаборатория 1" }
  ],
  Среда: [],
  Четверг: [
    { time: "14:00 - 15:30", course: "Базы данных", room: "C-303" }
  ],
  Пятница: [
    { time: "08:00 - 09:30", course: "Компьютерные сети", room: "A-101" }
  ]
};

function MockScheduleCalendar() {
  return (
    <>
      <h1>Расписание</h1>

      {days.map(day => (
        <div key={day} className="card">
          <h3>{day}</h3>

          {mockData[day].length === 0 ? (
            <p>Занятий нет</p>
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
