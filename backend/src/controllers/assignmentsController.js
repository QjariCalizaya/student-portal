import pool from "../config/db.js";

export const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assignmentId } = req.params;

    // comprobar si ya fue revisada
    const existing = await pool.query(
      `
      SELECT status FROM submissions
      WHERE assignment_id = $1 AND student_id = $2
      `,
      [assignmentId, studentId]
    );

    if (existing.rows[0]?.status === "REVIEWED") {
      return res.status(400).json({
        error: "Assignment already reviewed"
      });
    }

    const fileUrl = `/uploads/submissions/${req.file.filename}`;

    await pool.query(
      `
      INSERT INTO submissions (assignment_id, student_id, file_url)
      VALUES ($1, $2, $3)
      ON CONFLICT (assignment_id, student_id)
      DO UPDATE SET
        file_url = EXCLUDED.file_url,
        submitted_at = NOW(),
        status = 'SUBMITTED'
      `,
      [assignmentId, studentId, fileUrl]
    );

    res.json({ message: "Submission uploaded" });
  } catch (err) {
    console.error("Submit error:", err.message);
    res.status(500).json({ error: "Failed to submit assignment" });
  }
};

export const getAssignmentsByCourseGroup = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courseGroupId = Number(req.params.courseGroupId);

    if (isNaN(courseGroupId)) {
      return res.status(400).json({ error: "Invalid course group id" });
    }

    const result = await pool.query(

      `
      SELECT
        a.id,
        a.title,
        a.due_at,
        COALESCE(s.status, 'PENDING') AS submission_status
      FROM assignments a
      INNER JOIN enrollments e
        ON e.course_group_id = a.course_group_id
       AND e.student_id = $1
      LEFT JOIN submissions s
        ON s.assignment_id = a.id
       AND s.student_id = $1
      WHERE a.course_group_id = $2
      ORDER BY a.due_at
      `,

      [studentId, courseGroupId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Assignments list error:", err);
    res.status(500).json({ error: "Failed to load assignments" });
  }
};

export const getSubmissionsByCourseGroup = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseGroupId } = req.params;

    const result = await pool.query(
      `
      SELECT
        s.id AS submission_id,
        u.name AS student_name,
        a.title AS assignment_title,
        s.file_url,
        s.submitted_at,
        s.status
      FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN course_groups cg ON cg.id = a.course_group_id
      JOIN users u ON u.id = s.student_id
      WHERE cg.id = $1
        AND cg.teacher_id = $2
      ORDER BY s.submitted_at DESC
      `,
      [courseGroupId, teacherId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get submissions error:", err);
    res.status(500).json({ error: "Failed to load submissions" });
  }
};

/**
 * Calificar entrega
 */
export const reviewSubmission = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { submissionId } = req.params;
    const { grade, comment } = req.body;

    await pool.query(
      `
      INSERT INTO reviews (submission_id, teacher_id, grade, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (submission_id)
      DO UPDATE SET
        grade = EXCLUDED.grade,
        comment = EXCLUDED.comment,
        reviewed_at = NOW()
      `,
      [submissionId, teacherId, grade, comment]
    );

    await pool.query(
      `
      UPDATE submissions
      SET status = 'REVIEWED'
      WHERE id = $1
      `,
      [submissionId]
    );

    res.json({ message: "Submission reviewed" });
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ error: "Failed to review submission" });
  }
};