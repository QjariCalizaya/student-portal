import { useEffect, useState, useCallback } from "react";
import TopicCard from "./TopicCard";
import AddTopicButton from "./AddTopicButton";
import AddAssignmentButton from "./AddAssignmentButton";

function groupTopics(rows) {
  const map = new Map();

  for (const r of rows) {
    if (!map.has(r.topic_id)) {
      map.set(r.topic_id, {
        topic_id: r.topic_id,
        topic_title: r.topic_title,
        resources: []
      });
    }

    if (r.resource_id) {
      map.get(r.topic_id).resources.push({
        resource_id: r.resource_id,
        resource_title: r.resource_title,
        file_url: r.file_url,
        resource_type: r.resource_type
      });
    }
  }

  return Array.from(map.values());
}

function TeacherCourseView({ courseGroupId, onBack }) {
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ==========================
  // Загрузка тем
  // ==========================
  const reloadTopics = useCallback(() => {
    setLoading(true);
    setError("");

    fetch(`http://localhost:4000/courses/${courseGroupId}/topics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Ошибка при загрузке тем");
        }
        return res.json();
      })
      .then(rows => setTopics(groupTopics(rows)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseGroupId, token]);

  // ==========================
  // Загрузка заданий
  // ==========================
  const loadAssignments = useCallback(() => {
    fetch(`http://localhost:4000/assignments/course/${courseGroupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAssignments)
      .catch(() => setAssignments([]));
  }, [courseGroupId, token]);

  // ==========================
  // Инициализация
  // ==========================
  useEffect(() => {
    reloadTopics();
    loadAssignments();
  }, [reloadTopics, loadAssignments]);

  return (
    <>
      <button onClick={onBack}>← Назад</button>

      {/* ==========================
          ЗАДАНИЯ
      ========================== */}
      <h1>Задания курса</h1>

      {assignments.length === 0 ? (
        <p>Задания не созданы.</p>
      ) : (
        <ul>
          {assignments.map(a => (
            <li key={a.id}>
              <strong>{a.title}</strong>{" "}
              <span style={{ opacity: 0.7 }}>
                (срок до {new Date(a.due_at).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ul>
      )}

      <AddAssignmentButton
        courseGroupId={courseGroupId}
        onSuccess={loadAssignments}
      />

      <hr style={{ margin: "30px 0" }} />

      {/* ==========================
          ТЕМЫ
      ========================== */}
      <h1>Темы курса</h1>

      {loading && <p>Загрузка тем...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {!loading && !error && topics.length === 0 && (
        <p>Темы не созданы.</p>
      )}

      {topics.map(topic => (
        <TopicCard
          key={topic.topic_id}
          topic={topic}
          onReload={reloadTopics}
        />
      ))}

      <AddTopicButton
        courseGroupId={courseGroupId}
        onSuccess={reloadTopics}
      />
    </>
  );
}

export default TeacherCourseView;
