import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { oAuth2Client } from '@/lib/googleCalendar';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the refresh token from the database
    const { data: tokenData, error: tokenError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'google_refresh_token')
      .single();

    if (tokenError || !tokenData) {
      console.error('Refresh token not found in database:', tokenError);
      // If no token, maybe the user hasn't authorized yet.
      // We can't use a redirect here since this is an API route called by the client.
      // The client-side will need to handle this state.
      return res.status(401).json({ error: 'Authorization required. Please connect to Google Calendar.' });
    }

    oAuth2Client.setCredentials({ refresh_token: tokenData.value });

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const calendarList = await calendar.calendarList.list();

    res.status(200).json(calendarList.data.items);
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    res.status(500).json({ error: 'Failed to fetch calendar list.' });
  }
} 