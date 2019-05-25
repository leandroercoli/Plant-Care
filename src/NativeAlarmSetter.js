/**
 * This exposes the native ToastExample module as a JS module. This has a
 * function 'setAlarm' which takes the following parameters:
 *
 * 1. String planta: nombre de la planta 
 * 2. String fecha: dia de la semana en que sonara la alarma
 * 3. String hora: hora del dia en que sonara la alarma
 */
import {NativeModules} from 'react-native';
module.exports = NativeModules.NativeAlarmSetter;