import { useEffect, useState, useCallback } from "react";
import TopicCard from "./TopicCard";
import AddTopicButton from "./AddTopicButton";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const reloadTopics = useCallback(() => {
    setLoading(true);
    setError("");

    fetch(`http://localhost:4000/courses/${courseGroupId}/topics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load topics");
        }
        return res.json();
      })
      .then((rows) => {
        setTopics(groupTopics(rows));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseGroupId, token]);

  useEffect(() => {
    reloadTopics();
  }, [reloadTopics]);

  return (
    <>
      <button onClick={onBack}>← Volver</button>

      <h1>Temas del curso</h1>

      {loading && <p>Cargando temas...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {!loading && !error && topics.length === 0 && (
        <p>No hay temas creados.</p>
      )}

      {topics.map((topic) => (
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
