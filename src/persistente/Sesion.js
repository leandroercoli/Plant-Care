import Storage from './../components/Storage'
import Const from '../persistente/Const'
import Log from '../persistente/Log'
import { Alert, ToastAndroid, Dimensions, Platform } from 'react-native';

var Sesion = (function () {
  var dni = "";
  var storage = new Storage();

  var getDNI = function () {
    return dni;
  }

  var setDNI = async function (newDNI) {
    dni = newDNI;

    try {
      var oldStorageData = await storage.getItem("Storage_" + newDNI)
      if (!oldStorageData) { // Si no tenia datos en storage para el dni, crear un storage nuevo
        const datosPersona = await
          fetch(Const.webURLPublica + '/getDatosPersona', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              dni: newDNI,
            }),
          });
        const responseJson = await datosPersona.json();
        if (responseJson.persona.length > 0) {
          storageData = {
            persona: responseJson.persona[0],
            viajeEnCurso: (responseJson.persona[0].persona_perfil_codigo == 6) ?
              await this.createViaje()
              : null,
          }
          // Crear storagedata
          if (await storage.saveItem("Storage_" + newDNI, JSON.stringify(storageData))) {
            console.log("Datos de sesion para " + newDNI + " guardados: ", storageData)
            return storageData;
          }
        } else {
          return null; // No encontró datos de la persona en la base de datos
        }
      } else {
        oldStorageData = JSON.parse(oldStorageData)
        console.log("OLD STORAGE DATA", oldStorageData)
        if (oldStorageData.viajeEnCurso && (!oldStorageData.viajeEnCurso.viaje || !oldStorageData.viajeEnCurso.viaje.viaje)) {
          oldStorageData.viajeEnCurso.recorridoViaje = {
            index: -1,
            recorrido: []
          }
        }
        await this.setStorageData(oldStorageData)
        return oldStorageData
      }
    } catch (error) {
      console.error("Sesion getDatosPersona ERROR", error);
    }
    return null;
  }

  var createViaje = async function () {
    const viajeEnCursoDB = await this.getViajeEnCursoDB()
    var v = {
      viaje: {
        viaje: viajeEnCursoDB.viaje,
        pasajeros: viajeEnCursoDB.pasajeros
      },
      recorridoViaje: this.crearRecorrido(viajeEnCursoDB)
    }
    viajeEnCurso = v;

    return viajeEnCurso;
  }

  var getViajeEnCursoDB = async function () {
    var viajeEnCursoDB = null;
    try {
      const response = await fetch(Const.webURLPublica + '/getViajeEnCursoChofer', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conductor_dni: dni
        }),
      })
      viajeEnCursoDB = await response.json();
      console.log("getViajeEnCursoChofer()", viajeEnCursoDB)
    } catch (error) {
      //if (Platform.OS === 'android') ToastAndroid.showWithGravityAndOffset('Error al obtener el viaje en curso. Revise su conexión a internet.', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
      console.log("No se pudo obtener el viaje en curso.", error);
      Log.log(dni, -1, "Error [getViajeEnCursoChofer()]: Error al obtener el viaje en curso (dni: " + dni + "). " + error)
    }
    return viajeEnCursoDB;
  }

  // Toma un viaje{pasajeros[],viaje{}} y crea una lista de items[id,itemTitulo,itemPasajero,itemDomicilio]
  var crearRecorrido = function (viajeEnCursoDB) {
    var id = 0, recorridoViaje = { index: -1, recorrido: [] }, nombresPasajeros = []

    if (viajeEnCursoDB.viaje && viajeEnCursoDB.pasajeros) {
      viajeEnCursoDB.pasajeros.map((pasajero) => {
        nombresPasajeros.push(pasajero.pasajero_razon_social)
      })

      if (viajeEnCursoDB.viaje.viaje_sentido_codigo == "IN") {  // DOMICILIO -> AEROPUERTO
        viajeEnCursoDB.pasajeros.map((pasajero) => {
          recorridoViaje.recorrido.push({
            id: id, itemTitulo: 'En viaje a origen', itemPasajero: pasajero.pasajero_razon_social, itemPasajeroDNI: pasajero.pasajero_dni, itemDomicilio: (pasajero.pasajero_domicilio) ? pasajero.pasajero_domicilio : null,
            mensajeBoton: 'Llegué a origen', estadoActual: 9, estadoSiguiente: 7
          }); id++
          recorridoViaje.recorrido.push({
            id: id, itemTitulo: 'En origen', itemPasajero: pasajero.pasajero_razon_social, itemPasajeroDNI: pasajero.pasajero_dni, itemDomicilio: (pasajero.pasajero_domicilio) ? pasajero.pasajero_domicilio : null,
            mensajeBoton: 'Voy a destino', estadoActual: 7, estadoSiguiente: 12
          }); id++
        })
        recorridoViaje.recorrido.push({
          id: id, itemTitulo: 'En viaje a destino', itemPasajero: nombresPasajeros.join(", "), itemPasajeroDNI: null, itemDomicilio: viajeEnCursoDB.viaje.aeropuerto_codigo_iata,
          mensajeBoton: 'Llegué a destino', estadoActual: 12, estadoSiguiente: 14
        }); id++
        recorridoViaje.recorrido.push({
          id: id, itemTitulo: 'En destino', itemPasajero: nombresPasajeros.join(", "), itemPasajeroDNI: null, itemDomicilio: viajeEnCursoDB.viaje.aeropuerto_codigo_iata,
          mensajeBoton: 'Viaje finalizado', estadoActual: 14, estadoSiguiente: 6
        }); id++
      }
      else { // AEROPUERTO -> DOMICILIO
        recorridoViaje.recorrido.push({
          id: id, itemTitulo: 'En viaje a origen', itemPasajero: nombresPasajeros.join(", "), itemPasajeroDNI: null, itemDomicilio: viajeEnCursoDB.viaje.aeropuerto_codigo_iata,
          mensajeBoton: 'Llegué a origen', estadoActual: 10, estadoSiguiente: 8
        }); id++
        recorridoViaje.recorrido.push({
          id: id, itemTitulo: 'En origen', itemPasajero: nombresPasajeros.join(", "), itemPasajeroDNI: null, itemDomicilio: viajeEnCursoDB.viaje.aeropuerto_codigo_iata,
          mensajeBoton: 'Voy a destino', estadoActual: 8, estadoSiguiente: 11
        }); id++
        viajeEnCursoDB.pasajeros.map((pasajero) => {
          recorridoViaje.recorrido.push({
            id: id, itemTitulo: 'En viaje a destino', itemPasajero: pasajero.pasajero_razon_social, itemPasajeroDNI: pasajero.pasajero_dni, itemDomicilio: (pasajero.pasajero_domicilio) ? pasajero.pasajero_domicilio : null,
            mensajeBoton: 'Llegué a destino', estadoActual: 11, estadoSiguiente: 13
          }); id++
          recorridoViaje.recorrido.push({
            id: id, itemTitulo: 'En destino', itemPasajero: pasajero.pasajero_razon_social, itemPasajeroDNI: pasajero.pasajero_dni, itemDomicilio: (pasajero.pasajero_domicilio) ? pasajero.pasajero_domicilio : null,
            mensajeBoton: 'Voy a destino', estadoActual: 13, estadoSiguiente: 6
          }); id++
        })
      }
    }

    return recorridoViaje;
  }

  var comenzarViaje = async function (viajeEnCurso) {
    var oldStorageData = await this.getStorageData()
    if (oldStorageData.viajeEnCurso.recorridoViaje.index == -1) {
      var v = {
        viaje: {
          viaje: viajeEnCurso.viaje.viaje,
          pasajeros: viajeEnCurso.viaje.pasajeros
        },
        recorridoViaje: viajeEnCurso.recorridoViaje
      }
      oldStorageData.viajeEnCurso = v

      // Enviar puntos GPS
      console.log("Comienza el viaje " + oldStorageData.viajeEnCurso.viaje.viaje.id + ", envío puntos GPS ...")
      const response = await this.sp_viaje_inicio(oldStorageData.viajeEnCurso.viaje.viaje.id)
      if (response && response.result_inicio && response.result_inicio.length > 0 && response.result_inicio[0].out_resultado_codigo == 1) {
        console.log("VIAJE INICIADO RESPONSE", response)
        oldStorageData.viajeEnCurso.recorridoViaje.index = 0
        await this.setStorageData(oldStorageData)
        console.log("comenzarViaje(), new storage", oldStorageData)
        return true;
      }else{
        if (Platform.OS === 'android'){
          ToastAndroid.showWithGravityAndOffset('Error al comenzar el viaje. Recargue la lista de viajes y vuelva a intentar.', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
        }else{
          Alert.alert(
            'Error',
            'Error al comenzar el viaje. Recargue la lista de viajes y vuelva a intentar.',
            [
              { text: 'Ok', onPress: () => null }
            ],
            { cancelable: true }
          )
        }   
        return false;    
      }
    } else
      Alert.alert(
        'Error interno',
        'Error al comenzar el viaje.',
        [
          { text: 'Ok', onPress: () => null }
        ],
        { cancelable: true }
      )
    return false;
  }

  var finalizarViaje = async function () {
    var oldStorageData = await this.getStorageData()
    await this.sp_viaje_fin(oldStorageData.viajeEnCurso.viaje.viaje.id)

    var v = {
      viaje: {
        viaje: null,
        pasajeros: null
      },
      recorridoViaje: {
        index: -1,
        recorrido: []
      }
    }
    oldStorageData.viajeEnCurso = v

    await this.setStorageData(oldStorageData)
    return oldStorageData
  }

  var resetViaje = async function () {
    var oldStorageData = await this.getStorageData()
    await this.sp_viaje_reset(oldStorageData.viajeEnCurso.viaje.viaje.id)

    var v = {
      viaje: {
        viaje: null,
        pasajeros: null
      },
      recorridoViaje: {
        index: -1,
        recorrido: []
      }
    }
    oldStorageData.viajeEnCurso = v

    await this.setStorageData(oldStorageData)
    return oldStorageData
  }

  var refreshViajeEnCurso = async function () {
    var oldStorageData = await this.getStorageData()

    const viajeEnCursoDB = await this.getViajeEnCursoDB()
    if (viajeEnCursoDB) {
      const v = {
        viaje: viajeEnCursoDB.viaje,
        pasajeros: viajeEnCursoDB.pasajeros
      }

      oldStorageData.viajeEnCurso.viaje = v
      if (!viajeEnCursoDB.viaje) {
        oldStorageData.viajeEnCurso.recorridoViaje = {
          index: -1,
          recorrido: []
        }
      }

      console.log("Refresh, new storage", oldStorageData)
      this.setStorageData(oldStorageData)
    }

    return oldStorageData;
  }

  var setStorageData = async function (newStorageData) {
    return (newStorageData) ? await storage.saveItem("Storage_" + dni, JSON.stringify(newStorageData)) : await storage.deleteItem("Storage_" + dni);
  }

  var getStorageData = async function () {
    const storageData = await storage.getItem("Storage_" + dni)
    return JSON.parse(storageData)
  }

  var getViajesProgramados = async function(conductor_dni) {
		var viajes = null;
		try {
			const response = await fetch(Const.webURLPublica + '/getViajesProgramados', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					conductor_dni: conductor_dni,
				}),
			})
			viajes = await response.json();
			viajes = (viajes) ? viajes.viajes : null;
			console.log("getViajesProgramados response", viajes)
		} catch (error) {
			Alert.alert(
				'Error interno',
				'Error al obtener los viajes programados',
				[
					{ text: 'Ok', onPress: () => null }
				],
				{ cancelable: true }
			)
			Log.log(conductor_dni, -1, "Error: No se pudieron obtener los viajes programados para el conductor. " + error.message)
		}
		return viajes;
  }	
  
  var sp_viaje_inicio = async function (viajeID) {
    var viajeInicio = null;
    try {
      const response = await fetch(Const.webURLPublica + '/iniciarViaje', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          viaje_id: viajeID,
        }),
      })
      viajeInicio = await response.json();
      console.log("sp_viaje_inicio response", viajeInicio)
    } catch (error) {
      Alert.alert(
        'Error interno',
        'Error al comenzar el viaje.',
        [
          { text: 'Ok', onPress: () => null }
        ],
        { cancelable: true }
      )
      console.log("No se pudo iniciar el viaje.", error);
    }
    return viajeInicio;
  }

  var sp_viaje_fin = async function (viajeID) {
    var viajeModificado = null;
    try {
      const response = await fetch(Const.webURLPublica + '/finalizarViaje', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          viaje_id: viajeID,
        }),
      })
      viajeModificado = await response.json();
      console.log("sp_viaje_fin response", viajeModificado)
    } catch (error) {
      Alert.alert(
        'Error interno',
        'Error al finalizar el viaje.',
        [
          { text: 'Ok', onPress: () => null }
        ],
        { cancelable: true }
      )
      console.log("No se pudo finalizar el viaje.", error);
    }
    return viajeModificado;
  }

  var sp_viaje_reset = async function (viajeID) {
    var viajeModificado = null;
    try {
      const response = await fetch(Const.webURLPublica + '/resetViaje', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          viaje_id: viajeID,
        }),
      })
      viajeModificado = await response.json();
      console.log("sp_viaje_reset response", viajeModificado)
    } catch (error) {
      Alert.alert(
        'Error interno',
        'Error al resetear el viaje.',
        [
          { text: 'Ok', onPress: () => null }
        ],
        { cancelable: true }
      )
      console.log("No se pudo resetear el viaje.", error);
    }
    return viajeModificado;
  }

  return {
    getDNI: getDNI,
    setDNI: setDNI,
    setStorageData: setStorageData,
    getStorageData: getStorageData,

    createViaje: createViaje,
    getViajeEnCursoDB: getViajeEnCursoDB,
    crearRecorrido: crearRecorrido,
    refreshViajeEnCurso: refreshViajeEnCurso,
    sp_viaje_inicio: sp_viaje_inicio,
    sp_viaje_fin: sp_viaje_fin,
    sp_viaje_reset: sp_viaje_reset,
    comenzarViaje: comenzarViaje,
    finalizarViaje: finalizarViaje,
    resetViaje: resetViaje,
    getViajesProgramados: getViajesProgramados
  }
})();

export default Sesion;