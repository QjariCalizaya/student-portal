import { useState } from "react";

function AddTopicButton({ courseGroupId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const createTopic = async () => {
    const title = prompt("Название темы:");
    if (!title) return;

    setLoading(true);

    await fetch("http://localhost:4000/topics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        course_group_id: courseGroupId,
        title
      })
    });

    setLoading(false);
    onSuccess();
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={createTopic} disabled={loading}>
        + Добавить тему
      </button>
    </div>
  );
}

export default AddTopicButton;
