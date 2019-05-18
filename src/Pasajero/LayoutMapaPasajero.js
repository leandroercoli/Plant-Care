import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { View, Icon, Fab, Text, Card, CardItem, Button } from 'native-base';
import moment from 'moment-timezone';

import Sesion from '../persistente/Sesion';
import Const from '../persistente/Const'

export default class LayoutMapaPasajero extends Component {
    constructor(props) {
        super(props);

        this.texto = "texto"

        this.state = {
            viajeEnCurso: null,
            vuelos: null,
            viajesvuelos: null
        };
    }

    async componentDidMount() {
        this.refreshVuelosViajesPasajero()
    }

    async refreshVuelosViajesPasajero() {
        const storagedata = await Sesion.getStorageData()
        if (storagedata) {
            const viajesvuelos = await this.getVuelosViajesPasajero(storagedata.persona.dni)
            this.setState({
                vuelos: viajesvuelos.vuelos,
                viajesvuelos: viajesvuelos.viajesvuelos
            })
        }
    }
    render() {
        return ([
            (this.props.viajeEnCurso) ?
                <Fab
                    key={'fabChofer'}
                    style={{ backgroundColor: '#b30f3b' }}
                    position="bottomLeft"
                    onPress={() => { this.props.onPressFabChofer() }}>
                    <Icon
                        name="car"
                        style={{ fontSize: 32, color: '#fff' }}
                    />
                </Fab>
                : null,
            <Fab
                key={'fabMyLocation'}
                style={(this.props.following) ? { backgroundColor: 'rgba(27, 0, 136,1)' } : { backgroundColor: 'transparent' }}
                position="bottomRight"
                onPress={() => { this.props.onPressFabMyLocation() }}>
                <Icon
                    type='Feather' name='user'
                    style={(this.props.following) ? { color: '#fff', fontSize: 30 } : { color: 'rgb(27, 0, 136)', fontSize: 30 }}
                />
            </Fab>,
            <Card
                key={'cardInfo'}
                style={{ width: Dimensions.get('window').width * 0.82, position: 'absolute', top: 0, left: Dimensions.get('window').width * 0.02 }}>
                <CardItem style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 5 }}>
                        {
                            (!this.props.viajeEnCurso) ?
                                (
                                    (this.state.vuelos && this.state.vuelos.length > 0) ?
                                        (
                                            <Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>Tu próximo vuelo es {this.state.vuelos[0].vuelo_codigo}, el día {moment.utc(this.state.vuelos[0].vuelo_fecha_hora_partida).tz(Const.tz).format('DD/MM')}{(this.state.vuelos[0].vuelo_aeropuerto_codigo_iata_origen) ? (", desde " + this.state.vuelos[0].vuelo_aeropuerto_codigo_iata_origen) : null}{(this.state.vuelos[0].vuelo_aeropuerto_codigo_iata_destino) ? (", hacia " + this.state.vuelos[0].vuelo_aeropuerto_codigo_iata_destino) : null}, con hora de presentación {moment.utc(this.state.vuelos[0].vuelo_fecha_hora_presentacion).tz(Const.tz).format('HH:mm')} hs.</Text>
                                        )
                                        : <Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>Buscando próximos vuelos...</Text>
                                )
                                : this.renderEstadoViajeEnCurso()
                        }
                    </View>
                </CardItem>
            </Card>
        ])
    }

    renderEstadoViajeEnCurso() {
        let viaje = this.props.viajeEnCurso;
        return (
            (viaje.viaje_estado_codigo == 9 || viaje.viaje_estado_codigo == 10) ?
                <Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>{viaje.conductor_nombre} {viaje.conductor_apellido} está en camino {(viaje.viaje_sentido_codigo == "IN") ? "a un domicilio" : "a " + viaje.aeropuerto_codigo_iata}.</Text>
                : (viaje.viaje_estado_codigo == 7 || viaje.viaje_estado_codigo == 8) ?
                    <Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>{viaje.conductor_nombre} {viaje.conductor_apellido} está en {(viaje.viaje_sentido_codigo == "IN") ? "un domicilio" : viaje.aeropuerto_codigo_iata}.</Text>
                    : (viaje.viaje_estado_codigo == 11 || viaje.viaje_estado_codigo == 12) ?
                        <Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>{viaje.conductor_nombre} {viaje.conductor_apellido} está en camino a {(viaje.viaje_sentido_codigo == "IN") ? viaje.aeropuerto_codigo_iata : "un domicilio"}.</Text>
                        : (viaje.viaje_estado_codigo == 13 || viaje.viaje_estado_codigo == 14) ?
                            <Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>{viaje.conductor_nombre} {viaje.conductor_apellido} está en {(viaje.viaje_sentido_codigo == "IN") ? viaje.aeropuerto_codigo_iata : "un domicilio"}.</Text>
                            : null
        )
    }

    onPressFabPasajeros(pasajero) {
        if (!this.state.pasajeroFocus) {
            this.setState({ pasajeroFocus: pasajero });
            this.props.handleFabPasajeroPress(pasajero)
        } else {
            this.setState({ pasajeroFocus: null });
        }
    }

    onPressFabMainAnnotations(pasajeros) {
        this.props.handleFabMainAnnotationsPress(pasajeros)
    }

    async getVuelosViajesPasajero(persona_dni) {
        var vuelosViajes = null;
        try {
            const response = await fetch(Const.webURLPublica + '/getVuelosViajesPasajero', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    persona_dni: persona_dni,
                }),
            })
            vuelosViajes = await response.json();
            console.log("getVuelosViajesPasajero()", vuelosViajes)
        } catch (error) {
            Alert.alert(
                'Error interno',
                'Error al obtener los viajes del pasajero.',
                [
                    { text: 'Ok', onPress: () => null }
                ],
                { cancelable: true }
            )
            console.log("No se pudieron obtener los vuelos y viajes para el pasajero.", error);
        }
        return vuelosViajes;
    }
}