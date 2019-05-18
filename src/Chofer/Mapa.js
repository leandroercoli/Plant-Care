import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);

import React, { Component } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, View, Modal, Image, ImageBackground, Picker, Alert, Dimensions, ScrollView, TouchableOpacity, NativeModules, ToastAndroid } from 'react-native';
import { Container, Header, Left, Right, Content, Footer, FooterTab, Card, CardItem, Body, Button, Icon, Text, Spinner } from 'native-base';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import type { Notification } from 'react-native-firebase';
import moment from 'moment-timezone';

/* Componentes custom */
import LayoutMapaChofer from './LayoutMapaChofer'
import Sesion from '../persistente/Sesion';
import Const from '../persistente/Const'

export default class Mapa extends React.Component {
  constructor(props) {
    super(props);

    this.map = React.createRef()
    this.layoutMapaChofer = React.createRef()
    this.timer = null
    this.idWatchPosition = null

    this.state = {
      centerCoordinate: null, // [Long, Lat]  , Bs.As.
      sesion: null,
      loading: false,
      following: true,
      posChofer: null,
      fullNav: true,
      directions: [],
      directionsId: null,
      error: null,
    };
  }

  componentWillMount() {
    MapboxGL.setAccessToken(Const.mapboxToken);
  }

  componentWillUnmount() {
    this.killTimer()
  }

