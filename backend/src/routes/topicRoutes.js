import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  createTopic,
  updateTopicTitle,
  addResourceToTopic,
  uploadMaterial
} from "../controllers/topicsController.js";
import { deleteResource, deleteTopic } from "../controllers/topicsController.js";


const router = express.Router();

router.post("/", authenticate, authorize("TEACHER"), createTopic);
router.put("/:topicId", authenticate, authorize("TEACHER"), updateTopicTitle);
router.post(
  "/:topicId/resources",
  authenticate,
  authorize("TEACHER"),
  uploadMaterial.single("file"),
  addResourceToTopic
);
router.delete(
  "/resources/:resourceId",
  authenticate,
  authorize("TEACHER"),
  deleteResource
);

router.delete(
  "/:topicId",
  authenticate,
  authorize("TEACHER"),
  deleteTopic
);


export default router;
