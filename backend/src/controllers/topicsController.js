import pool from "../config/db.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MATERIALS_DIR = path.join(__dirname, "../../uploads/materials");



export const createTopic = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { course_group_id, title } = req.body;

    // verificar que el profesor enseña este grupo
    const check = await pool.query(
      `
      SELECT 1 FROM course_groups
      WHERE id = $1 AND teacher_id = $2
      `,
      [course_group_id, teacherId]
    );

    if (check.rowCount === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const result = await pool.query(
      `
      INSERT INTO course_topics (course_group_id, title)
      VALUES ($1, $2)
      RETURNING *
      `,
      [course_group_id, title]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create topic error:", err);
    res.status(500).json({ error: "Failed to create topic" });
  }
};


export const updateTopicTitle = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { topicId } = req.params;
    const { title } = req.body;

    await pool.query(
      `
      UPDATE course_topics t
      SET title = $1
      FROM course_groups cg
      WHERE t.id = $2
        AND t.course_group_id = cg.id
        AND cg.teacher_id = $3
      `,
      [title, topicId, teacherId]
    );

    res.json({ message: "Topic updated" });
  } catch (err) {
    console.error("Update topic error:", err);
    res.status(500).json({ error: "Failed to update topic" });
  }
};


import multer from "multer";


const storage = multer.diskStorage({
  destination: "uploads/materials",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

export const uploadMaterial = multer({ storage });

export const addResourceToTopic = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { topicId } = req.params;

    const fileUrl = `/uploads/materials/${req.file.filename}`;

    await pool.query(
      `
      INSERT INTO topic_resources (topic_id, title, file_url)
      SELECT t.id, $1, $2
      FROM course_topics t
      JOIN course_groups cg ON cg.id = t.course_group_id
      WHERE t.id = $3 AND cg.teacher_id = $4
      `,
      [req.file.originalname, fileUrl, topicId, teacherId]
    );

    res.json({ message: "File uploaded" });
  } catch (err) {
    console.error("Upload resource error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export const deleteResource = async (req, res) => {
  const { resourceId } = req.params;
  const teacherId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT tr.file_url
      FROM topic_resources tr
      JOIN course_topics ct ON ct.id = tr.topic_id
      JOIN course_groups cg ON cg.id = ct.course_group_id
      WHERE tr.id = $1 AND cg.teacher_id = $2
      `,
      [resourceId, teacherId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Recurso no encontrado o sin permisos" });
    }

    const fileUrl = result.rows[0].file_url;
    const filename = path.basename(fileUrl);
    const filePath = path.join(MATERIALS_DIR, filename);

    await pool.query("DELETE FROM topic_resources WHERE id = $1", [resourceId]);

    try {
      await fs.unlink(filePath);
    } catch {
      // si el archivo no existe, no rompemos nada
    }

    res.json({ message: "Archivo eliminado correctamente" });
  } catch (err) {
    console.error("Delete resource error:", err);
    res.status(500).json({ error: "Failed to delete resource" });
  }
};

export const deleteTopic = async (req, res) => {
  const { topicId } = req.params;
  const teacherId = req.user.id;

  try {
    // traer archivos del tema
    const files = await pool.query(
      `
      SELECT tr.file_url
      FROM topic_resources tr
      JOIN course_topics ct ON ct.id = tr.topic_id
      JOIN course_groups cg ON cg.id = ct.course_group_id
      WHERE ct.id = $1 AND cg.teacher_id = $2
      `,
      [topicId, teacherId]
    );

    // validar ownership del tema
    const check = await pool.query(
      `
      SELECT 1
      FROM course_topics ct
      JOIN course_groups cg ON cg.id = ct.course_group_id
      WHERE ct.id = $1 AND cg.teacher_id = $2
      `,
      [topicId, teacherId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Tema no encontrado o sin permisos" });
    }

    // borrar tema (DB)
    await pool.query("DELETE FROM course_topics WHERE id = $1", [topicId]);

    // borrar archivos físicos
    for (const row of files.rows) {
      const filename = path.basename(row.file_url);
      const filePath = path.join(MATERIALS_DIR, filename);
      try {
        await fs.unlink(filePath);
      } catch {}
    }

    res.json({ message: "Tema eliminado correctamente" });
  } catch (err) {
    console.error("Delete topic error:", err);
    res.status(500).json({ error: "Failed to delete topic" });
  }
};



export const downloadResource = async (req, res) => {
  const { resourceId } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    let result;

    // ======================
    // TEACHER
    // ======================
    if (role === "TEACHER") {
      result = await pool.query(
        `
        SELECT tr.file_url
        FROM topic_resources tr
        JOIN course_topics ct ON ct.id = tr.topic_id
        JOIN course_groups cg ON cg.id = ct.course_group_id
        WHERE tr.id = $1
          AND cg.teacher_id = $2
        `,
        [resourceId, userId]
      );
    }

    // ======================
    // STUDENT
    // ======================
    else if (role === "STUDENT") {
      result = await pool.query(
        `
        SELECT tr.file_url
        FROM topic_resources tr
        JOIN course_topics ct ON ct.id = tr.topic_id
        JOIN enrollments e ON e.course_group_id = ct.course_group_id
        WHERE tr.id = $1
          AND e.student_id = $2
        `,
        [resourceId, userId]
      );
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!result || result.rowCount === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const fileUrl = result.rows[0].file_url;
    const filename = path.basename(fileUrl);
    const filePath = path.join(MATERIALS_DIR, filename);

    // ✅ VALIDAR EXISTENCIA (forma correcta con fs/promises)
    try {
      await fs.access(filePath);
    } catch {
      console.error("File not found on disk:", filePath);
      return res.status(404).json({ error: "File not found on server" });
    }

    // ✅ DESCARGA
    res.download(filePath);
  } catch (err) {
    console.error("DOWNLOAD RESOURCE ERROR:", err);
    res.status(500).json({ error: "Failed to download file" });
  }
};
