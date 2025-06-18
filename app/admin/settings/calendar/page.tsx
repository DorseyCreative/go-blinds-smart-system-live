'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Calendar {
  id: string;
  summary: string;
}

export default function CalendarSettingsPage() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Fetch the currently selected calendar from our DB
  async function fetchSelectedCalendar() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'google_selected_calendar_id')
      .single();

    if (data) {
      setSelectedCalendar(data.value);
    }
  }
  
  // Fetch the list of calendars from Google via our API route
  async function fetchGoogleCalendars() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/google/calendars');
      if (!response.ok) {
        const errorData = await response.json().catch(() => null); // Try to parse error response
        if (response.status === 401) {
          // This is the expected state before the user has connected their account.
          setIsAuthorized(false);
        } else {
          // For other errors (like 500), we should show a more specific message.
          const errorMessage = errorData?.error || `Failed to fetch calendars: ${response.statusText}`;
          throw new Error(errorMessage);
        }
        return; // Stop execution if not authorized or other error
      }
      const data = await response.json();
      setCalendars(data);
      setIsAuthorized(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSelectedCalendar();
    fetchGoogleCalendars();
  }, []);

  async function handleSave() {
    setError(null);
    setSuccess(null);
    if (!selectedCalendar) {
      setError('Please select a calendar.');
      return;
    }

    const { error } = await supabase
      .from('system_settings')
      .upsert({ key: 'google_selected_calendar_id', value: selectedCalendar }, { onConflict: 'key' });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Calendar selection saved successfully!');
    }
  }

  const handleConnect = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendar Settings</h1>
      
      {!isAuthorized ? (
         <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="mb-4">You need to connect your Google Account to manage calendar settings.</p>
            <button
                onClick={handleConnect}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
                Connect to Google Calendar
            </button>
         </div>
      ) : loading ? (
        <div>Loading calendars...</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Select a Calendar for Scheduling</h2>
          <div className="space-y-2 mb-6">
            {calendars.map((calendar) => (
              <div key={calendar.id} className="flex items-center">
                <input
                  type="radio"
                  id={calendar.id}
                  name="calendar"
                  value={calendar.id}
                  checked={selectedCalendar === calendar.id}
                  onChange={(e) => setSelectedCalendar(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={calendar.id} className="ml-3 block text-sm font-medium text-gray-700">
                  {calendar.summary}
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!selectedCalendar}
          >
            Save Selection
          </button>
        </div>
      )}

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mt-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mt-4">{success}</div>}
    </div>
  );
} 