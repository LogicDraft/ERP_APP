package com.acharya.aiml.erp;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;

public final class NotificationScheduler {
    public static final String CHANNEL_ID = "erp_attendance_channel";
    public static final String CHANNEL_NAME = "Attendance & Reminder Notifications";

    private static final String PREFS_NAME = "erp_notification_scheduler";
    private static final String KEY_ATTENDANCE = "attendance_slots";
    private static final String KEY_REMINDERS = "reminder_slots";

    private NotificationScheduler() {
    }

    public static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Class attendance prompts and custom reminders");
        manager.createNotificationChannel(channel);
    }

    public static void configureSchedules(Context context, JSONArray attendanceSlots, JSONArray reminders) {
        persistSchedules(context, attendanceSlots, reminders);
        scheduleAll(context, attendanceSlots, reminders);
    }

    public static void reschedulePersisted(Context context) {
        SharedPreferences preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String attendanceRaw = preferences.getString(KEY_ATTENDANCE, "[]");
        String remindersRaw = preferences.getString(KEY_REMINDERS, "[]");

        try {
            scheduleAll(context, new JSONArray(attendanceRaw), new JSONArray(remindersRaw));
        } catch (JSONException ignored) {
        }
    }

    public static void scheduleNextWeekFromIntent(Context context, Intent intent) {
        String type = intent.getStringExtra("type");
        if (type == null) {
            return;
        }

        JSONObject payload = new JSONObject();
        try {
            payload.put("type", type);
            payload.put("slotId", intent.getStringExtra("slotId"));
            payload.put("subject", intent.getStringExtra("subject"));
            payload.put("code", intent.getStringExtra("code"));
            payload.put("time", intent.getStringExtra("time"));
            payload.put("day", intent.getStringExtra("day"));
            payload.put("title", intent.getStringExtra("title"));
            payload.put("message", intent.getStringExtra("message"));
            payload.put("dayOfWeek", intent.getIntExtra("dayOfWeek", Calendar.MONDAY));
            payload.put("hour", intent.getIntExtra("hour", 9));
            payload.put("minute", intent.getIntExtra("minute", 0));
            payload.put("requestCode", intent.getIntExtra("requestCode", 0));
            payload.put("notificationId", intent.getIntExtra("notificationId", 0));
            schedulePayload(context, payload);
        } catch (JSONException ignored) {
        }
    }

    private static void scheduleAll(Context context, JSONArray attendanceSlots, JSONArray reminders) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            return;
        }

        createNotificationChannel(context);

        cancelExisting(context, attendanceSlots, reminders);

        for (int i = 0; i < attendanceSlots.length(); i++) {
            JSONObject payload = attendanceSlots.optJSONObject(i);
            if (payload == null) {
                continue;
            }
            try {
                payload.put("type", "attendance");
                schedulePayload(context, payload);
            } catch (JSONException ignored) {
            }
        }

        for (int i = 0; i < reminders.length(); i++) {
            JSONObject payload = reminders.optJSONObject(i);
            if (payload == null) {
                continue;
            }
            try {
                payload.put("type", "reminder");
                schedulePayload(context, payload);
            } catch (JSONException ignored) {
            }
        }
    }

    private static void schedulePayload(Context context, JSONObject payload) {
        int dayOfWeek = payload.optInt("dayOfWeek", Calendar.MONDAY);
        int hour = payload.optInt("hour", 9);
        int minute = payload.optInt("minute", 0);
        int requestCode = payload.optInt("requestCode", payload.toString().hashCode());
        int notificationId = payload.optInt("notificationId", Math.abs(requestCode));

        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra("type", payload.optString("type", "attendance"));
        intent.putExtra("slotId", payload.optString("slotId", ""));
        intent.putExtra("subject", payload.optString("subject", "Class"));
        intent.putExtra("code", payload.optString("code", "N/A"));
        intent.putExtra("time", payload.optString("time", ""));
        intent.putExtra("day", payload.optString("day", "monday"));
        intent.putExtra("title", payload.optString("title", "ERP Reminder"));
        intent.putExtra("message", payload.optString("message", "You have an upcoming class."));
        intent.putExtra("dayOfWeek", dayOfWeek);
        intent.putExtra("hour", hour);
        intent.putExtra("minute", minute);
        intent.putExtra("requestCode", requestCode);
        intent.putExtra("notificationId", notificationId);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            return;
        }

        long triggerAt = computeNextTrigger(dayOfWeek, hour, minute);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
            }
        } catch (SecurityException ignored) {
            // Fallback for devices where exact alarms are restricted.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
            }
        } catch (Exception ignored) {
            // Never let scheduling exceptions crash app startup.
        }
    }

    private static long computeNextTrigger(int dayOfWeek, int hour, int minute) {
        Calendar now = Calendar.getInstance();
        Calendar target = Calendar.getInstance();

        target.set(Calendar.DAY_OF_WEEK, dayOfWeek);
        target.set(Calendar.HOUR_OF_DAY, hour);
        target.set(Calendar.MINUTE, minute);
        target.set(Calendar.SECOND, 0);
        target.set(Calendar.MILLISECOND, 0);

        if (!target.after(now)) {
            target.add(Calendar.DAY_OF_YEAR, 7);
        }

        return target.getTimeInMillis();
    }

    private static void cancelExisting(Context context, JSONArray attendanceSlots, JSONArray reminders) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            return;
        }

        cancelFromArray(context, alarmManager, attendanceSlots);
        cancelFromArray(context, alarmManager, reminders);
    }

    private static void cancelFromArray(Context context, AlarmManager alarmManager, JSONArray array) {
        for (int i = 0; i < array.length(); i++) {
            JSONObject payload = array.optJSONObject(i);
            if (payload == null) {
                continue;
            }

            int requestCode = payload.optInt("requestCode", payload.toString().hashCode());
            Intent intent = new Intent(context, NotificationReceiver.class);
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            alarmManager.cancel(pendingIntent);
        }
    }

    private static void persistSchedules(Context context, JSONArray attendanceSlots, JSONArray reminders) {
        SharedPreferences preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        preferences.edit()
            .putString(KEY_ATTENDANCE, attendanceSlots.toString())
            .putString(KEY_REMINDERS, reminders.toString())
            .apply();
    }
}
