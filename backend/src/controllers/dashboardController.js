import pool from "../config/db.js";

export const getTomorrowAssignments = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.title,
        a.due_at,
        c.title AS course
      FROM assignments a
      JOIN course_groups cg ON a.course_group_id = cg.id
      JOIN courses c ON cg.course_id = c.id
      JOIN enrollments e ON e.course_group_id = cg.id
      WHERE e.student_id = $1
        AND DATE(a.due_at) = CURRENT_DATE + INTERVAL '1 day'
      ORDER BY a.due_at
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Assignments error:", err.message, err.code);
    res.status(500).json({ error: "Failed to load assignments" });
  }
};

export const getCourseAverage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseGroupId } = req.params;

    const result = await pool.query(
      `
      SELECT COALESCE(AVG(g.points), 0) AS average
      FROM grades g
      JOIN gradebook_items gi ON g.gradebook_item_id = gi.id
      WHERE g.student_id = $1
        AND gi.course_group_id = $2
      `,
      [userId, courseGroupId]
    );

    res.json({
      average: Number(result.rows[0].average)
    });
  } catch (err) {
    console.error("Course average error:", err.message, err.code);
    res.status(500).json({ error: "Failed to calculate course average" });
  }
};

export const getGlobalAverage = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT COALESCE(ROUND(AVG(g.points)::numeric, 2), 0) AS average
      FROM grades g
      WHERE g.student_id = $1
      `,
      [userId]
    );

    // pg suele devolver numeric como string, así que lo convertimos

    const avg = Number(result.rows[0]?.average ?? 0);

    res.json({ average: avg });
  } catch (err) {
    console.error("Average error:", err);
    res.status(500).json({ error: "Failed to calculate average" });
  }
};


export const getTodaySchedule = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        s.start_time,
        s.end_time,
        c.title AS course
      FROM schedule_items s
      JOIN course_groups cg ON s.course_group_id = cg.id
      JOIN courses c ON cg.course_id = c.id
      JOIN enrollments e ON e.course_group_id = cg.id
      WHERE e.student_id = $1
        AND s.weekday = EXTRACT(ISODOW FROM CURRENT_DATE)
      ORDER BY s.start_time
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Schedule error:", err.message, err.code);
    res.status(500).json({ error: "Failed to load schedule" });
  }
};


export const getTeacherTodaySchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        s.start_time,
        s.end_time,
        c.title AS course,
        cg.name AS group_name
      FROM schedule_items s
      JOIN course_groups cg ON s.course_group_id = cg.id
      JOIN courses c ON cg.course_id = c.id
      WHERE cg.teacher_id = $1
        AND s.weekday = EXTRACT(ISODOW FROM CURRENT_DATE)
      ORDER BY s.start_time
      `,
      [teacherId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Teacher schedule error:", err);
    res.status(500).json({ error: "Failed to load teacher schedule" });
  }
};

export const getWeeklySchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let result;

    if (role === "STUDENT") {
      result = await pool.query(
        `
        SELECT
          s.weekday,
          s.start_time,
          s.end_time,
          c.title AS course,
          cg.name AS group_name
        FROM schedule_items s
        JOIN course_groups cg ON s.course_group_id = cg.id
        JOIN courses c ON cg.course_id = c.id
        JOIN enrollments e ON e.course_group_id = cg.id
        WHERE e.student_id = $1
        ORDER BY s.weekday, s.start_time
        `,
        [userId]
      );
    } else if (role === "TEACHER") {
      result = await pool.query(
        `
        SELECT
          s.weekday,
          s.start_time,
          s.end_time,
          c.title AS course,
          cg.name AS group_name
        FROM schedule_items s
        JOIN course_groups cg ON s.course_group_id = cg.id
        JOIN courses c ON cg.course_id = c.id
        WHERE cg.teacher_id = $1
        ORDER BY s.weekday, s.start_time
        `,
        [userId]
      );
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Weekly schedule error:", err);
    res.status(500).json({ error: "Failed to load schedule" });
  }
};
