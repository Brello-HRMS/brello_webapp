export type HolidayType = 'PUBLIC' | 'REGIONAL';

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  color: string;
  description?: string;
}

export interface Calendar {
  id: string;
  name: string;
  year: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  is_active: boolean;
  holiday_count: number;

  created_at: string;
  updated_at: string;
}

export interface CreateCalendarRequest {
  name: string;
  year: number;
}

export interface CloneCalendarRequest {
  name: string;
  year: number;
  set_active: boolean;
}

export interface AddHolidayRequest {
  name: string;
  date: string;
  type: HolidayType;
  color: string;
  description?: string;
}

export interface CalendarResponse {
  success: boolean;
  data: Calendar[];
  timestamp: string;
}

export interface SingleCalendarResponse {
  success: boolean;
  data: Calendar;
  timestamp: string;
}

export interface HolidayResponse {
  success: boolean;
  data: Holiday[];
  timestamp: string;
}

export interface MonthViewResponse {
  success: boolean;
  data: {
    days: {
      date: string;
      holidays: Holiday[];
    }[];
  };
  timestamp: string;
}

export interface EmployeeHolidaysResponse {
  success: boolean;
  data: {
    upcoming: Holiday[];
    all: Holiday[];
  };
  timestamp: string;
}
