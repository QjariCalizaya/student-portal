import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getTomorrowAssignments,
  getGlobalAverage,
  getTodaySchedule,
  getCourseAverage
} from "../controllers/dashboardController.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import { getTeacherTodaySchedule } from "../controllers/dashboardController.js";
import { getWeeklySchedule } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/assignments/tomorrow", authenticate, getTomorrowAssignments);
router.get("/average", authenticate, getGlobalAverage);
router.get("/schedule/today", authenticate, getTodaySchedule);
router.get(
  "/courses/:courseGroupId/average",
  authenticate,
  getCourseAverage
);
router.get(
  "/teacher/schedule/today",
  authenticate,
  authorize("TEACHER"),
  getTeacherTodaySchedule
);

router.get(
  "/schedule/week",
  authenticate,
  getWeeklySchedule
);


export default router;
