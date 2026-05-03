import connectDB from '../lib/db';
import SeatingArrangement from '../models/SeatingArrangement';

export default async function handler(req: any, res: any) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const doc = await SeatingArrangement.findOne().sort({ updatedAt: -1 });
      if (!doc) {
        return res.json({ arrangements: [], sessionName: "External Examination 2026" });
      }
      return res.json({ arrangements: doc.arrangements, sessionName: doc.sessionName });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch seating" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { arrangements, sessionName } = req.body;
      await SeatingArrangement.findOneAndUpdate(
        {},
        { arrangements: arrangements || [], sessionName: sessionName || "External Examination 2026", updatedAt: Date.now() },
        { upsert: true, new: true }
      );
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to save seating" });
    }
  }
}
