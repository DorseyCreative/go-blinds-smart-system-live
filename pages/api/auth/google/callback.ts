import { NextApiRequest, NextApiResponse } from 'next';
import { oAuth2Client } from '@/lib/googleCalendar';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (typeof code !== 'string') {
    return res.status(400).send('Invalid request: code is missing.');
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    const { refresh_token } = tokens;

    if (!refresh_token) {
      // This happens if the user has already granted consent and a refresh token was not re-issued.
      // You might want to guide the user to re-authorize to ensure a refresh token is present.
      // For now, we'll just log it and redirect.
      console.log('Refresh token not received. User might have already authorized.');
      // It's still a good idea to set the credentials for the current session.
      oAuth2Client.setCredentials(tokens);
       // Redirect to a page where the user can now select their calendar
      return res.redirect('/admin/settings/calendar');
    }

    // Save the refresh token to the database for future use.
    // This is an upsert operation.
    const { error } = await supabase
      .from('system_settings')
      .upsert({ key: 'google_refresh_token', value: refresh_token }, { onConflict: 'key' });

    if (error) {
      console.error('Error saving refresh token:', error);
      return res.status(500).send('Failed to save refresh token.');
    }
    
    oAuth2Client.setCredentials(tokens);

    // Redirect to a page where the user can now select their calendar
    res.redirect('/admin/settings/calendar');

  } catch (error) {
    console.error('Error getting token:', error);
    res.status(500).send('Failed to retrieve access token.');
  }
} 