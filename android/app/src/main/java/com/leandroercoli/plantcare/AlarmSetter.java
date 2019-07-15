package com.leandroercoli.plantcare;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.util.Calendar;
import java.util.Map;
import java.util.HashMap;

import static android.content.Context.ALARM_SERVICE;

public class AlarmSetter extends ReactContextBaseJavaModule {

    private static final String SHARED_PREF_NAME_LANG = "lang";

    public AlarmSetter(ReactApplicationContext reactContext) {
        super(reactContext);

        // Si no está configurado el lenguaje, configurarlo con español
        SharedPreferences sp = this.getReactApplicationContext().getSharedPreferences(SHARED_PREF_NAME_LANG, Context.MODE_PRIVATE);
        String lang = sp.getString(SHARED_PREF_NAME_LANG,null);
        if(lang == null) setLanguage("es");
    }

    @Override
    public String getName() {
        return "NativeAlarmSetter";
    }

    @ReactMethod
    public void setAlarm(String planta, int accion, int alarmDayOfTheWeek, int alarmHour, int alarmMinutes,Promise promise){
        int alarmId= (int) Calendar.getInstance().getTimeInMillis();
        Intent myIntent = new Intent(this.getReactApplicationContext(), NotificationPublisher.class);
        myIntent.putExtra("planta", planta);
        myIntent.putExtra("accion", accion == 0 ? "regar" : "alimentar"); // 0 agua, 1 alimento
        myIntent.putExtra("dia", ""+alarmDayOfTheWeek);
        myIntent.putExtra("hora", ""+alarmHour);
        myIntent.putExtra("minutos", ""+alarmMinutes);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(this.getReactApplicationContext(), alarmId, myIntent, 0);

        Calendar timestamp = Calendar.getInstance();
        //Check whether the day of the week was earlier in the week:
        if( alarmDayOfTheWeek > timestamp.get(Calendar.DAY_OF_WEEK) ) {
            //Set the day of the AlarmManager:
            timestamp.add(Calendar.DAY_OF_YEAR, (alarmDayOfTheWeek - timestamp.get(Calendar.DAY_OF_WEEK)));
        }
        else {
            if( alarmDayOfTheWeek < timestamp.get(Calendar.DAY_OF_WEEK) ) {
                //Set the day of the AlarmManager:
                timestamp.add(Calendar.DAY_OF_YEAR, (7 - (timestamp.get(Calendar.DAY_OF_WEEK) - alarmDayOfTheWeek)));
            }
            else {  // myAlarmDayOfTheWeek == time.get(Calendar.DAY_OF_WEEK)
                //Check whether the time has already gone:
                if ( (alarmHour < timestamp.get(Calendar.HOUR_OF_DAY)) || 
                    ((alarmHour == timestamp.get(Calendar.HOUR_OF_DAY)) && (alarmMinutes < timestamp.get(Calendar.MINUTE))) ) {
                    //Set the day of the AlarmManager:
                    timestamp.add(Calendar.DAY_OF_YEAR, 7);
                }
            }
        }

        //Set the time of the AlarmManager:
        timestamp.set(Calendar.HOUR_OF_DAY, alarmHour);
        timestamp.set(Calendar.MINUTE, alarmMinutes);
        timestamp.set(Calendar.SECOND, 0);

        AlarmManager alarmManager = (AlarmManager) this.getReactApplicationContext().getSystemService(ALARM_SERVICE);
        alarmManager.setRepeating(AlarmManager.RTC_WAKEUP,
        timestamp.getTimeInMillis(), //2*1000, // 2 segundos
        AlarmManager.INTERVAL_DAY * 7, // todos los X dias a la misma hora
        pendingIntent);
        // Toast.makeText(this.getReactApplicationContext(), "Alarm set " +  (accion == 0 ? "regar " : "alimentar ") +  planta + ": " + timestamp.getTime(), Toast.LENGTH_SHORT).show();
        
         // El codigo que sigue dispara las alarmas anteriores
        /*Calendar calendar=Calendar.getInstance();
        calendar.set(Calendar.DAY_OF_WEEK,dia); // domingo: 1 ... sabado: 7
        calendar.set(Calendar.HOUR_OF_DAY,hora);
        calendar.set(Calendar.MINUTE, minutos);
        Toast.makeText(this.getReactApplicationContext(), "Alarm set " +  (accion == 0 ? "regar " : "alimentar ") +  planta + ": " + calendar.getTime(), Toast.LENGTH_SHORT).show();
        alarmManager.setRepeating(AlarmManager.RTC_WAKEUP,
                calendar.getTimeInMillis(), //2*1000, // 2 segundos
                AlarmManager.INTERVAL_DAY * 7, // todos los X dias a la misma hora
                pendingIntent);
        */

        WritableMap map = Arguments.createMap();
        map.putDouble("alarmId", alarmId);
        promise.resolve(map);
     }

    @ReactMethod
    public void cancelAlarm(String alarmID, Promise promise){
        //Toast.makeText(this.getReactApplicationContext(), "Alarma cancelada " + Integer.parseInt(alarmID), Toast.LENGTH_LONG).show();
        Intent intent = new Intent(this.getReactApplicationContext(), NotificationPublisher.class);
        PendingIntent sender = PendingIntent.getBroadcast(this.getReactApplicationContext(), Integer.parseInt(alarmID), intent, 0);
        AlarmManager alarmManager = (AlarmManager)  this.getReactApplicationContext().getSystemService(ALARM_SERVICE);

        alarmManager.cancel(sender);

        WritableMap map = Arguments.createMap();
        map.putString("alarmID", alarmID);
        promise.resolve(map);
    }

    @ReactMethod
    public void setLanguage(String language){
        SharedPreferences sp = this.getReactApplicationContext().getSharedPreferences(SHARED_PREF_NAME_LANG, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sp.edit();
        editor.putString(SHARED_PREF_NAME_LANG,language);
        editor.apply();
    }
}