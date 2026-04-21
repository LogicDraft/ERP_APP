package com.acharya.aiml.erp;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

@CapacitorPlugin(name = "ErpNotifications")
public class ErpNotificationsPlugin extends Plugin {
    @PluginMethod
    public void configure(PluginCall call) {
        JSONArray attendanceSlots = call.getArray("attendanceSlots");
        JSONArray reminders = call.getArray("reminders");

        if (attendanceSlots == null) {
            attendanceSlots = new JSONArray();
        }
        if (reminders == null) {
            reminders = new JSONArray();
        }

        NotificationScheduler.configureSchedules(getContext(), attendanceSlots, reminders);
        call.resolve();
    }

    @PluginMethod
    public void getAttendanceRecords(PluginCall call) {
        JSObject result = new JSObject();
        result.put("records", AttendanceStore.getRecordsJson(getContext()));
        call.resolve(result);
    }
}
