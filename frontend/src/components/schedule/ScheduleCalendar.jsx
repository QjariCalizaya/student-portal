import { useEffect, useState } from "react";

const days = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье"
];

function ScheduleCalendar() {
  const [schedule, setSchedule] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:4000/dashboard/schedule/week", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSchedule)
      .catch(() => setSchedule([]));
  }, [token]);

  const byDay = (day) =>
    schedule.filter(s => s.weekday === day);

  return (
    <div className="card">
      <h2>Еженедельное расписание</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>День</th>
            <th>Занятия</th>
          </tr>
        </thead>
        <tbody>
          {days.map((dayName, index) => {
            const day = index + 1;
            const items = byDay(day);

            return (
              <tr key={day}>
                <td style={{ fontWeight: "bold", verticalAlign: "top" }}>
                  {dayName}
                </td>
                <td>
                  {items.length === 0 ? (
                    <span>—</span>
                  ) : (
                    <ul>
                      {items.map((i, idx) => (
                        <li key={idx}>
                          {i.start_time}–{i.end_time}{" "}
                          <strong>{i.course}</strong>{" "}
                          ({i.group_name})
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleCalendar;
