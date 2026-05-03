import connectDB from '../lib/db';
import Notification from '../models/Notification';

export default async function handler(req: any, res: any) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ notifications });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }

  if (req.method === 'POST') {
    try {
      const notification = new Notification(req.body);
      await notification.save();
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create notification" });
    }
  }
}
