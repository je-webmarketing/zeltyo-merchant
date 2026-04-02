import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import notificationsRouter from "./routes/notifications.js";
import automationRoutes from "./routes/automation.js";
import clientsRouter from "./routes/clients.js";
import automationSegmentedRouter from "./routes/automationSegmented.js";

dotenv.config();

const app = express();

console.log("✅ ZELTYO BACKEND V2 chargé");

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Zeltyo backend OK",
    version: "V2_SEGMENTS",
  });
});

app.use("/notifications", notificationsRouter);
app.use("/automation", automationRoutes);
app.use("/clients", clientsRouter);
app.use("/automation-segmented", automationSegmentedRouter);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`✅ Backend lancé sur http://localhost:${port}`);
});