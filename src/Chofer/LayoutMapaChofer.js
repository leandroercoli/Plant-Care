import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { View, Icon, Fab, Text, Card, CardItem, Button, Spinner } from 'native-base';
import moment from 'moment-timezone';
import CardPasajeroOverMap from '../components/CardPasajeroOverMap'
import ListaEnfocable from '../components/ListaEnfocable'
import Sesion from '../persistente/Sesion';
import Const from '../persistente/Const'

export default class LayoutMapaChofer extends Component {
  constructor(props) {
    super(props);

    this.listaenfocable = React.createRef(); //referencia al scrollview

    this.state = {
      pasajeroFocus: null,
      proximoViaje: null
    };
  }

  async componentDidMount() {
    this.mounted = true; // para evitar que se actualice el estado sin que esté montado el componenente (por ej. despues de navegar a otra pantalla)
    this.refreshProximoViaje();
  }

  componentWillUnmount() {
    this.mounted = false
  }

  componentDidUpdate(prevProps) {
    if (this.props.viajeEnCurso !== prevProps.viajeEnCurso) {
      this.refreshProximoViaje()
    }
  }

  async refreshProximoViaje() {
    const storagedata = await Sesion.getStorageData()
    if (storagedata) {
      const viajes = await this.getViajesProgramados(storagedata.persona.dni)
      if (this.mounted && viajes && viajes.viajes)
        this.setState({
          proximoViaje: viajes.viajes[0],
        })
    }
  }

