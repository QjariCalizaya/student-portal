import { useState } from "react";

function TopicCard({ topic, onReload }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(topic.topic_title);

  const [uploading, setUploading] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ---------- Editar título ----------
  const saveTitle = async () => {
    clearMessages();
    setSavingTitle(true);

    try {
      const res = await fetch(`http://localhost:4000/topics/${topic.topic_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar el título");
      }

      setEditing(false);
      setSuccess("Título actualizado");
      onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingTitle(false);
    }
  };

  // ---------- Subir archivo ----------
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
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al subir el archivo");
      }

      setSuccess("Archivo subido correctamente");
      onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      {/* Título */}
      {editing ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <button onClick={saveTitle} disabled={savingTitle}>
            {savingTitle ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={() => { setEditing(false); setTitle(topic.topic_title); }}>
            Cancelar
          </button>
        </div>
      ) : (
        <h2>{topic.topic_title}</h2>
      )}

      {/* Archivos */}
      <div style={{ marginTop: 10 }}>
        <strong>Archivos</strong>
        {topic.resources.length === 0 ? (
          <p style={{ opacity: 0.8 }}>(Sin archivos)</p>
        ) : (
          <ul>
            {topic.resources.map((r) => (
              <li key={r.resource_id}>
                <a href={r.file_url} download>
                  {r.resource_title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Acciones */}
      <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setEditing((v) => !v)}>
          ✏ Editar título
        </button>

        <label style={{ cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
          ➕ Agregar archivo
          <input
            type="file"
            hidden
            disabled={uploading}
            onChange={(e) => uploadFile(e.target.files?.[0])}
          />
        </label>
      </div>

      {/* Feedback */}
      {uploading && (
        <p style={{ color: "#2563eb", marginTop: 8 }}>
          Subiendo archivo...
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
