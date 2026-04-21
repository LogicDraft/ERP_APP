import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const ATTENDANCE_STORAGE_KEY = 'self_attendance_records_v2';
const ErpNotifications = registerPlugin('ErpNotifications');

const DAY_TO_CALENDAR = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
};

const isBreakSlot = (slot) => {
  const upper = String(slot?.subject || '').toUpperCase();
  return upper.includes('BREAK') || upper.includes('LUNCH');
};

const parseStartTime = (time, previousHour = null) => {
  const [start] = String(time || '').split('-');
  const [h, m] = start.split(':').map((value) => Number(value));

  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return { hour: 9, minute: 0 };
  }

  let hour = h;
  // Timetable uses 01:40 style for afternoon blocks.
  if (hour < 7) {
    hour += 12;
  }

  if (previousHour !== null && hour < previousHour) {
    hour += 12;
  }

  if (hour >= 24) {
    hour -= 24;
  }

  return { hour, minute: m };
};

const buildSlotId = (slot, day) => `${day}|${slot.time}|${slot.code || slot.subject}|${slot.subject}`;

const buildAttendanceSlots = (timetable) => {
  const slots = [];

  Object.entries(timetable || {}).forEach(([day, daySlots]) => {
    let previousHour = null;

    (daySlots || []).forEach((slot) => {
      if (isBreakSlot(slot)) {
        return;
      }

      const { hour, minute } = parseStartTime(slot.time, previousHour);
      previousHour = hour;

      const slotId = buildSlotId(slot, day);
      const requestCode = Math.abs(hashCode(`attendance|${slotId}`));

      slots.push({
        slotId,
        subject: slot.subject,
        code: slot.code || 'N/A',
        time: slot.time,
        day,
        dayOfWeek: DAY_TO_CALENDAR[day] || 2,
        hour,
        minute,
        requestCode,
        notificationId: requestCode,
        title: `Attendance: ${slot.subject}`,
        message: `${slot.subject} at ${slot.time}. Mark present or absent.`,
      });
    });
  });

  return slots;
};

const buildReminderSlots = (timetable, customNotifications = []) => {
  const reminders = [];
  const seen = new Set();

  Object.entries(timetable || {}).forEach(([day, daySlots]) => {
    let previousHour = null;

    (daySlots || []).forEach((slot) => {
      if (isBreakSlot(slot) || !slot.requiresLaptop) {
        return;
      }

      const { hour, minute } = parseStartTime(slot.time, previousHour);
      previousHour = hour;

      const reminderKey = `laptop|${day}|${slot.time}|${slot.subject}`;
      if (seen.has(reminderKey)) {
        return;
      }
      seen.add(reminderKey);

      const requestCode = Math.abs(hashCode(`reminder|${reminderKey}`));
      reminders.push({
        slotId: reminderKey,
        day,
        dayOfWeek: DAY_TO_CALENDAR[day] || 2,
        hour,
        minute,
        requestCode,
        notificationId: requestCode,
        title: 'Bring laptop to class',
        message: `${slot.subject} is scheduled at ${slot.time}. Please bring your laptop.`,
      });
    });
  });

  customNotifications.forEach((notification, index) => {
    if (!notification?.manual) {
      return;
    }

    const day = String(notification.day || '').toLowerCase();
    const time = notification.time || '09:00-09:30';
    const { hour, minute } = parseStartTime(time, null);
    const slotId = `manual|${index}|${day}|${time}`;
    const requestCode = Math.abs(hashCode(`reminder|${slotId}`));

    reminders.push({
      slotId,
      day,
      dayOfWeek: DAY_TO_CALENDAR[day] || 2,
      hour,
      minute,
      requestCode,
      notificationId: requestCode,
      title: notification.title || 'ERP Reminder',
      message: notification.message || 'Class reminder',
    });
  });

  return reminders;
};

const hashCode = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const ensureNotificationPermission = async () => {
  const permission = await LocalNotifications.checkPermissions();
  if (permission.display === 'granted') {
    return true;
  }

  const requested = await LocalNotifications.requestPermissions();
  return requested.display === 'granted';
};

export const initializeNotificationSystem = async (timetable, customNotifications = []) => {
  if (Capacitor.getPlatform() !== 'android') {
    return;
  }

  const granted = await ensureNotificationPermission();
  if (!granted) {
    return;
  }

  const attendanceSlots = buildAttendanceSlots(timetable);
  const reminders = buildReminderSlots(timetable, customNotifications);

  await ErpNotifications.configure({
    attendanceSlots,
    reminders,
  });
};

export const syncNativeAttendanceToLocalStorage = async () => {
  if (Capacitor.getPlatform() !== 'android') {
    return null;
  }

  try {
    const response = await ErpNotifications.getAttendanceRecords();
    const nativeRecords = response?.records || {};

    const existingRecords = JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY) || '{}');
    const merged = { ...existingRecords };

    Object.entries(nativeRecords).forEach(([date, dateRecords]) => {
      merged[date] = {
        ...(merged[date] || {}),
        ...(dateRecords || {}),
      };
    });

    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return null;
  }
};
