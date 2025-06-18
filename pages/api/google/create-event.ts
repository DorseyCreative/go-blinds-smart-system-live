import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { oAuth2Client } from '@/lib/googleCalendar';
import { supabase } from '@/lib/supabaseClient';
import { calculateJobDuration } from '@/lib/jobCalculations'; // We will create this function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId, startTime, laborToDo } = req.body;

  if (!orderId || !startTime || !laborToDo) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // 1. Get refresh token and selected calendar ID from DB
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value');

    if (settingsError) throw settingsError;

    const refreshToken = settings.find(s => s.key === 'google_refresh_token')?.value;
    const calendarId = settings.find(s => s.key === 'google_selected_calendar_id')?.value;

    if (!refreshToken || !calendarId) {
      return res.status(401).json({ error: 'Google Calendar not configured.' });
    }

    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    // 2. Calculate job duration
    const durationMinutes = await calculateJobDuration(laborToDo);
    const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000).toISOString();

    // 3. Get order details for event summary
    const { data: order, error: orderError } = await supabase
        .from('customer_orders')
        .select('customer_name, work_order_number')
        .eq('id', orderId)
        .single();
    
    if (orderError) throw orderError;

    const summary = `Job: ${order.customer_name} (#${order.work_order_number})`;
    const description = `Work Order: ${order.work_order_number}\nCustomer: ${order.customer_name}\n\nLabor Details:\n${laborToDo}`;

    // 4. Create Google Calendar event
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const event = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: {
        summary,
        description,
        start: { dateTime: startTime, timeZone: 'America/Los_Angeles' },
        end: { dateTime: endTime, timeZone: 'America/Los_Angeles' },
      },
    });
    
    // 5. Update the order in our DB with the event ID and times
    const { error: updateError } = await supabase
      .from('customer_orders')
      .update({
        google_calendar_event_id: event.data.id,
        scheduled_start_time: startTime,
        scheduled_end_time: endTime,
        status: 'Scheduled'
      })
      .eq('id', orderId);

    if (updateError) throw updateError;
    
    res.status(200).json({ message: 'Event created successfully', event: event.data });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event.' });
  }
} 