import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ScrollView, Alert, NativeModules, ToastAndroid } from 'react-native';
import { View, Button, Icon, Text, Textarea } from 'native-base';
import moment from 'moment-timezone';
import Triangulos from './Triangulos'
import Const from './../persistente/Const'
import Sesion from '../persistente/Sesion';
import Log from '../persistente/Log';

export default class Notificacion extends Component {
	constructor(props) {
		super(props);

		this.state = {
			modalVisible: false,
			calificacion: 1,
			comentario: ""
		};
	}

	show() {
		this.setState({
			modalVisible: true,
		})
	}
	hide() {
		this.setState({
			modalVisible: false,
		})
	}

	calificar(puntaje) {
		this.setState({ calificacion: puntaje });
	}
	
	render() {
		let notificacion = this.props.notificacion;
		if (notificacion && notificacion.tipo && notificacion.datos) {
			let notificacion_datos = JSON.parse(notificacion.datos)
			let notificacion_tipo = notificacion.tipo
			console.log("notificacion tipo", notificacion_tipo)
			console.log("notificacion_datos", notificacion_datos)
			if(notificacion_tipo == 'nuevo_viaje')
				this.comenzarTransmisionGPSChofer(notificacion_datos.id)
			return (notificacion_tipo == 'nuevo_viaje') ?
				this.renderNotificacionChoferNuevoViaje(notificacion_datos) : (
					(notificacion_tipo == 'calificacion_pasajero') ?
						this.renderNotificacionPasajeroCalificacion(notificacion_datos) : (
							(notificacion_tipo == 'inicio_viaje_pasajero') ? (
								this.renderNotificacionPasajeroViajeIniciado(notificacion_datos)
							) : (notificacion_tipo == 'en_domicilio_pasajero') ? (
								this.renderNotificacionPasajeroEnDomicilio(notificacion_datos)
							) : null
						)
				)
		}
		return null;
	}

