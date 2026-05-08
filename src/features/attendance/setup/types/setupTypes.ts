import { Status } from '../../../../types/common';

import { AssignmentType } from './assignmentType.enum';

// --- Shift ---
export interface IShift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_night_shift?: boolean;
  late_grace_minutes: number;
  auto_checkout_time?: string;
  allow_early_checkin?: boolean;
  full_day_hours?: number;
  half_day_hours?: number;
  status: Status;
}

export interface ICreateShiftForm {
  name: string;
  start_time: string;
  end_time: string;
  is_night_shift?: boolean;
  late_grace_minutes: number;
  auto_checkout_time?: string;
  full_day_hours: number;
  half_day_hours: number;
}

// --- Weekly Off ---
export interface IWeeklyOff {
  id: string;
  name: string;
  days: string[];
  saturday_rule?: string | null;
  saturday_off_weeks?: number[] | null;
  status: Status;
}

export interface ICreateWeeklyOffForm {
  name: string;
  working_days: string[];
  saturday_rule?: string;
  saturday_off_weeks?: number[];
}

// --- Attendance Rule ---
export interface IRule {
  id: string;
  name: string;
  shift_id: string;
  weekly_off_id: string;
  overtime_after_hours?: number;
  overtime_multiplier?: number;
  require_geo_fencing: boolean;
  geo_fence?: IGeoFence;
  status: Status;
  shift?: { id: string; name: string };
  weekly_off?: { id: string; name: string };
  assigned_to?: string;
}

export interface IGeoFence {
  office_name?: string;
  latitude: number;
  longitude: number;
  radius_meters?: number;
}

export interface ICreateRuleForm {
  name: string;
  shift_id: string;
  weekly_off_id: string;
  overtime_after_hours?: number;
  overtime_multiplier?: number;
  require_geo_fencing: boolean;
  geo_fence?: IGeoFence;
}

// --- Assignment ---
export interface IAssignment {
  id: string;
  rule_id: string;
  assignment_type: AssignmentType;
  target_id: string;
  status: string;
}
