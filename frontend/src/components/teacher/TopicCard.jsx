import { useState } from "react";
import { downloadFile } from "../../utils/downloadFile";

function TopicCard({ topic, onReload }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(topic.topic_title);

  const [uploading, setUploading] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ==========================
  // ✏️ РЕДАКТИРОВАТЬ НАЗВАНИЕ
  // ==========================
  const saveTitle = async () => {
    clearMessages();
    setSavingTitle(true);

    try {
      const res = await fetch(
        `http://localhost:4000/topics/${topic.topic_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title })
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка при обновлении названия");
      }

      setEditing(false);
      setSuccess("Название обновлено");
      onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingTitle(false);
    }
  };

  // ==========================
  // ➕ ЗАГРУЗИТЬ ФАЙЛ
  // ==========================
  const uploadFile = async (file) => {
    if (!file) return;

    clearMessages();
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://localhost:4000/topics/${topic.topic_id}/resources`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка при загрузке файла");
      }

      setSuccess("Файл успешно загружен");
      onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  // ==========================
  // 🗑️ УДАЛИТЬ ФАЙЛ
  // ==========================
  const deleteResource = async (resourceId) => {
    if (!confirm("Удалить этот файл?")) return;

    clearMessages();

    try {
      const res = await fetch(
        `http://localhost:4000/topics/resources/${resourceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка при удалении файла");
      }

      setSuccess("Файл удалён");
      onReload();
    } catch (e) {
      setError(e.message);
    }
  };

  // ==========================
  // 🗑️ УДАЛИТЬ ТЕМУ
  // ==========================
  const deleteTopic = async () => {
    if (!confirm("Удалить эту тему и все её файлы?")) return;

    clearMessages();
    setDeleting(true);

    try {
      const res = await fetch(
        `http://localhost:4000/topics/${topic.topic_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка при удалении темы");
      }

      onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const downloadFile = async (resourceId, filename) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:4000/topics/resources/${resourceId}/download`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      {/* ==========================
          НАЗВАНИЕ
      ========================== */}
      {editing ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={saveTitle} disabled={savingTitle}>
            {savingTitle ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setTitle(topic.topic_title);
            }}
          >
            Отмена
          </button>
        </div>
      ) : (
        <h2>{topic.topic_title}</h2>
      )}

      {/* ==========================
          ФАЙЛЫ
      ========================== */}
      <div style={{ marginTop: 10 }}>
        <strong>Файлы</strong>

        {topic.resources.length === 0 ? (
          <p style={{ opacity: 0.8 }}>(Файлы отсутствуют)</p>
        ) : (
          <ul>
            {topic.resources.map((r) => (
              <li key={r.resource_id}>
                <span
                  onClick={() =>
                    downloadFile(r.resource_id, r.resource_title)
                  }
                  style={{
                    cursor: "pointer",
                    color: "#2563eb",
                    textDecoration: "underline"
                  }}
                >
                  {r.resource_title}
                </span>

                <button
                  style={{ marginLeft: 10 }}
                  onClick={() => deleteResource(r.resource_id)}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ==========================
          ДЕЙСТВИЯ
      ========================== */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <button onClick={() => setEditing((v) => !v)}>
          ✏ Редактировать название
        </button>

        <label
          style={{
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1
          }}
        >
          ➕ Добавить файл
          <input
            type="file"
            hidden
            disabled={uploading}
            onChange={(e) => uploadFile(e.target.files?.[0])}
          />
        </label>

        <button
          onClick={deleteTopic}
          disabled={deleting}
          style={{
            backgroundColor: "#dc2626",
            color: "white"
          }}
        >
          {deleting ? "Удаление..." : "🗑 Удалить тему"}
        </button>
      </div>

      {/* ==========================
          УВЕДОМЛЕНИЯ
      ========================== */}
      {uploading && (
        <p style={{ color: "#2563eb", marginTop: 8 }}>
          Загрузка файла...
        </p>
      )}

      {success && (
        <p style={{ color: "#16a34a", marginTop: 8 }}>
          {success}
        </p>
      )}

      {error && (
        <p style={{ color: "#dc2626", marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default TopicCard;