	renderNotificacionChoferNuevoViaje(notificacion_datos) {
		let mapboxToken = this.props.mapboxToken;
		return (
			<Modal
				animationType="slide"
				transparent={false}
				visible={this.state.modalVisible}
				onRequestClose={() => {
					this.hide();
				}}>
				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff' }}>
					<View style={{ height: 40, flexDirection: 'row', paddingLeft: 15, alignItems: 'flex-end', backgroundColor: 'rgb(179,15,59)' }}>
						<Text style={styles.pantallaTitle}>Nuevo viaje</Text>
					</View>
					<View style={{ flex: 0.5, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' }}>
						<Triangulos up={false} red={true} />
					</View>
					<View style={{ flex: 2, backgroundColor: 'transparent' }}>
						<ScrollView>
							<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: 'transparent' }}>
								<View style={{ flex: 0.15, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
									<Icon
										type="EvilIcons"
										name="location"
										style={styles.modalIcon}
									/>
								</View>
								<View style={{ flex: 0.85, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', paddingRight: 15 }}>
									{(notificacion_datos.viaje_sentido_codigo == "IN") ?
										(
											<Text style={styles.viajeTitulo}>{moment(notificacion_datos.fecha_hora_inicio).format('DD/MM')} - Viaje hacia {notificacion_datos.aeropuerto_codigo_iata}. {(notificacion_datos.personas_viaje.length > 1) ? notificacion_datos.personas_viaje.length + " pasajeros deben presentarse en el aeropuerto antes de las " : notificacion_datos.personas_viaje.length + " pasajero debe presentarse en el aeropuerto antes de las "}{moment(notificacion_datos.fecha_hora_fin).format('HH:mm')} hs.</Text>
										)
										: (
											<Text style={styles.viajeTitulo}>{moment(notificacion_datos.fecha_hora_inicio).format('DD/MM')} - Viaje desde {notificacion_datos.aeropuerto_codigo_iata}. {(notificacion_datos.personas_viaje.length > 1) ? notificacion_datos.personas_viaje.length + " pasajeros estarán esperándote en el aeropuerto a partir de las " : notificacion_datos.personas_viaje.length + " pasajero estará esperándote en el aeropuerto a partir de las "}{moment(notificacion_datos.fecha_hora_inicio).format('HH:mm')} hs.</Text>
										)
									}
									{
										(notificacion_datos.viaje_sentido_codigo == "IN") ?
											notificacion_datos.personas_viaje.map((viaje_pasajero) => {
												return (
													<View key={viaje_pasajero.persona_dni}>
														<Text>
															<Text style={styles.viajePasajero}>{viaje_pasajero.razon_social} estará esperando, a partir de las </Text>
															<Text style={styles.textBold}>{moment(viaje_pasajero.fecha_hora_inicio).format('HH:mm')} hs</Text>
															<Text style={styles.viajePasajero}>, en </Text>
															<Text style={styles.textBold}>{viaje_pasajero.domicilio_completo}</Text>
															<Text style={styles.viajePasajero}>.</Text>
														</Text>
														<View style={styles.separadorPasajeros}></View>
													</View>
												)
											}) :
											notificacion_datos.personas_viaje.map((viaje_pasajero) => {
												return (
													<View key={viaje_pasajero.persona_dni}>
														<Text>
															<Text style={styles.viajePasajero}>{viaje_pasajero.razon_social} espera estar en </Text>
															<Text style={styles.textBold}>{viaje_pasajero.domicilio_completo}</Text>
															<Text style={styles.viajePasajero}> a las </Text>
															<Text style={styles.textBold}>{moment(viaje_pasajero.fecha_hora_fin).format('HH:mm')} hs</Text>
															<Text style={styles.viajePasajero}>.</Text>
														</Text>
														<View style={styles.separadorPasajeros}></View>
													</View>
												)
											})
									}
								</View>
							</View>
						</ScrollView>
					</View>
					<View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').width * 9 / 16, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#fff' }}>
						<TouchableOpacity onPress={() => {	
							this.hide()
						}}>
							<Image
								style={styles.modalImage}
								source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v9/static/' + Number(notificacion_datos.personas_viaje[0].longitud) + ', ' + Number(notificacion_datos.personas_viaje[0].latitud) + ',14.0,0,0/640x360@2x?access_token=' + mapboxToken }}
							/>
							<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
								<Icon
									type="EvilIcons"
									name="check"
									style={[styles.modalIcon, { fontSize: 72, marginTop: -10 }]}
								/>
								<Text style={styles.viajeTitulo} >Aceptar</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		)
	}

	async comenzarTransmisionGPSChofer(viaje_id){
		NativeModules.GeoLocation.startService(Sesion.getDNI(), viaje_id, true, Const.FRECUENCIA_BAJA);
		//ToastAndroid.showWithGravityAndOffset('Tu posición GPS está siendo transmitida.', ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, Dimensions.get('window').height * 0.3);
	}

	renderNotificacionPasajeroCalificacion(notificacion_datos) {
		return (
			<Modal
				animationType="slide"
				transparent={false}
				visible={this.state.modalVisible}
				onRequestClose={() => {
					null
				}}>
				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff' }}>
					<View style={{ height: 40, flexDirection: 'row', paddingLeft: 15, alignItems: 'flex-end', backgroundColor: 'rgb(179,15,59)' }}>
						<Text style={styles.pantallaTitle}>Calificá tu viaje</Text>
					</View>
					<View style={{ flex: 0.5, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' }}>
						<Triangulos up={false} red={true} />
					</View>
					<View style={{ flex: 3, flexDirection: 'column', justifyContent: 'center', backgroundColor: 'transparent' }}>
						<ScrollView>
							<View style={{ height: 150, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginRight: 20 }}>
								{
									(notificacion_datos.datos_pasajero.viaje_sentido_codigo == "IN") ?
										(
											<Text style={[styles.viajeTitulo]}>Calificá tu viaje con {notificacion_datos.datos_pasajero.conductor_nombre} {notificacion_datos.datos_pasajero.conductor_apellido} hacia {notificacion_datos.datos_pasajero.aeropuerto_codigo_iata} (vuelo {notificacion_datos.datos_pasajero.vuelo_codigo}) del día {moment(notificacion_datos.datos_pasajero.fecha_hora_fin).format('DD/MM')}.</Text>
										)
										: (
											<Text style={[styles.viajeTitulo]}>Calificá tu viaje con {notificacion_datos.datos_pasajero.conductor_nombre} {notificacion_datos.datos_pasajero.conductor_apellido} desde {notificacion_datos.datos_pasajero.aeropuerto_codigo_iata} (vuelo {notificacion_datos.datos_pasajero.vuelo_codigo}) del día {moment(otificacion_datos.datos_pasajero.fecha_hora_fin).format('DD/MM')}.</Text>
										)
								}
							</View>
							<View style={{ height: 100, width: '100%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 25 }}>
								<TouchableOpacity onPress={() => this.calificar(1)}>
									<Icon
										type="EvilIcons"
										name="star"
										style={[styles.calificacionStar, (this.state.calificacion > 0) ? styles.calificacionActivo : null]}
									/>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => this.calificar(2)}>
									<Icon
										type="EvilIcons"
										name="star"
										style={[styles.calificacionStar, (this.state.calificacion > 1) ? styles.calificacionActivo : null]}
									/>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => this.calificar(3)}>
									<Icon
										type="EvilIcons"
										name="star"
										style={[styles.calificacionStar, (this.state.calificacion > 2) ? styles.calificacionActivo : null]}
									/>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => this.calificar(4)}>
									<Icon
										type="EvilIcons"
										name="star"
										style={[styles.calificacionStar, (this.state.calificacion > 3) ? styles.calificacionActivo : null]}
									/>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => this.calificar(5)}>
									<Icon
										type="EvilIcons"
										name="star"
										style={[styles.calificacionStar, (this.state.calificacion > 4) ? styles.calificacionActivo : null]}
									/>
								</TouchableOpacity>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
								<Textarea rowSpan={5} bordered placeholder="Enviá un comentario ..." style={{ width: '90%' }} onChangeText={(text) => { this.setState({ comentario: text }) }} />
							</View>
							<View style={{ height: 100, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
								<Button transparent iconRight onPress={() => this.enviarCalificacion(notificacion_datos.datos_pasajero.id, notificacion_datos.pasajero_dni).then(() => this.hide())} style={{ backgroundColor: 'rgba(27, 0, 136,0.9)' }} >
									<Text style={{ fontFamily: "OpenSans-Light", color: '#fff' }}>Enviar</Text>
									<Icon type="EvilIcons" name='chevron-right' style={{ color: '#fff' }} />
								</Button>
							</View>
						</ScrollView>

					</View>
				</View>
			</Modal>
		);
	}

	renderNotificacionPasajeroViajeIniciado(notificacion_datos) {
		return (
			<Modal
				animationType="slide"
				transparent={false}
				visible={this.state.modalVisible}
				onRequestClose={() => {
					null
				}}>
				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff' }}>
					<View style={{ height: 40, flexDirection: 'row', paddingLeft: 15, alignItems: 'flex-end', backgroundColor: 'rgb(27, 0, 136)' }}>
						<Text style={styles.pantallaTitle}>Viaje iniciado</Text>
					</View>
					<View style={{ flex: 0.5, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' }}>
						<Triangulos up={false} red={false} />
					</View>
					<View style={{ flex: 3, flexDirection: 'column', justifyContent: 'center', backgroundColor: 'transparent' }}>
						<View style={{ flex: 0.85, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginRight: 20 }}>
							{
								(notificacion_datos.datos_pasajero.viaje_sentido_codigo == "IN") ?
									(
										<Text style={[styles.viajeTitulo, { textAlign: 'center' }]}>{notificacion_datos.datos_pasajero.conductor_nombre} {notificacion_datos.datos_pasajero.conductor_apellido}  (patente {notificacion_datos.datos_pasajero.vehiculo_patente}) está en camino a {notificacion_datos.datos_pasajero.pasajero_domicilio_completo}, para llevarte a {notificacion_datos.datos_pasajero.aeropuerto_codigo_iata}. La hora de presentación para tu vuelo {notificacion_datos.datos_pasajero.vuelo_codigo} es {moment.utc(notificacion_datos.datos_pasajero.fecha_hora_fin).tz(Const.tz).format('HH:mm')} hs.</Text>
									)
									: (
										<Text style={[styles.viajeTitulo, { textAlign: 'center' }]}>{notificacion_datos.datos_pasajero.conductor_nombre} {notificacion_datos.datos_pasajero.conductor_apellido}  (patente {notificacion_datos.datos_pasajero.vehiculo_patente}) está en camino a {notificacion_datos.datos_pasajero.aeropuerto_codigo_iata}, para llevarte a {notificacion_datos.datos_pasajero.pasajero_domicilio_completo}.</Text>
									)
							}
						</View>
						<View style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
							<Button transparent iconRight onPress={() => this.hide()} style={{ backgroundColor: 'rgba(27, 0, 136,0.9)' }} >
								<Text style={{ fontFamily: "OpenSans-Light", color: '#fff' }}>Aceptar</Text>
								<Icon type="EvilIcons" name='chevron-right' style={{ color: '#fff' }} />
							</Button>
						</View>
					</View>
				</View>
			</Modal >
		);
	}

	renderNotificacionPasajeroEnDomicilio(notificacion_datos) {
		return (
			<Modal
				animationType="slide"
				transparent={false}
				visible={this.state.modalVisible}
				onRequestClose={() => {
					null
				}}>
				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff' }}>
					<View style={{ height: 40, flexDirection: 'row', paddingLeft: 15, alignItems: 'flex-end', backgroundColor: 'rgb(27, 0, 136)' }}>
						<Text style={styles.pantallaTitle}>En domicilio</Text>
					</View>
					<View style={{ flex: 0.5, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' }}>
						<Triangulos up={false} red={false} />
					</View>
					<View style={{ flex: 3, flexDirection: 'column', justifyContent: 'center', backgroundColor: 'transparent' }}>
						<View style={{ flex: 0.85, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginRight: 20 }}>
							{
								(notificacion_datos.datos_pasajero.viaje_sentido_codigo == "IN") ?
									(
										<Text style={[styles.viajeTitulo, { textAlign: 'center' }]}>{notificacion_datos.datos_pasajero.conductor_nombre} {notificacion_datos.datos_pasajero.conductor_apellido}  (patente {notificacion_datos.datos_pasajero.vehiculo_patente}) ya está en tu domicilio ({notificacion_datos.datos_pasajero.pasajero_domicilio_completo}) para llevarte a {notificacion_datos.datos_pasajero.aeropuerto_codigo_iata}.</Text>
									)
									: (
										<Text style={[styles.viajeTitulo, { textAlign: 'center' }]}>{notificacion_datos.datos_pasajero.conductor_nombre} {notificacion_datos.datos_pasajero.conductor_apellido}  (patente {notificacion_datos.datos_pasajero.vehiculo_patente}) ya está en {notificacion_datos.datos_pasajero.aeropuerto_codigo_iata} para llevarte a {notificacion_datos.datos_pasajero.pasajero_domicilio_completo}.</Text>
									)
							}
						</View>
						<View style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
							<Button transparent iconRight onPress={() => this.hide()} style={{ backgroundColor: 'rgba(27, 0, 136,0.9)' }} >
								<Text style={{ fontFamily: "OpenSans-Light", color: '#fff' }}>Aceptar</Text>
								<Icon type="EvilIcons" name='chevron-right' style={{ color: '#fff' }} />
							</Button>
						</View>
					</View>
				</View>
			</Modal >
		);
	}

	async enviarCalificacion(viaje_id, pasajero_dni) {
		console.log("Calificacion enviada: ", this.state.calificacion, this.state.comentario)

		var db_result = null;
		try {
			const response = await fetch(Const.webURLPublica + '/calificarViaje', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					viaje_id: viaje_id,
					persona_dni_pasajero: pasajero_dni,
					puntaje: this.state.calificacion,
					mensaje: this.state.comentario
				}),
			})
			db_result = await response.json();
			console.log("enviarCalificacion()", db_result)
		} catch (error) {
			Alert.alert(
				'Error interno',
				'Error al enviar la calificación del viaje.',
				[
					{ text: 'Ok', onPress: () => null }
				],
				{ cancelable: true }
			)
			Log.log(-1, -1, "Error: No se pudo enviar la calificación para el viaje (pasajero " + pasajero_dni + ", viaje " + viaje_id +"). " + error.message)
		}
		return db_result;
	}
}


const styles = StyleSheet.create({
	pantallaTitle: {
		fontFamily: "OpenSans-Regular",
		fontSize: 22,
		color: '#fff',
	},
	modalImage: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').width * 9 / 16,
		borderWidth: 1.5,
		borderColor: '#cfd8dc'
	},
	viajeTitulo: {
		fontFamily: "OpenSans-Light",
		fontSize: 20,
		color: '#2b2b2b',
		marginBottom: 5
	},
	viajePasajero: {
		fontFamily: "OpenSans-Light",
		fontSize: 16,
		color: '#2b2b2b',
	},
	textBold: {
		fontFamily: "OpenSans-Regular",
	},
	itemIcon: {
		fontSize: 34,
		color: '#2b2b2b'
	},
	calificacionStar: {
		fontSize: 48,
		color: '#b1b1b1'
	},
	calificacionActivo: {
		fontSize: 58,
		color: 'rgb(179,15,59)',
	},
	separadorFechas: {
		width: '60%',
		height: 2,
		backgroundColor: '#9e9e9e',
		marginTop: 10,
		marginBottom: 15,
		marginRight: '20%',
		marginLeft: '20%'
	},
	separadorPasajeros: {
		height: 2,
		width: '75%',
		backgroundColor: '#f5f5f5',
		marginTop: 10,
		marginBottom: 10,
	},
	modalIcon: {
		color: '#424242',
		fontSize: 48,
	}
});
