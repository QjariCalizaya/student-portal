import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import { authenticate } from "./middlewares/authMiddleware.js";
import { authorize } from "./middlewares/roleMiddleware.js";

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


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
