// api/entries/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getEntries } from '../../services/entryService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || Array.isArray(userId)) {
    res.status(400).json({ error: 'Invalid userId' });
    return;
  }

  try {
    const entries = await getEntries(parseInt(userId as string));
    res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
