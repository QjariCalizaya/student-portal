import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  getMyCourses,
  getCourseSummary,
  getCourseTopics,
  getTeacherCourseGroups
} from "../controllers/coursesController.js";




const router = express.Router();

router.get("/my", authenticate, getMyCourses);
router.get("/:courseGroupId/summary", authenticate, getCourseSummary);
router.get("/:courseGroupId/topics", authenticate, getCourseTopics);

router.get(
  "/teacher",
  authenticate,
  authorize("TEACHER"),
  getTeacherCourseGroups
);


export default router;