  async componentDidMount() {
    let storagedata = await Sesion.getStorageData()
    if (storagedata) {
      if (storagedata.viajeEnCurso && storagedata.viajeEnCurso.viaje && storagedata.viajeEnCurso.viaje.viaje)
        this.setState({ loading: true }, async () => await this.setTimer(storagedata.viajeEnCurso))
      else {
        // Controlar si hay viajes asignados -> mandar con frecuencia baja y viaje id = proximo viaje asignado
        const viajesAsignados = await this.viajesAsignados();
        if (viajesAsignados && viajesAsignados.length > 0) {
          const viaje_id = viajesAsignados[0].viaje.id
          NativeModules.GeoLocation.startService(Sesion.getDNI(), viaje_id, true, Const.FRECUENCIA_BAJA); // Seguir mandando puntos con baja frecuencia
        } else {
          // Empezar a transmitir GPS c/10 min
          NativeModules.GeoLocation.startService(Sesion.getDNI(), 0, true, Const.FRECUENCIA_SUPER_BAJA);
        }
      }
      this.setState({ sesion: storagedata })
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({ centerCoordinate: [Number(position.coords.longitude), Number(position.coords.latitude)] })
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 })
  }

  async componentDidUpdate(prevProps) {
    console.log("componentDidUpdate prevProps", prevProps.screenProps)
    console.log("componentDidUpdate nuevaNotificacion", this.props.screenProps.nuevaNotificacion)
    // Typical usage (don't forget to compare props):
    if (this.props.screenProps.nuevaNotificacion == true && this.props.screenProps.nuevaNotificacion !== prevProps.screenProps.nuevaNotificacion) {
      console.log("componentDidUpdate nuevaNotificacion", this.props.screenProps.nuevaNotificacion)
      const viajesProgramados = await Sesion.getViajesProgramados(Sesion.getDNI())
      console.log("NEW notificacion_datos viajeEnCurso", (viajesProgramados && viajesProgramados.length > 0) ? viajesProgramados[0] : "no se encontraon")
      if (viajesProgramados && viajesProgramados.length > 0) {
        const viajeEnCurso = {
          viaje: viajesProgramados[0],
          recorridoViaje: Sesion.crearRecorrido(viajesProgramados[0])
        }
        this.comenzarViaje(viajeEnCurso)
      }
    }
  }

  // Obtener el viaje que viene desde la pantalla Viajes
  viajePreview() {
    if (this.props.navigation.state.params && this.props.navigation.state.params.viaje) {
      const viajeEnCurso = {
        viaje: this.props.navigation.state.params.viaje,
        recorridoViaje: Sesion.crearRecorrido(this.props.navigation.state.params.viaje)
      }

      if (!this.state.directionsId || this.state.directionsId != viajeEnCurso.viaje.viaje.id)
        this.getDirections(viajeEnCurso)

      return viajeEnCurso;
    }
    else return null
  }

  render() {
    console.log("Mapa render() sesion", this.state.sesion)
    let viajeEnCurso = (this.state.sesion && this.state.sesion.viajeEnCurso && this.state.sesion.viajeEnCurso.viaje && this.state.sesion.viajeEnCurso.viaje.viaje) ? // Había comenzado un viaje
      this.state.sesion.viajeEnCurso  // Levantarlo y reanudarlo en el mapa
      : this.viajePreview();  // No había comenzado un viaje y viene desde la pantalla Viajes
    const accionActual = (this.state.sesion && this.state.sesion.viajeEnCurso && this.state.sesion.viajeEnCurso.viaje && this.state.sesion.viajeEnCurso.viaje.viaje) ?
      this.getAccionActual(this.state.sesion.viajeEnCurso.viaje) : null;
    return (
      <Container>
        <Header style={{ backgroundColor: '#1b0088' }}>
          <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <Text style={{ fontFamily: "OpenSans-Light", fontSize: 22, color: '#fff' }}>SST</Text>
          </View>
          <Body>
          </Body>
          <Right>
            {(this.state.sesion && Const.debug_dni.includes(this.state.sesion.persona.dni)) ?
              <TouchableOpacity onPress={() => NativeModules.GeoLocation.stopService()}>
                <Text style={{ color: '#fff' }}>Stop GPS</Text>
              </TouchableOpacity>
              : null}
          </Right>
        </Header>

        {
          (accionActual) ?
            <Header span={(this.state.fullNav) ? true : false} style={{ backgroundColor: '#1b0088', borderLeftColor: '#b30f3b', borderLeftWidth: 5 }}>
              <Left style={{ flex: 1, height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                {
                  (this.state.refreshing) ?
                    <Spinner color='rgb(179,15,59)' />
                    : (accionActual.estado == 7 || accionActual.estado == 9 || accionActual.estado == 11 || accionActual.estado == 11) ?
                      <Icon type="Feather" name="user" style={{ fontSize: 32, color: '#fff' }} /> :
                      (accionActual.estado == 10 || accionActual.estado == 12) ?
                        <Icon type="Entypo" name="aircraft-take-off" style={{ fontSize: 32, color: '#fff' }} /> :
                        (accionActual.estado == 6 || accionActual.estado == 8 || accionActual.estado == 14) ?
                          < Icon type="Feather" name="check-circle" style={{ fontSize: 32, color: '#fff' }} /> :
                          < Icon type="Feather" name="chevron-right" style={{ fontSize: 32, color: '#fff' }} />
                }
              </Left>
              <Body style={{ flex: 4, height: '100%', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={styles.accionTitulo}>{accionActual.titulo}</Text>
                <Text style={styles.accionSubtitulo}>{accionActual.subtitulo}</Text>
                {(this.state.fullNav) ? <Text style={styles.accionSubtitulo}>{accionActual.subtitulo2}</Text> : null}
              </Body>
              <Right style={{ flex: 1.5, height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                <View style={{ flex: 1 }}><Text style={styles.accionSubtitulo}>{moment.utc(accionActual.hora).tz(Const.tz).format('HH:mm')} hs.</Text></View>

                <TouchableOpacity onPress={() => this.toggleNav()}>
                  <Icon type="Feather" name={(this.state.fullNav) ? "chevron-up" : "chevron-down"} style={{ fontSize: 38, color: '#fff' }} />
                </TouchableOpacity>
              </Right>
            </Header>
            : null
        }


        {
          (this.state.loading) ?
            (<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color='#3f51b5' /></View>)
            : (
              <View style={styles.containerMap}>
                <MapboxGL.MapView
                  ref={(c) => this.map = c}
                  centerCoordinate={this.state.centerCoordinate}
                  animated={true}
                  zoomLevel={(this.state.following) ? 16 : undefined}
                  pitch={(this.state.following) ? 50 : undefined}
                  style={styles.containerMap}
                  styleURL={MapboxGL.StyleURL.Light}
                  showUserLocation={true}
                  onRegionDidChange={(features) => {
                    if (features.properties.isUserInteraction) {
                      this.desactivarSeguimiento()
                    }
                  }}
                  userTrackingMode={(this.state.following) ? MapboxGL.UserTrackingModes.FollowWithHeading : MapboxGL.UserTrackingModes.None}>
                  {(viajeEnCurso && viajeEnCurso.viaje && viajeEnCurso.viaje.pasajeros) ?
                    (
                      this.renderAnnotationPasajeros(viajeEnCurso.viaje.pasajeros)
                    ) : null}
                  {(viajeEnCurso && viajeEnCurso.viaje && viajeEnCurso.viaje.viaje) ?
                    (
                      this.renderAnnotationAeropuerto(viajeEnCurso.viaje.viaje)
                    ) : null}
                  {(this.state.posChofer) ? this.renderPosChofer() : null}
                  {(this.state.directions && this.state.directions.length > 0) ? this.renderDirections() : null}
                </MapboxGL.MapView>
                <LayoutMapaChofer
                  ref={(c) => this.layoutMapaChofer = c}
                  viajeEnCurso={viajeEnCurso}
                  onPressFabMyLocation={() => this.onPressFabMyLocation()}
                  onPressFabAeropuertoLocation={(viaje) => this.onPressFabAeropuertoLocation(viaje)}
                  handleFabPasajeroPress={(pasajero) => this.enfocarPasajero(pasajero)}
                  onComenzarViajePress={() => this.comenzarViaje(viajeEnCurso)}
                  onFinalizarViajePress={() => this.finalizarViaje()}
                  onCancelarViajePress={() =>
                    Alert.alert(
                      'Cancelar viaje',
                      '¿Está seguro de cancelar el viaje en curso?',
                      [
                        { text: 'Volver', onPress: () => null },
                        { text: 'Sí', onPress: () => this.cancelarViaje() },
                      ],
                      { cancelable: true }
                    )}
                  refreshing={this.state.refreshing}
                  debug={(this.state.sesion) ? Const.debug_dni.includes(this.state.sesion.persona.dni) : false}
                  following={this.state.following} />
              </View>
            )
        }
      </Container>
    );
  }

  getAccionActual(viajeEnCurso) {
    console.log("getAccionActual", viajeEnCurso)
    let accion = {
      'titulo': '',
      'subtitulo': '',
      'subtitulo2': '',
      'hora': undefined,
      'estado': 0
    }
    if (viajeEnCurso && viajeEnCurso.viaje && viajeEnCurso.pasajeros && viajeEnCurso.pasajeros.length > 0) {
      const viaje = viajeEnCurso.viaje; const pasajeros = viajeEnCurso.pasajeros;
      accion.estado = viaje.viaje_estado_codigo

      accion.titulo =
        (viaje.viaje_estado_codigo == 9 || viaje.viaje_estado_codigo == 10) ? "En curso a origen" : (
          (viaje.viaje_estado_codigo == 7 || viaje.viaje_estado_codigo == 8) ? "En origen" : (
            (viaje.viaje_estado_codigo == 12 || viaje.viaje_estado_codigo == 11) ? "En curso a destino" : (
              (viaje.viaje_estado_codigo == 14 || viaje.viaje_estado_codigo == 13) ? "En destino" : ''
            )
          )
        )
      if (viaje.viaje_sentido_codigo == "IN") {
        accion.subtitulo =
          (viaje.viaje_estado_codigo == 9 || viaje.viaje_estado_codigo == 7) ?
            (p = pasajeros.find((p) => p.pasajero_estado_codigo == 4), p ? p.pasajero_domicilio : '') : (
              (viaje.viaje_estado_codigo == 12) ? viaje.aeropuerto_nombre + "(" + viaje.aeropuerto_codigo_iata + ")" :
                (viaje.viaje_estado_codigo == 14) ? 'Viaje finalizado' : ''
            )
        accion.subtitulo2 =
          (viaje.viaje_estado_codigo == 9 || viaje.viaje_estado_codigo == 7) ?
            (p = pasajeros.find((p) => p.pasajero_estado_codigo == 4), p ? p.pasajero_razon_social : '') :
            (viaje.viaje_estado_codigo == 14) ? 'Presione el botón \"Finalizar viaje\"' : ''

        accion.hora =
          (viaje.viaje_estado_codigo == 9 || viaje.viaje_estado_codigo == 7) ?
            (p = pasajeros.find((p) => p.pasajero_estado_codigo == 4), p ? p.pasajero_fh_inicio : undefined) : (
              (viaje.viaje_estado_codigo == 12 || viaje.viaje_estado_codigo == 14) ? viaje.fecha_hora_fin : undefined
            )
      } else if (viaje.viaje_sentido_codigo == "OUT") {
        accion.subtitulo =
          (viaje.viaje_estado_codigo == 10 || viaje.viaje_estado_codigo == 8) ?
            viaje.aeropuerto_nombre + "(" + viaje.aeropuerto_codigo_iata + ")" : (
              (viaje.viaje_estado_codigo == 11 || viaje.viaje_estado_codigo == 13) ?
                (p = pasajeros.find((p) => p.pasajero_estado_codigo == 5), p ? p.pasajero_domicilio : 'Viaje finalizado') : ''
            )
        accion.subtitulo2 =
          (viaje.viaje_estado_codigo == 11 || viaje.viaje_estado_codigo == 13) ?
            (p = pasajeros.find((p) => p.pasajero_estado_codigo == 5), p ? p.pasajero_razon_social : 'Presione el botón \"Finalizar viaje\"') : ''

        accion.hora =
          (viaje.viaje_estado_codigo == 10 || viaje.viaje_estado_codigo == 8) ?
            viaje.fecha_hora_inicio : (
              (viaje.viaje_estado_codigo == 11 || viaje.viaje_estado_codigo == 13) ?
                (p = pasajeros.find((p) => p.pasajero_estado_codigo == 5), p ? p.pasajero_fh_fin : undefined) : undefined
            )
      }
    }

    return accion
  }

  toggleNav() {
    this.setState({ fullNav: !this.state.fullNav })
  }

  onPressFabMyLocation() {
    if (!this.state.following) {
      this.activarSeguimiento()
    } else {
      this.desactivarSeguimiento()
    }
  }

  desactivarSeguimiento() {
    if (this.state.following) this.setState({ following: false })
  }

  activarSeguimiento() {
    if (!this.state.following) {
      this.setState({ following: true })
    }
  }

  /* Función para manejar el ciclo del viaje. */
  async comenzarViaje(viajeEnCurso) {
    this.setState({ loading: true, following: false },
      async () => {
        if (await Sesion.comenzarViaje(viajeEnCurso)) {

          this.activarSeguimiento();
          if (Platform.OS === 'android') ToastAndroid.showWithGravityAndOffset('Viaje comenzado.', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
          this.props.navigation.setParams({ viaje: null })
          await this.setTimer(viajeEnCurso)

        } else {
          this.setState({ loading: false })
        }
      }
    )
  }

  /* Función para manejar el ciclo del viaje. */
  async finalizarViaje() {
    this.setState({ sesion: await Sesion.finalizarViaje(), directions: [], directionsId: null },
      async () => {
        const viajesAsignados = await this.viajesAsignados();
        if (viajesAsignados && viajesAsignados.length > 0) {
          const viaje_id = viajesAsignados[0].viaje.id
          NativeModules.GeoLocation.startService(Sesion.getDNI(), viaje_id, true, Const.FRECUENCIA_BAJA); // Seguir mandando puntos con baja frecuencia
        } else
          NativeModules.GeoLocation.startService(Sesion.getDNI(), 0, true, Const.FRECUENCIA_SUPER_BAJA); // Seguir mandando puntos con SUPER baja frecuencia
        this.killTimer()
        if (Platform.OS === 'android') ToastAndroid.showWithGravityAndOffset('Viaje finalizado.', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
        if (this.layoutMapaChofer) { console.log("this.layotumapa"); this.layoutMapaChofer.refreshProximoViaje() } else console.log("NO this.layotumapa");
        this.props.navigation.navigate('Viajes', { reload: true })
        console.log("Viaje TERMINADO")
      })
  }

  /* Función para manejar el ciclo del viaje. */
  async cancelarViaje() {
    this.setState({ sesion: await Sesion.resetViaje(), posChofer: null, directions: [], directionsId: null },
      async () => {
        const viajesAsignados = await this.viajesAsignados();
        if (viajesAsignados && viajesAsignados.length > 0) {
          const viaje_id = viajesAsignados[0].viaje.id
          NativeModules.GeoLocation.startService(Sesion.getDNI(), viaje_id, true, Const.FRECUENCIA_BAJA); // Seguir mandando puntos con baja frecuencia
        } else
          NativeModules.GeoLocation.startService(Sesion.getDNI(), 0, true, Const.FRECUENCIA_SUPER_BAJA); // Seguir mandando puntos con SUPER baja frecuencia
        this.killTimer()
        this.props.navigation.navigate('Viajes', { reload: true })
        console.log("Viaje RESETEADO")
      })
  }

  async setTimer(viajeEnCurso) {
    NativeModules.GeoLocation.startService(Sesion.getDNI(), viajeEnCurso.viaje.viaje.id, true, Const.FRECUENCIA_ALTA);
    await this.refresh()
    this.timer = setInterval(async () => {
      this.refresh()
    }, 6000); // 6 segundos
  }

  async refresh() {
    this.setState({ refreshing: true });
    let posChofer = null
    const storage = await Sesion.refreshViajeEnCurso()
    if (storage && storage.viajeEnCurso.viaje && storage.viajeEnCurso.viaje.viaje) {
      const sp_posChofer = await this.sp_getPosChofer(storage.viajeEnCurso.viaje.viaje.conductor_dni, storage.viajeEnCurso.viaje.viaje.id);
      if (sp_posChofer && sp_posChofer.length > 0)
        posChofer = sp_posChofer

      this.getDirections(storage.viajeEnCurso.viaje)
    }
    else if (storage && !storage.viajeEnCurso.viaje) // Recibo storage (no es un problema de internet), pero el viaje terminó
      killTimer()
    this.setState({ sesion: storage, loading: false, refreshing: false, posChofer: posChofer })
  }

  killTimer() {
    clearInterval(this.timer);
    this.timer = null
  }

  async viajesAsignados() {
    var viajes = null;
    try {
      const response = await fetch(Const.webURLPublica + '/getViajesProgramados', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conductor_dni: Sesion.getDNI(),
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
      console.log("No se pudieron obtener los viajes programados para el conductor.", error);
    }
    return viajes;
  }

  enfocarPasajero(pasajero) {
    this.setState({ following: false },
      () => { if (this.map) this.map.flyTo([Number(pasajero.pasajero_longitud), Number(pasajero.pasajero_latitud)], 1500) })
  }


  // old
  startFollowing() {
    this.idWatchPosition = navigator.geolocation.watchPosition(
      (position) => {
        // this.setState({ centerCoordinate: [Number(position.coords.longitude), Number(position.coords.latitude)] })
        if (this.map) this.map.flyTo([Number(position.coords.longitude), Number(position.coords.latitude)], 1500);
      },
      (error) => { console.log("Error getCurrentPosition", error) },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    if (Platform.OS === 'android') ToastAndroid.showWithGravityAndOffset('Modo seguimiento activado', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
  }
  // old
  stopFollowing() {
    if (this.idWatchPosition != null) {
      navigator.geolocation.clearWatch(this.idWatchPosition);
      this.idWatchPosition = null
      if (Platform.OS === 'android') ToastAndroid.showWithGravityAndOffset('Modo seguimiento desactivado', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
    }
  }

  onPressFabAeropuertoLocation(viaje) {
    this.setState({ following: false },
      () => { if (this.map) this.map.flyTo([Number(viaje.aeropuerto_longitud), Number(viaje.aeropuerto_latitud)], 1500) })
  }

  renderAnnotationPasajeros(personal) {
    pasajerosAnnotations = []
    personal.forEach(pasajero => {
      pasajerosAnnotations.push(
        <MapboxGL.PointAnnotation
          key={'' + pasajero.pasajero_dni}
          id={'' + pasajero.pasajero_dni}
          coordinate={[Number(pasajero.pasajero_longitud), Number(pasajero.pasajero_latitud)]}>

          <View style={styles.annotationContainer}>
            <View style={
              [styles.annotationFill,
              (pasajero.pasajero_estado_codigo == 3) ? styles.pasajeroIconEstadoAsignado
                : (pasajero.pasajero_estado_codigo == 4) ? styles.pasajeroIconEstadoOrigen
                  : (pasajero.pasajero_estado_codigo == 5) ? styles.pasajeroIconEstadoVehiculo
                    : (pasajero.pasajero_estado_codigo == 6) ? styles.pasajeroIconEstadoDestino : styles.pasajeroIconEstadoIndefinido]
            } />
          </View>
          <MapboxGL.Callout title={pasajero.pasajero_domicilio} />
        </MapboxGL.PointAnnotation>
      )
    });
    return pasajerosAnnotations
  }

  renderAnnotationAeropuerto(viaje) {
    return <MapboxGL.PointAnnotation
      key={'' + viaje.aeropuerto_codigo_iata}
      id={'' + viaje.aeropuerto_codigo_iata}
      coordinate={[Number(viaje.aeropuerto_longitud), Number(viaje.aeropuerto_latitud)]}>
      <View style={styles.annotationContainerAeropuerto} >
        <Icon
          type="Entypo"
          name="aircraft-take-off"
          style={{ fontSize: 32, color: '#1b0088' }}
        />
      </View>
      <MapboxGL.Callout title={viaje.aeropuerto_nombre} />
    </MapboxGL.PointAnnotation>
  }

  renderPosChofer() {
    recorridoLine = null
    const pos = this.state.posChofer
    if (pos && pos.length > 0) {
      let jsonRecorrido =
      {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {

            },
            "geometry": {
              "type": "LineString",
              "coordinates": [
              ]
            }
          }
        ]
      }

      pos.forEach(p => {
        jsonRecorrido.features[0].geometry.coordinates.push([Number(p.longitud), Number(p.latitud)])
      })
      recorridoLine =
        <MapboxGL.ShapeSource id="shapePosChofer" key="shapePosChofer" shape={jsonRecorrido}>
          <MapboxGL.LineLayer
            id='recorridoLine'
            style={layerStyles.recorridoLine} />
        </MapboxGL.ShapeSource>
    }
    return recorridoLine
  }

  renderDirections() {
    let directions = null
    if (this.state.directions && this.state.directions.length > 0) {
      let jsonRecorrido =
      {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {

            },
            "geometry": {
              "type": "LineString",
              "coordinates": [
              ]
            }
          }
        ]
      }

      this.state.directions.forEach(p => {
        jsonRecorrido.features[0].geometry.coordinates.push([Number(p[0]), Number(p[1])])
      })

      directions =
        <MapboxGL.ShapeSource id="shapeDirections" key="shapeDirections" shape={jsonRecorrido}>
          <MapboxGL.LineLayer
            id='directions'
            style={layerStyles.directionsLine} />
        </MapboxGL.ShapeSource>
    }
    return directions
  }

  async getDirections(viajeEnCurso) {
    console.log("getDirections viajeEnCurso", viajeEnCurso)
    let directions = null;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const centerCoordinate = [Number(position.coords.longitude), Number(position.coords.latitude)]
        directions = await this.getDirectionsFromCenter(viajeEnCurso, centerCoordinate)
      },
      async (error) => {
        console.log(error);
        directions = await this.getDirectionsFromCenter(viajeEnCurso, null)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 })

    return directions;
  }

  async getDirectionsFromCenter(viajeEnCurso, centerCoordinate) {
    console.log("getDirectionsFromCenter centerCoordinate", centerCoordinate)
    let directions = null;
    if (viajeEnCurso && (viajeEnCurso.pasajeros || (viajeEnCurso.viaje && viajeEnCurso.viaje.pasajeros))) {
      const idViaje = (viajeEnCurso.viaje && viajeEnCurso.viaje.viaje) ? viajeEnCurso.viaje.viaje.id : viajeEnCurso.viaje.id
      const viajeSentido = (viajeEnCurso.viaje && viajeEnCurso.viaje.viaje) ?
        viajeEnCurso.viaje.viaje.viaje_sentido_codigo : viajeEnCurso.viaje.viaje_sentido_codigo
      const viajeEstado = (viajeEnCurso.viaje && viajeEnCurso.viaje.viaje) ?
        viajeEnCurso.viaje.viaje.viaje_estado_codigo : viajeEnCurso.viaje.viaje_estado_codigo
      const pasajeros = (viajeEnCurso.pasajeros) ? viajeEnCurso.pasajeros : viajeEnCurso.viaje.pasajeros;
      const aeropuerto = (viajeEnCurso.viaje && viajeEnCurso.viaje.viaje) ?
        [Number(viajeEnCurso.viaje.viaje.aeropuerto_longitud), Number(viajeEnCurso.viaje.viaje.aeropuerto_latitud)]
        : [Number(viajeEnCurso.viaje.aeropuerto_longitud), Number(viajeEnCurso.viaje.aeropuerto_latitud)];

      try {
        let url = 'https://api.mapbox.com/directions/v5/mapbox/driving/'
        url += (centerCoordinate) ? '' + Number(centerCoordinate[0]) + ',' + Number(centerCoordinate[1]) + ';' : ''
        if (viajeSentido == "IN") {
          for (var i = 0; i < pasajeros.length; i++) {
            if (pasajeros[i].pasajero_estado_codigo == 4)
              url += '' + Number(pasajeros[i].pasajero_longitud) + ',' + Number(pasajeros[i].pasajero_latitud) + ';'
          }
          url = (aeropuerto) ? url + '' + Number(aeropuerto[0]) + ',' + Number(aeropuerto[1]) + '.' : url.slice(0, -1) + '.'
        } else {
          url += (aeropuerto && viajeEstado == 10) ? url + '' + Number(aeropuerto[0]) + ',' + Number(aeropuerto[1]) + ';' : ''
          for (var i = 0; i < pasajeros.length; i++) {
            if (pasajeros[i].pasajero_estado_codigo == 4 || pasajeros[i].pasajero_estado_codigo == 5)
              url += '' + Number(pasajeros[i].pasajero_longitud) + ',' + Number(pasajeros[i].pasajero_latitud) + ';'
          }
          url = url.slice(0, -1) + '.'
        }
        url += 'json?access_token=' + Const.mapboxToken + '&overview=full&geometries=geojson'

        console.log('getDirections url', url)
        var response = await fetch(url)
        response = await response.json()
        directions = (response) ? response.routes[0].geometry.coordinates : []
        console.log("getDirections directions", directions)

        if (directions && directions.length > 0) {
          this.setState({
            directions: directions,
            directionsId: idViaje
          })
        }

      } catch (error) {
        console.log("error  getDirections response", error)
      }
    }
    return directions;
  }

  async sp_getPosChofer(conductor_dni, viaje_id) {
    console.log("CONDUCTOR DNI ", conductor_dni)
    var posChofer = null;
    try {
      const response = await fetch(Const.webURLPublica + '/getPosChofer', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conductor_dni: conductor_dni,
          viaje_id: viaje_id
        }),
      })
      posChofer = (await response.json()).posChofer;
      console.log("sp_getPosChofer response", posChofer)
    } catch (error) {
      /*Alert.alert(
        'Error interno',
        'Error al obtener la posición del chofer.',
        [
          { text: 'Ok', onPress: () => null }
        ],
        { cancelable: true }
      )*/
      console.log("No se pudo obtener la posición del chofer.", error);
      Log.log(-1, -1, "Error: No se pudo obtener la posición del chofer (" + conductor_dni + ", viaje " + viaje_id + "). " + error.message)
    }
    return posChofer;
  }
}

const layerStyles = MapboxGL.StyleSheet.create({
  recorridoLine: {
    lineColor: '#b30f3b',
    lineWidth: 4,
    lineOpacity: 0.7,
    lineJoin: MapboxGL.LineJoin.Round,
    lineCap: MapboxGL.LineCap.Round,
    lineDasharray: [2, 2],
  },
  directionsLine: {
    lineColor: '#1b0088',
    lineWidth: 4,
    lineOpacity: 0.7,
    lineJoin: MapboxGL.LineJoin.Round,
    lineCap: MapboxGL.LineCap.Round,
    lineDasharray: [2, 2],
  },
});

const styles = StyleSheet.create({
  containerMap: {
    flex: 2
  },
  annotationContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    borderColor: 'black'
  },
  annotationFill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#b30f3b',
    transform: [{ scale: 0.6 }],
  },
  annotationContainerAeropuerto: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,81,181,0.3)',
    borderRadius: 40,
    borderColor: 'rgba(63,81,181,0.7)',
    borderWidth: 2
  },
  pasajeroIconEstadoIndefinido: {
    borderColor: 'rgba(0,0,0,0.7)',  // gris
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  pasajeroIconEstadoAsignado: {
    borderColor: 'rgba(63,81,181,0.9)',  // azul
    backgroundColor: 'rgba(63,81,181,0.7)'
  },
  pasajeroIconEstadoOrigen: {
    borderColor: 'rgba(179,15,59,0.9)', // rojo
    backgroundColor: 'rgba(179,15,59,0.7)'
  },
  pasajeroIconEstadoVehiculo: {
    borderColor: 'rgba(255, 193, 7,0.9)', // amarillo 
    backgroundColor: 'rgba(255, 193, 7,0.7)',
    //borderColor: 'rgba(76, 175, 80,0.9)', // verde
    //backgroundColor: 'rgba(76, 175, 80,0.7)'
  },
  pasajeroIconEstadoDestino: {
    borderColor: 'rgba(76, 175, 80,0.9)',  // verde
    backgroundColor: 'rgba(76, 175, 80,0.7)'
  },
  aeropuertoIconEstadoPendiente: {
    borderColor: 'rgba(179,15,59,0.9)', // rojo
    backgroundColor: 'rgba(179,15,59,0.7)'
  },
  aeropuertoIconEstadoListo: {
    //borderColor: 'rgba(255, 193, 7,0.9)',
    //backgroundColor: 'rgba(255, 193, 7,0.7)',
    borderColor: 'rgba(76, 175, 80,0.9)',  // verde
    backgroundColor: 'rgba(76, 175, 80,0.7)'
  },
  accionTitulo: {
    fontFamily: "OpenSans-Light",
    fontSize: 18,
    color: '#fff'
  },
  accionSubtitulo: {
    fontFamily: "OpenSans-Light",
    fontSize: 16,
    color: '#e1e1e1'
  },
});
