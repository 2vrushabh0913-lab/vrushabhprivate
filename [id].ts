import connectDB from '../../lib/db';
import Notification from '../../models/Notification';

export default async function handler(req: any, res: any) {
  await connectDB();

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await Notification.deleteOne({ id });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete notification" });
    }
  }
}
