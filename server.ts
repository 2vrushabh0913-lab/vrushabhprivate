import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./lib/db";
import Notification, { INotification } from "./models/Notification";
import SeatingArrangement from "./models/SeatingArrangement";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Connect to MongoDB
  await connectDB();
  console.log("Connected to MongoDB Atlas");

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Seed default notifications if collection is empty
  const seedNotifications = async () => {
    try {
      const count = await Notification.countDocuments();
      if (count === 0) {
        const defaults = [
          {
            id: "1",
            from: "System",
            type: "Utility",
            time: "11:42 AM",
            msg: "Server maintenance scheduled for 10:00 PM tonight.",
            priority: false,
            targetType: "division",
            targetId: "All",
            createdAt: Date.now() - (3600000 * 5)
          },
          {
            id: "2",
            from: "Dr. S. N. Mali",
            type: "Urgent",
            time: "09:15 AM",
            msg: "All Div A Calculus students report to A021 at 04:30 PM.",
            priority: true,
            targetType: "division",
            targetId: "A",
            createdAt: Date.now() - (3600000 * 24)
          }
        ];
        await Notification.insertMany(defaults);
        console.log("Default notifications seeded.");
      }
    } catch (error) {
      console.error("Error seeding notifications:", error);
    }
  };
  await seedNotifications();

  // API Routes
  app.get("/healthz", (req: Request, res: Response) => {
    res.status(200).send("OK");
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/seating", async (req: Request, res: Response) => {
    try {
      const doc = await SeatingArrangement.findOne().sort({ updatedAt: -1 });
      if (!doc) {
        return res.json({ arrangements: [], sessionName: "External Examination 2026" });
      }
      res.json({ arrangements: doc.arrangements, sessionName: doc.sessionName });
    } catch (error) {
      console.error("Error fetching seating:", error);
      res.status(500).json({ success: false, error: "Failed to fetch seating arrangement" });
    }
  });

  app.post("/api/seating", async (req: Request, res: Response) => {
    try {
      const { arrangements, sessionName } = req.body;
      await SeatingArrangement.findOneAndUpdate(
        {},
        { 
          arrangements: arrangements || [], 
          sessionName: sessionName || "External Examination 2026", 
          updatedAt: Date.now() 
        },
        { upsert: true, new: true }
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving seating:", error);
      res.status(500).json({ success: false, error: "Failed to save seating arrangement" });
    }
  });

  app.post("/api/seating/clear", async (req: Request, res: Response) => {
    try {
      await SeatingArrangement.findOneAndUpdate({}, { arrangements: [], updatedAt: Date.now() });
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing seating:", error);
      res.status(500).json({ success: false, error: "Failed to clear seating arrangement" });
    }
  });

  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
      res.json({ notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ success: false, error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notificationData = req.body;
      const newNotification = new Notification(notificationData);
      await newNotification.save();
      
      const count = await Notification.countDocuments();
      if (count > 100) {
        const oldest = await Notification.find().sort({ createdAt: 1 }).limit(count - 100);
        const idsToDelete = oldest.map(n => n._id);
        await Notification.deleteMany({ _id: { $in: idsToDelete } });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ success: false, error: "Failed to create notification" });
    }
  });

  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await Notification.deleteOne({ id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, error: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ success: false, error: "Failed to delete notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