  render() {
    return (
      [
        <Fab
          key={'fabSeguimiento'}
          active={true}
          direction="up"
          containerStyle={{}}
          style={((this.props.following) ? { backgroundColor: '#b30f3b' } : { backgroundColor: 'transparent' })}
          position="bottomRight"
          onPress={() => {
            this.props.onPressFabMyLocation()
          }} >
          <Icon type="Feather" name="crosshair" style={{ fontSize: 32, color: (!this.props.following) ? '#b30f3b' : '#fff', position: 'absolute', bottom: (!this.props.following) ? '15%' : null, left: (!this.props.following) ? '23%' : null }} />
          {
            (this.props.viajeEnCurso && this.props.viajeEnCurso.viaje && this.props.viajeEnCurso.viaje.viaje) ?
              ((this.props.viajeEnCurso.viaje.viaje.viaje_sentido_codigo == "IN") ?
                [
                  this.renderButtonsPasajeros(),
                  this.renderButtonAeropuerto()
                ]
                : [
                  this.renderButtonAeropuerto(),
                  this.renderButtonsPasajeros()
                ])
              : null
          }
        </Fab >,
        (this.props.viajeEnCurso && this.props.viajeEnCurso.viaje && this.props.viajeEnCurso.viaje.viaje) ?
          (
            [<View key={'cardPasajeroFocus'} style={{
              flex: 1,
              position: 'absolute',
              bottom: Dimensions.get('window').height * 0.1,
              left: 5,
              width: Dimensions.get('window').width * 0.75
            }}>
              <CardPasajeroOverMap pasajeroFocus={this.state.pasajeroFocus} visible={this.state.pasajeroFocus ? true : false} onClose={() => this.closePasajeroFocus()} />
            </View>,
            /*
            (this.props.viajeEnCurso && this.props.viajeEnCurso.viaje && this.props.viajeEnCurso.viaje.viaje && this.props.viajeEnCurso.viaje.viaje.viaje_estado_codigo < 6) ?
              <View key={'listaTReal'} style={{
                width: Dimensions.get('window').width * 0.82, height: Dimensions.get('window').height * 0.2,
                position: 'absolute', top: 0, left: Dimensions.get('window').width * 0.02
              }}>
                <Card style={{ flex: 1, paddingLeft: 15, paddingRight: 15, paddingTop: 5 }}>
                  <ListaEnfocable style={{ backgroundColor: 'red' }} items={this.props.viajeEnCurso.recorridoViaje} ref={(c) => { this.listaenfocable = c }} refreshing={this.props.refreshing} />
                </Card>
              </View>
              : null
              ,
            */
            <View key={'boton'} style={{ position: 'absolute', bottom: Dimensions.get('window').height * 0.035, left: 15 }}>
              {
                (this.props.viajeEnCurso.viaje.viaje && this.props.viajeEnCurso.viaje.viaje.viaje_estado_codigo == 1) ?
                  (
                    <Button transparent
                      onPress={() => { this.props.onComenzarViajePress() }}
                      style={{ backgroundColor: '#1b0088', width: Dimensions.get('window').width * 0.5, justifyContent: 'center', borderRadius: 15 }}>
                      <Text style={{ color: '#fff' }}>Comenzar viaje</Text>
                    </Button>
                  ) :
                  /* Si tengo un viaje, no está finalizado y (es IN y está en destino ó es OUT y está en destino y todos los pasajeros están en destino), mostrar el boton de finalizar viaje. */
                  (this.props.viajeEnCurso.viaje.viaje && this.props.viajeEnCurso.viaje.viaje.viaje_estado_codigo > 6) ?
                    (((this.props.viajeEnCurso.viaje.viaje.viaje_sentido_codigo == "IN" && this.props.viajeEnCurso.viaje.viaje.viaje_estado_codigo == 14) ||
                      (this.props.viajeEnCurso.viaje.viaje.viaje_sentido_codigo == "OUT" && this.props.viajeEnCurso.viaje.viaje.viaje_estado_codigo == 13 &&
                        this.props.viajeEnCurso.viaje.pasajeros.every(function checkEnDestino(pasajero) {
                          return pasajero.pasajero_estado_codigo == 6;
                        }))) ?
                      (
                        <Button transparent
                          onPress={() => { this.props.onFinalizarViajePress() }}
                          style={{ backgroundColor: '#1b0088', width: Dimensions.get('window').width * 0.5, justifyContent: 'center', borderRadius: 15 }}>
                          <Text style={{ color: '#fff' }}>Finalizar viaje</Text>
                        </Button>
                      ) :
                      ((this.props.debug) ?
                        <Button transparent
                          onPress={() => { this.props.onCancelarViajePress() }}
                          style={{ backgroundColor: '#1b0088', width: Dimensions.get('window').width * 0.5, justifyContent: 'center', borderRadius: 15 }}>
                          <Text style={{ color: '#fff' }}>Cancelar</Text>
                        </Button>
                        : null
                      ))
                    : null
              }
            </View>]
          )
          : (
            <Card key={"cardProxViaje"}
              style={{ position: 'absolute', top: 0, left: Dimensions.get('window').width * 0.02, width: Dimensions.get('window').width * 0.82 }}>
              <CardItem style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 5 }}>
                  {
                    (this.state.proximoViaje) ?
                      (
                        <Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>Tu próximo viaje es el día {moment.utc(this.state.proximoViaje.viaje.fecha_hora_inicio).tz(Const.tz).format('DD/MM')}
                          {(this.state.proximoViaje.viaje.viaje_sentido_codigo == "IN") ?
                            (
                              ", hacia " + this.state.proximoViaje.viaje.aeropuerto_codigo_iata + ". " + ((this.state.proximoViaje.pasajeros.length > 1) ? this.state.proximoViaje.pasajeros.length + " pasajeros deben presentarse en el aeropuerto antes de las " : this.state.proximoViaje.pasajeros.length + " pasajero debe presentarse en el aeropuerto antes de las ") + moment.utc(this.state.proximoViaje.viaje.fecha_hora_fin).tz(Const.tz).format('HH:mm') + " hs."
                            )
                            : (
                              ", desde " + this.state.proximoViaje.viaje.aeropuerto_codigo_iata + ". " + ((this.state.proximoViaje.pasajeros.length > 1) ? this.state.proximoViaje.pasajeros.length + " pasajeros estarán esperándote en el aeropuerto a partir de las " : this.state.proximoViaje.pasajeros.length + " pasajero estará esperándote en el aeropuerto a partir de las ") + moment.utc(this.state.proximoViaje.viaje.fecha_hora_inicio).tz(Const.tz).format('HH:mm') + " hs."
                            )
                          }
                        </Text>

                      )
                      : <Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>Buscando próximos viajes...</Text>
                  }
                </View>
              </CardItem>
            </Card>
          )
      ]
    )
  }

  renderButtonAeropuerto() {
    const estilo = ((this.props.viajeEnCurso.viaje.viaje.viaje_sentido_codigo == "IN" && this.props.viajeEnCurso.viaje.viaje.viaje_estado_codigo == 14)
      || (this.props.viajeEnCurso.viaje.viaje.viaje_sentido_codigo == "OUT" && (this.props.viajeEnCurso.viaje.viaje.viaje_estado_codigo > 5 && this.props.viajeEnCurso.viaje.viaje.viaje_estado_codigo != 10))) ?
      styles.aeropuertoIconEstadoListo
      : styles.aeropuertoIconEstadoPendiente;
    return (
      <Button
        key={"fabAeropuerto"}
        transparent
        onPress={() => this.props.onPressFabAeropuertoLocation(this.props.viajeEnCurso.viaje.viaje)} style={[{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, backgroundColor: '#1b0088' }, estilo]}>
        <View style={{ width: 40, height: 40, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Icon
            type="Entypo"
            name="aircraft-take-off"
            style={{ fontSize: 32, color: '#fff' }}
          />
        </View>
      </Button>
    )
  }

  renderButtonsPasajeros() {
    let i = 1
    return this.props.viajeEnCurso.viaje.pasajeros.map((pasajero) => {
      return (
        <Button transparent
          key={pasajero.pasajero_dni}
          id={pasajero.pasajero_dni}
          onPress={() => this.onPressFabPasajeros(pasajero)} style={[{ width: 40, height: 40, borderRadius: 20, borderWidth: 1 },
          (pasajero.pasajero_estado_codigo == 3) ? styles.pasajeroIconEstadoAsignado
            : (pasajero.pasajero_estado_codigo == 4) ? styles.pasajeroIconEstadoOrigen
              : (pasajero.pasajero_estado_codigo == 5) ? styles.pasajeroIconEstadoVehiculo
                : (pasajero.pasajero_estado_codigo == 6) ? styles.pasajeroIconEstadoDestino : styles.pasajeroIconEstadoIndefinido]}>
          <View style={{ width: 40, height: 40, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
            {(this.props.viajeEnCurso.viaje.pasajeros.length > 1) ?
              <Text style={{ position: 'absolute', top: 0, right: 5, color: '#fff' }}>{i++}</Text>
              : null}
            <Image source={require('./../img/no-user.png')} style={{ tintColor: '#fff', width: 20, height: 20, }} />
          </View>
        </Button>
      )
    })
  }

  onPressFabPasajeros(pasajero) {
    if (!this.state.pasajeroFocus) {
      this.setState({ pasajeroFocus: pasajero });
      this.props.handleFabPasajeroPress(pasajero)
    } else {
      this.setState({ pasajeroFocus: null });
    }
  }

  onPressFabMainPasajeros(pasajeros) {
    this.props.handleFabMainPasajerosPress(pasajeros)
  }

  closePasajeroFocus() {
    this.setState({ pasajeroFocus: null });
  }

  async getViajesProgramados(conductor_dni) {
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
      console.log("getViajesProgramados response", viajes)
    } catch (error) {
      Alert.alert(
        'Error interno',
        'Error al obtener los viajes programados.',
        [
          { text: 'Ok', onPress: () => null }
        ],
        { cancelable: true }
      )
      console.log("No se pudieron obtener los viajes programados para el conductor.", error);
    }
    return viajes;
  }

}


const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(255, 193, 7,0.7)'
    //borderColor: 'rgba(76, 175, 80,0.9)', // verde
    // backgroundColor: 'rgba(76, 175, 80,0.7)'
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
    //backgroundColor: 'rgba(255, 193, 7,0.7)'
    borderColor: 'rgba(76, 175, 80,0.9)',  // verde
    backgroundColor: 'rgba(76, 175, 80,0.7)'
  },
});


