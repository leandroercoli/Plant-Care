import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);

import React, { Component } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, View, Modal, Image, ImageBackground, Picker, Alert, Dimensions, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native';
import { Container, Header, Left, Right, Content, Title, Footer, FooterTab, Card, CardItem, Body, Button, Icon, Text } from 'native-base';
import moment from 'moment';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { NativeModules } from 'react-native';

import firebase from 'react-native-firebase';
import type { Notification } from 'react-native-firebase';

import { AsyncStorage } from "react-native"

/* Componentes custom */
import Sesion from '../persistente/Sesion'
import Const from '../persistente/Const'
import LayoutMapaPasajero from './LayoutMapaPasajero'

import smileyFaceGeoJSON from './../img/smiley_face.json';

export default class MapaPasajero extends React.Component {
  constructor(props) {
    super(props);

    this.map = React.createRef()
    this.timer = null
    this.sendGPSButton = React.createRef()
    this.idWatchPosition = null

    this.state = {
      centerCoordinate: [-58.422787, -34.594112], // [Long, Lat]  , Bs.As.
      sesion: null,
      transmitirGPS: false,
      following: false,
      error: null,
    };
  }

  componentWillMount() {
    MapboxGL.setAccessToken(Const.mapboxToken);
  }

  async componentDidMount() {
    let storagedata = await Sesion.getStorageData()
    if (storagedata) {
      this.setState({ sesion: storagedata },
        async () => {
          await this.setTimer()
          if (this.state.sesion.viajeEnCurso) {
            this.sendGPSButton.props.onPress(); // Comenzar a enviar puntos GPS por defecto
          }
        })
    }
  }

  async setTimer() {
    await this.refreshViajeEnCurso()
    if (this.state.sesion.viajeEnCurso) {
      this.timer = setInterval(async () => {
        this.refreshViajeEnCurso()
      }, 6000); // 6 segundos
    }
  }

  killTimer() {
    clearInterval(this.timer);
    this.timer = null
  }

  async refreshViajeEnCurso() {
    const viajeEnCurso = await this.getViajeEnCursoPersona(this.state.sesion.persona.dni)
    if (viajeEnCurso) {
      const posChofer = await this.sp_getPosChofer(viajeEnCurso.conductor_dni, viajeEnCurso.id);
      if (posChofer && posChofer.length > 0)
        viajeEnCurso.posChofer = posChofer // Guardar la pos del chofer en el viaje en curso       
    } else {
      if (this.timer) {
        console.log("Viaje TERMINADO")
        this.killTimer()
        NativeModules.GeoLocation.stopService()
      }
    }

    // Guardar el nuevo estado del viaje en estado de la clase y en storage
    let sesion = this.state.sesion
    sesion.viajeEnCurso = viajeEnCurso;
    await this.setState({ sesion: sesion });
    console.log("refreshViajeEnCurso() post sesion", sesion)
  }

  componentWillReceiveProps(props) {
    const notificacion = (props.screenProps && props.screenProps.notificacion) ? props.screenProps.notificacion : null;
    if (notificacion && notificacion.tipo == "inicio_viaje_pasajero") {
      this.comenzarViaje()
    }
  }

  async comenzarViaje() {
    await this.setTimer()
    if (this.state.sesion.viajeEnCurso) {
      this.sendGPSButton.props.onPress(); // Comenzar a enviar puntos GPS por defecto
    }
    console.log("comenzarviaje()", this.state.sesion.persona.dni + " id viaje:" + this.state.sesion.viajeEnCurso.id);
  }

  componentWillUnmount() {
    this.killTimer()
    NativeModules.GeoLocation.stopService()
  }

  render() {
    console.log("mapa pasajero sesion", this.state.sesion)
    return (
      <Container>
        <Header style={{ backgroundColor: '#1b0088' }}>
          <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <Text style={{ fontFamily: "OpenSans-Light", fontSize: 22, color: '#fff' }}>SST</Text>
          </View>
          <Body>
          </Body>
          <Right>
            {
              (this.state.sesion && this.state.sesion.viajeEnCurso) ?
                <Button transparent onPress={() => this.toggleTransmitirGPS()} ref={c => this.sendGPSButton = c}>
                  <Icon type='MaterialCommunityIcons' name={(this.state.transmitirGPS) ? 'map-marker' : 'map-marker-off'} />
                  {(this.state.transmitirGPS) ?
                    <View style={{ position: 'absolute', top: 10, right: 5, backgroundColor: 'green', width: 10, height: 10, borderRadius: 5 }} />
                    : null}
                </Button>
                : null
            }
          </Right>
        </Header>
        <View style={styles.containerMap}>
          <MapboxGL.MapView
            ref={(c) => this.map = c}
            centerCoordinate={this.state.centerCoordinate}
            zoomLevel={12}
            style={styles.containerMap}
            styleURL={MapboxGL.StyleURL.Light}
            showUserLocation={true}>
            {/*(viajeEnCurso) ? this.renderAnnotation(viajeEnCurso.viaje.pasajeros) : null*/}
            {(this.state.sesion && this.state.sesion.viajeEnCurso && this.state.sesion.viajeEnCurso.posChofer) ? this.renderPosChofer() : null}
          </MapboxGL.MapView>
          <LayoutMapaPasajero viajeEnCurso={(this.state.sesion && this.state.sesion.viajeEnCurso) ? this.state.sesion.viajeEnCurso : null}
            following={this.state.following}
            onPressFabChofer={() => this.onPressFabChofer()}
            onPressFabMyLocation={() => this.onPressFabMyLocation()}></LayoutMapaPasajero>
        </View>
      </Container>
    )
  }

