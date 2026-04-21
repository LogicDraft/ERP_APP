package com.acharya.aiml.erp;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class NotificationActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String status = intent.getStringExtra("status");
        String subject = intent.getStringExtra("subject");
        String time = intent.getStringExtra("time");
        String day = intent.getStringExtra("day");
        String code = intent.getStringExtra("code");
        String date = intent.getStringExtra("date");

        if (status == null || subject == null || time == null || day == null || date == null) {
            return;
        }

        AttendanceStore.saveAttendanceIfAbsent(
            context,
            date,
            day,
            time,
            code != null ? code : "N/A",
            subject,
            status
        );

        int notificationId = intent.getIntExtra("notificationId", -1);
        if (notificationId != -1) {
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.cancel(notificationId);
            }
        }
    }
}
