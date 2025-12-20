import pool from "../config/db.js";

export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        cg.id AS course_group_id,
        c.title,
        cg.name AS group_name,
        u.name AS teacher
      FROM enrollments e
      JOIN course_groups cg ON e.course_group_id = cg.id
      JOIN courses c ON cg.course_id = c.id
      JOIN users u ON cg.teacher_id = u.id
      WHERE e.student_id = $1
        AND cg.is_active = true
      ORDER BY c.title
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get courses error:", err.message);
    res.status(500).json({ error: "Failed to load courses" });
  }
};

export const getCourseSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseGroupId } = req.params;

    const result = await pool.query(
      `
        SELECT
        c.title,
        COUNT(a.id) FILTER (
            WHERE a.due_at >= NOW()
            AND s.id IS NULL
        ) AS pending_assignments,
        COALESCE(AVG(g.points), 0) AS average
        FROM course_groups cg
        JOIN courses c ON cg.course_id = c.id
        LEFT JOIN assignments a ON a.course_group_id = cg.id
        LEFT JOIN submissions s
        ON s.assignment_id = a.id
        AND s.student_id = $1
        LEFT JOIN gradebook_items gi ON gi.course_group_id = cg.id
        LEFT JOIN grades g
        ON g.gradebook_item_id = gi.id
        AND g.student_id = $1
        WHERE cg.id = $2
        GROUP BY c.title;
      `,
      [userId, courseGroupId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Course summary error:", err.message);
    res.status(500).json({ error: "Failed to load course summary" });
  }
};

export const getCourseTopics = async (req, res) => {
  try {
    const { courseGroupId } = req.params;

    const result = await pool.query(
      `
      SELECT
        t.id AS topic_id,
        t.title AS topic_title,
        r.id AS resource_id,
        r.title AS resource_title,
        r.file_url,
        r.resource_type
      FROM course_topics t
      LEFT JOIN topic_resources r ON r.topic_id = t.id
      WHERE t.course_group_id = $1
      ORDER BY t.position, t.created_at
      `,
      [courseGroupId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Topics error:", err.message);
    res.status(500).json({ error: "Failed to load topics" });
  }
};


export const getTeacherCourseGroups = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        cg.id,
        c.title,
        cg.name AS group_name
      FROM course_groups cg
      JOIN courses c ON cg.course_id = c.id
      WHERE cg.teacher_id = $1
      ORDER BY c.title
      `,
      [teacherId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Teacher courses error:", err);
    res.status(500).json({ error: "Failed to load courses" });
  }
};
