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
    public void setAlarm(String idPlanta, String planta, String dia, String hora, String minutos){
        Toast.makeText(this.getReactApplicationContext(), "SET ALARM " + planta, Toast.LENGTH_SHORT).show();
        Intent myIntent = new Intent(this.getReactApplicationContext(), NotificationPublisher.class);
        myIntent.putExtra("planta", planta);
        myIntent.putExtra("dia", dia);
        myIntent.putExtra("hora", hora);
        myIntent.putExtra("minutos", minutos);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(this.getReactApplicationContext(), Integer.parseInt(idPlanta), myIntent, 0);
        AlarmManager alarmManager = (AlarmManager) this.getReactApplicationContext().getSystemService(ALARM_SERVICE);

        Calendar calendar=Calendar.getInstance();
        int diaInt = Integer.parseInt(dia); // domingo: 1 ... sabado: 7
        int horaInt = Integer.parseInt(hora);
        int minutosInt = Integer.parseInt(minutos);
        //calendar.set(Calendar.DAY_OF_WEEK,diaInt);
        //calendar.set(Calendar.HOUR,horaInt);
        //calendar.set(Calendar.MINUTE, minutosInt);
        // Calendar.set(int year, int month, int day, int hourOfDay, int minute, int second)
        alarmManager.setRepeating(AlarmManager.RTC_WAKEUP,
                calendar.getTimeInMillis(), 2*1000, // 2 segundos
                //AlarmManager.INTERVAL_DAY * 7, // todos los X dias a la misma hora
                 pendingIntent);
    }

    @ReactMethod
    public void cancelAlarm(String id){
        Intent intent = new Intent(this.getReactApplicationContext(), NotificationPublisher.class);
        int alarmID = Integer.parseInt(id);
        PendingIntent sender = PendingIntent.getBroadcast(this.getReactApplicationContext(), alarmID, intent, 0);
        AlarmManager alarmManager = (AlarmManager)  this.getReactApplicationContext().getSystemService(ALARM_SERVICE);

        alarmManager.cancel(sender);
        Toast.makeText(this.getReactApplicationContext(), "ALARM CANCELLED ", Toast.LENGTH_LONG).show();
    }
}