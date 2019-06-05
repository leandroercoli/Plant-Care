package com.plants;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Calendar;
import java.util.Map;
import java.util.HashMap;

import static android.content.Context.ALARM_SERVICE;

public class AlarmSetter extends ReactContextBaseJavaModule {

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";

    public AlarmSetter(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NativeAlarmSetter";
    }

    @ReactMethod
    public int setAlarm(String planta, int accion, int dia, int hora, int minutos){
        int idPlanta= (int) Calendar.getInstance().getTimeInMillis();
        Intent myIntent = new Intent(this.getReactApplicationContext(), NotificationPublisher.class);
        myIntent.putExtra("planta", planta);
        myIntent.putExtra("accion", accion == 0 ? "regar" : "alimentar"); // 0 agua, 1 alimento
        myIntent.putExtra("dia", ""+dia);
        myIntent.putExtra("hora", ""+hora);
        myIntent.putExtra("minutos", ""+minutos);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(this.getReactApplicationContext(), idPlanta, myIntent, 0);
        AlarmManager alarmManager = (AlarmManager) this.getReactApplicationContext().getSystemService(ALARM_SERVICE);

        Calendar calendar=Calendar.getInstance();
        calendar.set(Calendar.DAY_OF_WEEK,dia); // domingo: 1 ... sabado: 7
        calendar.set(Calendar.HOUR_OF_DAY,hora);
        calendar.set(Calendar.MINUTE, minutos);
        Toast.makeText(this.getReactApplicationContext(), "SET ALARM " + planta + ": " + calendar.getTime(), Toast.LENGTH_SHORT).show();
        alarmManager.setRepeating(AlarmManager.RTC_WAKEUP,
                calendar.getTimeInMillis(), //2*1000, // 2 segundos
                AlarmManager.INTERVAL_DAY * 7, // todos los X dias a la misma hora
                 pendingIntent);

        return idPlanta;
    }

    @ReactMethod
    public void cancelAlarm(int alarmID){
        Toast.makeText(this.getReactApplicationContext(), "ALARM CANCELLED " + alarmID, Toast.LENGTH_LONG).show();
        Intent intent = new Intent(this.getReactApplicationContext(), NotificationPublisher.class);
        PendingIntent sender = PendingIntent.getBroadcast(this.getReactApplicationContext(), alarmID, intent, 0);
        AlarmManager alarmManager = (AlarmManager)  this.getReactApplicationContext().getSystemService(ALARM_SERVICE);

        alarmManager.cancel(sender);
    }
}