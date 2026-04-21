package com.acharya.aiml.erp;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.core.app.NotificationCompat;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class NotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        NotificationScheduler.createNotificationChannel(context);

        String type = intent.getStringExtra("type");
        int notificationId = intent.getIntExtra("notificationId", Math.abs(intent.hashCode()));

        String subject = intent.getStringExtra("subject");
        String time = intent.getStringExtra("time");
        String day = intent.getStringExtra("day");
        String code = intent.getStringExtra("code");
        String slotId = intent.getStringExtra("slotId");

        String title = intent.getStringExtra("title");
        String message = intent.getStringExtra("message");

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, NotificationScheduler.CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentTitle(title)
            .setContentText(message);

        if ("attendance".equals(type)) {
            if (title == null || title.isEmpty()) {
                builder.setContentTitle("Attendance: " + subject);
            }
            if (message == null || message.isEmpty()) {
                builder.setContentText("Mark attendance for " + subject + " at " + time);
            }

            String date = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());

            Intent presentIntent = new Intent(context, NotificationActionReceiver.class);
            presentIntent.putExtra("status", "present");
            presentIntent.putExtra("subject", subject);
            presentIntent.putExtra("time", time);
            presentIntent.putExtra("day", day);
            presentIntent.putExtra("code", code);
            presentIntent.putExtra("slotId", slotId);
            presentIntent.putExtra("date", date);
            presentIntent.putExtra("notificationId", notificationId);

            Intent absentIntent = new Intent(context, NotificationActionReceiver.class);
            absentIntent.putExtra("status", "absent");
            absentIntent.putExtra("subject", subject);
            absentIntent.putExtra("time", time);
            absentIntent.putExtra("day", day);
            absentIntent.putExtra("code", code);
            absentIntent.putExtra("slotId", slotId);
            absentIntent.putExtra("date", date);
            absentIntent.putExtra("notificationId", notificationId);

            int presentRequestCode = Math.abs((slotId + "present").hashCode());
            int absentRequestCode = Math.abs((slotId + "absent").hashCode());

            PendingIntent presentPendingIntent = PendingIntent.getBroadcast(
                context,
                presentRequestCode,
                presentIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            PendingIntent absentPendingIntent = PendingIntent.getBroadcast(
                context,
                absentRequestCode,
                absentIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            builder.addAction(0, "Mark Present", presentPendingIntent);
            builder.addAction(0, "Mark Absent", absentPendingIntent);
            builder.setStyle(new NotificationCompat.BigTextStyle().bigText("Mark attendance for " + subject + " (" + time + ")"));
        } else {
            String finalTitle = title;
            String finalMessage = message;
            if (title == null || title.isEmpty()) {
                finalTitle = "ERP Reminder";
            }
            if (message == null || message.isEmpty()) {
                finalMessage = "Reminder from timetable";
            }
            builder.setContentTitle(finalTitle);
            builder.setContentText(finalMessage);
            builder.setStyle(new NotificationCompat.BigTextStyle().bigText(finalMessage));
        }

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(notificationId, builder.build());
        }

        NotificationScheduler.scheduleNextWeekFromIntent(context, intent);
    }
}
