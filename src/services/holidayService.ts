import axios from 'axios';
import { startOfYear, endOfYear, parseISO } from 'date-fns';

import { envVars } from '../utils/envVars';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    date?: string;
    dateTime?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
  };
}

export interface HolidayEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  type: 'holiday' | 'republic' | 'gazetted' | 'restricted';
}

const CALENDAR_ID = 'en.indian#holiday@group.v.calendar.google.com';
const GOOGLE_API_KEY = envVars.GOOGLE_CALENDAR_API_KEY;

/**
 * Fetches holidays from Google Calendar API for a specific year.
 */
export const fetchGoogleHolidays = async (year: number): Promise<HolidayEvent[]> => {
  if (!GOOGLE_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn('Google Calendar API Key is missing. Returning empty holiday list.');
    return [];
  }

  const timeMin = startOfYear(new Date(year, 0, 1)).toISOString();
  const timeMax = endOfYear(new Date(year, 11, 31)).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    CALENDAR_ID,
  )}/events`;

  try {
    const response = await axios.get<{ items: GoogleCalendarEvent[] }>(url, {
      params: {
        key: GOOGLE_API_KEY,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      },
    });

    return (response.data.items || []).map((event) => {
      const start = event.start.date ? parseISO(event.start.date) : parseISO(event.start.dateTime!);
      const end = event.end.date ? parseISO(event.end.date) : parseISO(event.end.dateTime!);

      return {
        id: event.id,
        title: event.summary,
        start,
        end,
        allDay: !!event.start.date,
        type: event.summary.toLowerCase().includes('republic') ? 'republic' : 'holiday',
      };
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Google Holidays:', error);
    throw error;
  }
};
