import { google } from 'googleapis';

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// We will need to get this token after the user authorizes the app
// For a server-side app, you'd typically get this once and store it securely
// oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

export async function createCalendarEvent(startTime: string, endTime: string, summary: string, description: string) {
  // TODO: Replace with the actual calendar ID from the user
  const calendarId = 'primary'; 

  try {
    const event = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: {
        summary: summary,
        description: description,
        start: {
          dateTime: startTime,
          timeZone: 'America/Los_Angeles', // Adjust as needed
        },
        end: {
          dateTime: endTime,
          timeZone: 'America/Los_Angeles', // Adjust as needed
        },
      },
    });

    return event.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error('Failed to create calendar event.');
  }
}

export { oAuth2Client }; 