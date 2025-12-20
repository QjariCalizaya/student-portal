import pool from "../config/db.js";

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
import path from "path";

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
