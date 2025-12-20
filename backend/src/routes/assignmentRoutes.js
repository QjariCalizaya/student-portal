import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  getAssignmentsByCourseGroup,
  submitAssignment
} from "../controllers/assignmentsController.js";
import { uploadSubmission } from "../middlewares/uploadMiddleware.js";

import {
  getSubmissionsByCourseGroup,
  reviewSubmission
} from "../controllers/assignmentsController.js";

import { createAssignment } from "../controllers/assignmentsController.js";


const router = express.Router();

router.get(
  "/course/:courseGroupId",
  authenticate,
  authorize(["STUDENT", "TEACHER"]),
  getAssignmentsByCourseGroup
);

router.post(
  "/:assignmentId/submit",
  authenticate,
  authorize("STUDENT"),
  uploadSubmission.single("file"),
  submitAssignment
);

router.get(
  "/submissions/course/:courseGroupId",
  authenticate,
  authorize("TEACHER"),
  getSubmissionsByCourseGroup
);

router.post(
  "/submissions/:submissionId/review",
  authenticate,
  authorize("TEACHER"),
  reviewSubmission
);

router.post(
  "/",
  authenticate,
  authorize("TEACHER"),
  createAssignment
);


export default router;

