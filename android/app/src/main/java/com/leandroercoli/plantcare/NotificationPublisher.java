package com.leandroercoli.plantcare;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.os.Build;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.widget.Toast;
import android.app.PendingIntent;

import static android.content.Context.NOTIFICATION_SERVICE;

public class NotificationPublisher extends BroadcastReceiver {

    private static final String SHARED_PREF_NAME_LANG = "lang";


    public void onReceive(Context context, Intent intent) {
        //Obtener el lenguaje configurado
        SharedPreferences sp = context.getSharedPreferences(SHARED_PREF_NAME_LANG, Context.MODE_PRIVATE);
        String lang = sp.getString(SHARED_PREF_NAME_LANG,null);
        if(lang == null) lang = "es";

        // Toast.makeText(context, "ON RECEIVE " + intent.getStringExtra("planta"), Toast.LENGTH_LONG).show();

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(NOTIFICATION_SERVICE);

        // This is the Notification Channel ID. More about this in the next section
        String NOTIFICATION_CHANNEL_ID = "channel_id";
        //User visible Channel Name
        String CHANNEL_NAME = "Notification Channel";
        // Importance applicable to all the notifications in this Channel
        int importance = NotificationManager.IMPORTANCE_DEFAULT;
        //Notification channel should only be created for devices running Android 26
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel notificationChannel = new NotificationChannel(NOTIFICATION_CHANNEL_ID, CHANNEL_NAME, importance);
            //Boolean value to set if lights are enabled for Notifications from this Channel
            notificationChannel.enableLights(true);
            //Boolean value to set if vibration are enabled for Notifications from this Channel
            notificationChannel.enableVibration(true);
            //Sets the color of Notification Light
            notificationChannel.setLightColor(Color.GREEN);
            //Set the vibration pattern for notifications. Pattern is in milliseconds with the format {delay,play,sleep,play,sleep...}
            notificationChannel.setVibrationPattern(new long[]{
                    500,
                    500,
                    250,
                    500,
                    500
            });
            //Sets whether notifications from these Channel should be visible on Lockscreen or not
            notificationChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            notificationManager.createNotificationChannel(notificationChannel);
        }
        
        Intent intentNotification = null;
        try {
                intentNotification = new Intent(context, Class.forName("com.leandroercoli.plantcare.MainActivity"));
                intentNotification.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        } catch (ClassNotFoundException e) {
                e.printStackTrace();
        }       
        PendingIntent pendingIntentNotification = PendingIntent.getActivity(context, 0, intentNotification, 0);

        //Notification Channel ID passed as a parameter here will be ignored for all the Android versions below 8.0
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, NOTIFICATION_CHANNEL_ID);
        builder.setContentTitle("Plants");
        if(lang.equals("es"))
            builder.setContentText("Hora de cuidar tu " + intent.getStringExtra("planta") + "!");
        else
            builder.setContentText("Time to take care of your " + intent.getStringExtra("planta") + "!");
        builder.setContentIntent(pendingIntentNotification);
        builder.setAutoCancel(true);
        builder.setSmallIcon(R.mipmap.ic_launcher);
        builder.setLargeIcon(BitmapFactory.decodeResource(context.getResources(), R.mipmap.ic_launcher));
        builder.setPriority(NotificationCompat.PRIORITY_DEFAULT);
        builder.setVibrate(new long[] {
                500,
                500,
                250,
                500,
                500
        });
        builder.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        Notification notification = builder.build();

        // Unique identifier for notification
        int NOTIFICATION_ID = (int)System.currentTimeMillis();
//This is what will will issue the notification i.e.notification will be visible
        NotificationManagerCompat notificationManagerCompat = NotificationManagerCompat.from(context);
        notificationManagerCompat.notify(NOTIFICATION_ID, notification); 
       }
}