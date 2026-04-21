package com.acharya.aiml.erp;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONException;
import org.json.JSONObject;

public final class AttendanceStore {
    private static final String PREFS_NAME = "erp_attendance_prefs";
    private static final String KEY_RECORDS = "attendance_records";

    private AttendanceStore() {
    }

    public static synchronized boolean saveAttendanceIfAbsent(
        Context context,
        String date,
        String day,
        String time,
        String code,
        String subject,
        String status
    ) {
        JSONObject records = getRecordsJson(context);
        JSONObject dateRecords = records.optJSONObject(date);
        if (dateRecords == null) {
            dateRecords = new JSONObject();
        }

        String slotId = buildSlotId(day, time, code, subject);
        if (dateRecords.has(slotId)) {
            return false;
        }

        JSONObject entry = new JSONObject();
        try {
            entry.put("status", status);
            entry.put("subject", subject);
            entry.put("code", code != null ? code : "N/A");
            entry.put("time", time);
            entry.put("day", day);
            dateRecords.put(slotId, entry);
            records.put(date, dateRecords);
        } catch (JSONException ignored) {
            return false;
        }

        persistRecords(context, records);
        return true;
    }

    public static synchronized JSONObject getRecordsJson(Context context) {
        SharedPreferences preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String records = preferences.getString(KEY_RECORDS, "{}");

        try {
            return new JSONObject(records);
        } catch (JSONException ignored) {
            return new JSONObject();
        }
    }

    private static synchronized void persistRecords(Context context, JSONObject records) {
        SharedPreferences preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        preferences.edit().putString(KEY_RECORDS, records.toString()).apply();
    }

    public static String buildSlotId(String day, String time, String code, String subject) {
        String safeCode = (code == null || code.isEmpty()) ? subject : code;
        return day + "|" + time + "|" + safeCode + "|" + subject;
    }
}