  onPressFabMyLocation() {
    this.setState({ following: !this.state.following }, () => {
      if (this.state.following) {
        this.startFollowing()
      } else {
        this.stopFollowing()
      }
    })
  }

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

  stopFollowing() {
    if (this.idWatchPosition != null) {
      navigator.geolocation.clearWatch(this.idWatchPosition);
      this.idWatchPosition = null
      if (Platform.OS === 'android') ToastAndroid.showWithGravityAndOffset('Modo seguimiento desactivado', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
    }
  }

  onPressFabChofer() {
    if (this.state.sesion.viajeEnCurso.posChofer && this.state.sesion.viajeEnCurso.posChofer.length > 0) {
      const posChofer = this.state.sesion.viajeEnCurso.posChofer[this.state.sesion.viajeEnCurso.posChofer.length - 1]
      if (this.map) this.map.flyTo([Number(posChofer.longitud), Number(posChofer.latitud)], 1500);
    }
  }

  renderPosChofer() {
    annotationPosChofer = null
    recorridoLine = null
    const pos = this.state.sesion.viajeEnCurso.posChofer
    if (pos && pos.length > 0) {
      const posActual = pos[pos.length - 1]
      annotationPosChofer =
        <MapboxGL.PointAnnotation
          id={String(posActual.id)}
          key={String(posActual.id)}
          coordinate={[Number(posActual.longitud), Number(posActual.latitud)]}>
          <View style={styles.annotationContainerChofer}>
            <Icon
              name="car"
              style={{ fontSize: 32, color: '#fff' }}
            />
          </View>
          <MapboxGL.Callout title={moment.utc(posActual.fecha_hora_arribo).tz(Const.tz).format('HH:mm:ss') + " hs."} />
        </MapboxGL.PointAnnotation>

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
        <MapboxGL.ShapeSource id="smileyFaceSource" key="smileyFaceSource" shape={jsonRecorrido}>
          <MapboxGL.LineLayer
            id='recorridoLine'
            style={layerStyles.recorridoLine} />
        </MapboxGL.ShapeSource>


    }
    return [annotationPosChofer, recorridoLine]
  }

  renderAnnotation(destinos) {
    destinosAnotations = []
    destinos.forEach(destino => {
      destinosAnotations.push(
        <MapboxGL.PointAnnotation
          key={'' + destino.pasajero_dni}
          id={'' + destino.pasajero_dni}
          coordinate={[Number(destino.pasajero_longitud), Number(destino.pasajero_latitud)]}>

          <View style={styles.annotationContainer}>
            <View style={styles.annotationFill} />
          </View>
          <MapboxGL.Callout title={destino.pasajero_domicilio} />
        </MapboxGL.PointAnnotation>
      )
    });
    return (
      destinosAnotations
    )
  }

  toggleTransmitirGPS() {
    this.setState({ transmitirGPS: !this.state.transmitirGPS },
      () => {
        if (this.state.transmitirGPS) {
          NativeModules.GeoLocation.startService(this.state.sesion.persona.dni, this.state.sesion.viajeEnCurso.id, false, Const.FRECUENCIA_BAJA)
          //ToastAndroid.showWithGravityAndOffset('Comenzando a transmitir tu posición GPS.', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
        }
        else {
          NativeModules.GeoLocation.stopService()
          //ToastAndroid.showWithGravityAndOffset('Dejaste de transmitir tu posición GPS.', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
        }
      })
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
      Alert.alert(
        'Error interno',
        'Error al obtener la posición del chofer.',
        [
          { text: 'Ok', onPress: () => null }
        ],
        { cancelable: true }
      )
      console.log("No se pudo obtener la posición del chofer.", error);
    }
    return posChofer;
  }

  async getViajeEnCursoPersona(pasajero_dni) {
    var viajeEnCurso = null;
    try {
      const response = await fetch(Const.webURLPublica + '/getViajeEnCursoPersona', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          persona_dni: pasajero_dni
        }),
      })
      viajeEnCurso = (await response.json()).viajeEnCursoPersona;
      console.log("getViajeEnCursoPersona()", viajeEnCurso)
    } catch (error) {
      Alert.alert(
        'Error interno',
        'Error al obtener el viaje en curso.',
        [
          { text: 'Ok', onPress: () => null }
        ],
        { cancelable: true }
      )
      console.log("No se pudo obtener el viaje en curso.", error);
    }
    return viajeEnCurso;
  }
}

const layerStyles = MapboxGL.StyleSheet.create({
  recorridoLine: {
    lineColor: '#b30f3b',
    lineWidth: 2,
    lineOpacity: 0.7,
    lineJoin: MapboxGL.LineJoin.Round,
    lineCap: MapboxGL.LineCap.Round,
    lineDasharray: [4, 2],
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
  annotationContainerChofer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(179,15,59,0.7)',
    borderRadius: 24,
    borderColor: 'rgba(179,15,59,0.9)',
    borderWidth: 1
  },
  annotationContainerChoferHistorico: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(179,15,59,0.4)',
    borderRadius: 5,
    borderColor: 'rgba(179,15,59,0.6)',
    borderWidth: 1
  },
  annotationFillChofer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#b30f3b',
    transform: [{ scale: 0.6 }],
  },
});
