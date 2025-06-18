import { NextApiRequest, NextApiResponse } from 'next';
import { oAuth2Client } from '@/lib/googleCalendar';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
} 