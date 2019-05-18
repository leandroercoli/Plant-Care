import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ScrollView, RefreshControl, Alert } from 'react-native';
import { View, Button, Icon, Text, Textarea, Container, Header, Left, Right, Body } from 'native-base';
import moment from 'moment-timezone';
import Triangulos from './Triangulos'
import Sesion from '../persistente/Sesion';
import Const from '../persistente/Const'

export default class CalificacionesPendientes extends Component {
	constructor(props) {
		super(props);

		this.listaCalificaciones = React.createRef()

		this.state = {
			sesion: null,
			modalVisible: false,
			refreshing: false,
			calificacion: [],
			comentario: []
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

	calificar(viaje_id, puntaje) {
		const nuevaCalificacion = this.state.calificacion
		nuevaCalificacion[viaje_id] = puntaje
		this.setState({ calificacion: nuevaCalificacion })
	}

	comentar(viaje_id, comentario) {
		const nuevoComentario = this.state.comentario
		nuevoComentario[viaje_id] = comentario
		this.setState({ comentario: nuevoComentario })
	}

	async componentDidMount() {
		this.setState({ refreshing: true },
			async () => {
				await this.reload();
				this.setState({ refreshing: false })
			}
		);
	}

	async reload() {
		await this.setState({ refreshing: true },
			async () => {
				const storagedata = await Sesion.getStorageData()
				if (storagedata) {
					const calificaciones = await this.getCalificacionesPendientes(storagedata.persona.dni)
					this.setState({
						sesion: storagedata,
						calificaciones: calificaciones,
						refreshing: false
					})
				} else {
					this.setState({
						refreshing: false
					})
				}
			}
		)
	}

	render() {
		console.log("this.calificacion", this.state.calificacion)
		console.log("this.comentario", this.state.comentario)
		if (this.state.sesion) {
			return (
				<Modal
					animationType="slide"
					transparent={false}
					visible={this.state.modalVisible}
					onRequestClose={() => {
						this.hide();
					}}>
					<Container>
						{<CalificacionesPendientes ref={(c) => this.modalCalificaciones = c}></CalificacionesPendientes>}
						<Header style={{ backgroundColor: '#1b0088' }}>
							<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
								<Text style={styles.pantallaTitle}>Calificaciones pendientes</Text>
							</View>
							<Body>
							</Body>
							<Right>
								<Button transparent onPress={() => this.hide()}>
									<Icon type="Feather" name='x' style={{ color: '#fafafa', fontSize: 30 }} />
								</Button>
							</Right>
						</Header>
						{
							(this.state.isLoading) ?
								(
									<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color='#3f51b5' /></View>
								)
								:
								<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff', borderBottomColor: '#1b0088', borderBottomWidth: 15 }}>
									<View style={{ flex: 0.4, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' }}>
										<Triangulos up={false} red={false} />
									</View>
									<View style={{ flex: 3, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: 'transparent' }}>
										<View style={{ flex: 1 }}>
											<ScrollView
												refreshControl={
													<RefreshControl
														refreshing={this.state.refreshing}
														onRefresh={() => this.reload()}
													/>
												}>
												{
													(!this.state.calificaciones) ?
														<View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
															<Text style={{ fontFamily: "OpenSans-Light", fontSize: 20, color: '#414141', marginBottom: 15 }}>No tenés calificaciones pendientes.</Text>
														</View>
														: this.state.calificaciones.map((calificacion) =>
															<View
																key={calificacion.id}
																style={{ width: Dimensions.get('window').width, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25 }}>
																<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5 }}>
																	<Icon
																		type="Entypo"
																		name={(calificacion.viaje_sentido_codigo == "IN") ? "aircraft-take-off" : "aircraft-landing"}
																		style={styles.itemIcon}
																	/>
																</View>
																<View style={{ flex: 4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
																	<Text style={styles.itemTitle} >{moment.utc(calificacion.fecha_hora_fin).tz(Const.tz).format('DD/MM HH:mm')} hs</Text>
																	<Text style={styles.itemTitle} >Viajaste {(calificacion.viaje_sentido_codigo == "IN") ? "hacia " + calificacion.aeropuerto_codigo_iata : "desde " + calificacion.aeropuerto_codigo_iata} con {calificacion.chofer_razon_social}.</Text>
																	<View style={{ height: 36, width: '90%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
																		<TouchableOpacity onPress={() => this.calificar(calificacion.id, 1)}>
																			<Icon
																				type="EvilIcons"
																				name="star"
																				style={[styles.calificacionStar, (this.state.calificacion[calificacion.id] && this.state.calificacion[calificacion.id] > 0) ? styles.calificacionActivo : null]}
																			/>
																		</TouchableOpacity>
																		<TouchableOpacity onPress={() => this.calificar(calificacion.id, 2)}>
																			<Icon
																				type="EvilIcons"
																				name="star"
																				style={[styles.calificacionStar, (this.state.calificacion[calificacion.id] && this.state.calificacion[calificacion.id] > 1) ? styles.calificacionActivo : null]}
																			/>
																		</TouchableOpacity>
																		<TouchableOpacity onPress={() => this.calificar(calificacion.id, 3)}>
																			<Icon
																				type="EvilIcons"
																				name="star"
																				style={[styles.calificacionStar, (this.state.calificacion[calificacion.id] && this.state.calificacion[calificacion.id] > 2) ? styles.calificacionActivo : null]}
																			/>
																		</TouchableOpacity>
																		<TouchableOpacity onPress={() => this.calificar(calificacion.id, 4)}>
																			<Icon
																				type="EvilIcons"
																				name="star"
																				style={[styles.calificacionStar, (this.state.calificacion[calificacion.id] && this.state.calificacion[calificacion.id] > 3) ? styles.calificacionActivo : null]}
																			/>
																		</TouchableOpacity>
																		<TouchableOpacity onPress={() => this.calificar(calificacion.id, 5)}>
																			<Icon
																				type="EvilIcons"
																				name="star"
																				style={[styles.calificacionStar, (this.state.calificacion[calificacion.id] && this.state.calificacion[calificacion.id] > 4) ? styles.calificacionActivo : null]}
																			/>
																		</TouchableOpacity>
																	</View>
																	<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
																		<Textarea rowSpan={2} bordered placeholder="Enviá un comentario ..." style={{ width: '90%' }} onChangeText={(text) => { this.comentar(calificacion.id, text) }} />
																	</View>
																	<View style={{ width: '90%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
																		<TouchableOpacity onPress={() => (this.state.calificacion[calificacion.id] && this.state.comentario[calificacion.id]) ? (this.enviarCalificacion(calificacion.id), this.reload()) : null}>
																			<Text style={[styles.itemTitle, { color: (this.state.calificacion[calificacion.id] && this.state.comentario[calificacion.id]) ? "#2b2b2b" : "#a1a1a1" }]}>Enviar</Text>
																		</TouchableOpacity>
																	</View>
																</View>
															</View>
														)
												}
											</ScrollView>
										</View>
										<Triangulos up={true} red={false} />
									</View>
								</View>
						}
					</Container>
				</Modal >
			)
		}
		return null;
	}

	async getCalificacionesPendientes(pasajero_dni) {
		var calificaciones = null;
		try {
			const response = await fetch(Const.webURLPublica + '/getCalificacionesPendientes', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pasajero_dni: pasajero_dni,
				}),
			})
			calificaciones = await response.json();
			calificaciones = calificaciones.calificaciones;
			console.log("getCalificacionesPendientes response", calificaciones)
		} catch (error) {
			Alert.alert(
				'Error interno',
				'Error al obtener las calificaciones pendientes.',
				[
					{ text: 'Ok', onPress: () => null }
				],
				{ cancelable: true }
			)
			console.log("No se pudieron obtener las calificaciones pendientes del pasajero.", error);
		}
		return calificaciones;
	}

	async enviarCalificacion(viaje_id) {
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
					persona_dni_pasajero: this.state.sesion.persona.dni,
					puntaje: this.state.calificacion[viaje_id],
					mensaje: this.state.comentario[viaje_id]
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
			console.log("No se pudo enviar la calificación para el viaje.", error);
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
	modalTextBig: {
		fontFamily: "OpenSans-Light",
		fontSize: 24,
		textAlign: 'center',
		color: '#fafafa',
	},
	modalSubtext: {
		fontFamily: "OpenSans-Light",
		fontSize: 20,
		color: '#fafafa'
	},
	modalTextPasajero: {
		fontFamily: "OpenSans-Light",
		fontSize: 20,
		textAlign: 'left',
		color: '#424242'
	},
	modalIcon: {
		color: '#424242',
		fontSize: 48,
	},
	itemTitle: {
		fontFamily: "OpenSans-Light",
		fontSize: 18,
		color: '#2b2b2b'
	},
	itemSubtitle: {
		fontFamily: "OpenSans-Light",
		fontSize: 16,
		color: '#616161'
	},
	itemIcon: {
		fontSize: 34,
		color: '#2b2b2b',
		opacity: 0.8
	},
	calificacionStar: {
		fontSize: 34,
		color: '#fff',
		opacity: 0.4
	},
	calificacionActivo: {
		fontSize: 34,
		color: '#1b0088',
		opacity: 1
	},
});
