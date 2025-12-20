import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import { authenticate } from "./middlewares/authMiddleware.js";
import { authorize } from "./middlewares/roleMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
const app = express();

// Seguridad básica
app.use(helmet());


// CORS
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Parsing JSON
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/courses", courseRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/assignments", assignmentRoutes);
app.use("/topics", topicRoutes);
//app.use("/uploads", express.static("uploads"));



// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend secure and running" });
});
/* app.get(
  "/protected",
  authenticate,
  authorize(["TEACHER", "ADMIN"]),
  (req, res) => {
    res.json({ message: "Protected content", user: req.user });
  }
);
 */

app.get("/protected", authenticate, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});


// SOLO STUDENT
app.get(
  "/student-area",
  authenticate,
  authorize(["STUDENT"]),
  (req, res) => {
    res.json({ message: "Welcome STUDENT", user: req.user });
  }
);

// SOLO TEACHER
app.get(
  "/teacher-area",
  authenticate,
  authorize(["TEACHER"]),
  (req, res) => {
    res.json({ message: "Welcome TEACHER", user: req.user });
  }
);

// SOLO ADMIN
app.get(
  "/admin-area",
  authenticate,
  authorize(["ADMIN"]),
  (req, res) => {
    res.json({ message: "Welcome ADMIN", user: req.user });
  }
);

app.get(
  "/staff-area",
  authenticate,
  authorize(["TEACHER", "ADMIN"]),
  (req, res) => {
    res.json({ message: "Welcome STAFF", user: req.user });
  }
);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});


