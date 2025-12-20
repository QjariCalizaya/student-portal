import { useState } from "react";

function AssignmentSubmitForm({ assignmentId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://localhost:4000/assignments/${assignmentId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка при загрузке задания");
      }

      setFile(null);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        required
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Загрузка..." : "Отправить задание"}
      </button>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
}

export default AssignmentSubmitForm;
