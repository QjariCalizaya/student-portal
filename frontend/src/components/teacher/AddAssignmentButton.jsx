import { useState } from "react";

function AddAssignmentButton({ courseGroupId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const createAssignment = async () => {
    const title = prompt("Título de la tarea:");
    if (!title) return;

    const due_at = prompt("Fecha límite (YYYY-MM-DD):");
    if (!due_at) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          course_group_id: courseGroupId,
          title,
          due_at
        })
      });

      if (!res.ok) {
        throw new Error("Error al crear la tarea");
      }

      onSuccess?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={createAssignment} disabled={loading}>
      {loading ? "Creando..." : "+ Agregar tarea"}
    </button>
  );
}

export default AddAssignmentButton;
