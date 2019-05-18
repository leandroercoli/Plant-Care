import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);

import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ScrollView, RefreshControl, Alert } from 'react-native';
import { View, Button, Icon, Text, Spinner, Container, Header, Left, Right, Body } from 'native-base';
import firebase from 'react-native-firebase'
import moment from 'moment-timezone';
import Triangulos from '../components/Triangulos'

import Sesion from '../persistente/Sesion';
import Const from '../persistente/Const'
import Log from '../persistente/Log'
import CalificacionesRecibidas from '../components/CalificacionesRecibidas'

export default class Viajes extends React.Component {
	constructor(props) {
		super(props);

		this.listaViajes = React.createRef()
		this.modalCalificaciones = React.createRef()

		this.state = {
			isLoading: true,
			sesion: null,
			viajesProgramados: [],
			refreshing: false,
			viajeNuevoID: null
		};
	}

	async componentDidMount() {
		this.setState({ isLoading: true },
			async () => {
				await this.reload();
				this.setState({ isLoading: false })
			}
		);
		this.checkNotifications(this.props)
	}

	scroll(offset) {
		setTimeout(() => {
			this.listaViajes.current.scrollTo({ y: offset })
		}, 1)
	}

	async reload() {
		await this.setState({ refreshing: true },
			async () => {
				const storagedata = await Sesion.getStorageData()
				if (storagedata) {
					const viajes = await Sesion.getViajesProgramados(storagedata.persona.dni)
					this.setState({
						sesion: storagedata,
						viajesProgramados: viajes,
						refreshing: false
					})
				}
			}
		)
	}

	componentWillReceiveProps(props) {
		if (props.navigation && props.navigation.state && props.navigation.state.params && props.navigation.state.params.reload) {
			this.reload()
		}
		this.checkNotifications(props)
	}

	async checkNotifications(props) {
		if (props.screenProps.nuevaNotificacion) {
			let notificacion_datos = JSON.parse(props.screenProps.notificacion.datos)
			await this.reload()
			this.setState({ viajeNuevoID: notificacion_datos.id })
			this.props.screenProps.notificacionSeen()
		}
	}

	render() {
		return (
			<Container>
				{<CalificacionesRecibidas ref={(c) => this.modalCalificaciones = c}></CalificacionesRecibidas>}
				<Header style={{ backgroundColor: 'rgb(179,15,59)' }}>
					<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<Text style={styles.pantallaTitle}>Próximos viajes</Text>
					</View>
					<Body>
					</Body>
					<Right>
						<Button transparent
							onPress={() => this.modalCalificaciones.show()} >
							<Icon
								type="EvilIcons"
								name="star"
								style={{ fontSize: 32, color: '#fff' }}
							/>
						</Button>
					</Right>
				</Header>
				{
					(this.state.isLoading) ?
						(
							<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color='#3f51b5' /></View>
						)
						:
						<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff', paddingTop:15, borderBottomColor: 'rgb(179,15,59)', borderBottomWidth: 15 }}>
							<View style={{ flex: 3, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: 'transparent' }}>
								<View style={{ flex: 1 }}>
									<ScrollView
										ref={this.listaViajes}
										onScroll={event => {
											this.yOffset = event.nativeEvent.contentOffset.y
										}}
										scrollEventThrottle={16}
										refreshControl={
											<RefreshControl
												refreshing={this.state.refreshing}
												onRefresh={() => this.reload()}
											/>
										}>
										{
											(!this.state.viajesProgramados || this.state.viajesProgramados && this.state.viajesProgramados.length == 0) ?
												<View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<Text style={{ fontFamily: "OpenSans-Light", fontSize: 20, color: '#414141', marginBottom: 15 }}>No tenés viajes programados</Text>
												</View>
												:
												this.state.viajesProgramados.map((viaje) => {
													return (
														<View key={viaje.viaje.id} style={{ marginBottom: 15 }}
															onLayout={event => {
																const layout = event.nativeEvent.layout;
																if (this.state.viajeNuevoID && this.state.viajeNuevoID == viaje.viaje.id) {
																	this.yOffsetNuevoViaje = layout.height + layout.y / 2
																	this.scroll(this.yOffsetNuevoViaje)
																}
															}}>
															<TouchableOpacity onPress={() => {
																this.props.navigation.navigate('Mapa', { viaje: viaje })
															}}>
																<View style={{ width: Dimensions.get('window').width * 0.95, flexDirection: 'row', justifyContent: 'space-evenly' }}>
																	<View style={{ flex: 0.15, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
																		<Icon
																			type="EvilIcons"
																			name="chevron-right"
																			style={styles.itemIcon}
																		/>
																	</View>
																	<View style={{ flex: 0.85, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
																		{(viaje.viaje.viaje_sentido_codigo == "IN") ?
																			(
																				<Text style={styles.viajeTitulo}>{moment.utc(viaje.viaje.fecha_hora_inicio).tz(Const.tz).format('DD/MM')} - Viaje hacia {viaje.viaje.aeropuerto_codigo_iata}. {(viaje.pasajeros.length > 1) ? viaje.pasajeros.length + " pasajeros deben presentarse en el aeropuerto antes de las " : viaje.pasajeros.length + " pasajero debe presentarse en el aeropuerto antes de las "}{moment.utc(viaje.viaje.fecha_hora_fin).tz(Const.tz).format('HH:mm')} hs.</Text>
																			)
																			: (
																				<Text style={styles.viajeTitulo}>{moment.utc(viaje.viaje.fecha_hora_inicio).tz(Const.tz).format('DD/MM')} - Viaje desde {viaje.viaje.aeropuerto_codigo_iata}. {(viaje.pasajeros.length > 1) ? viaje.pasajeros.length + " pasajeros estarán esperándote en el aeropuerto a partir de las " : viaje.pasajeros.length + " pasajero estará esperándote en el aeropuerto a partir de las "}{moment.utc(viaje.viaje.fecha_hora_inicio).tz(Const.tz).format('HH:mm')} hs.</Text>
																			)
																		}
																		{
																			(viaje.viaje.viaje_sentido_codigo == "IN") ?
																				viaje.pasajeros.map((viaje_pasajero) => {
																					return (
																						<View key={viaje_pasajero.pasajero_dni}>
																							<Text>
																								<Text style={styles.viajePasajero}>{viaje_pasajero.pasajero_razon_social} estará esperando, a partir de las </Text>
																								<Text style={styles.textBold}>{moment.utc(viaje_pasajero.pasajero_fh_inicio).tz(Const.tz).format('HH:mm')} hs</Text>
																								<Text style={styles.viajePasajero}>, en </Text>
																								<Text style={styles.textBold}>{viaje_pasajero.pasajero_domicilio}</Text>
																								<Text style={styles.viajePasajero}>.</Text>
																							</Text>
																							<View style={styles.separadorPasajeros}></View>
																						</View>
																					)
																				}) :
																				viaje.pasajeros.map((viaje_pasajero) => {
																					return (
																						<View key={viaje_pasajero.pasajero_dni}>
																							<Text>
																								<Text style={styles.viajePasajero}>{viaje_pasajero.pasajero_razon_social} espera estar en </Text>
																								<Text style={styles.textBold}>{viaje_pasajero.pasajero_domicilio}</Text>
																								<Text style={styles.viajePasajero}> a las </Text>
																								<Text style={styles.textBold}>{moment.utc(viaje_pasajero.pasajero_fh_fin).tz(Const.tz).format('HH:mm')} hs</Text>
																								<Text style={styles.viajePasajero}>.</Text>
																							</Text>
																							<View style={styles.separadorPasajeros}></View>
																						</View>
																					)
																				})
																		}
																	</View>
																</View>
															</TouchableOpacity>
														</View>
													)
												})
										}
									</ScrollView>
								</View>
								<Triangulos up={true} red={true} />
							</View>
						</View>
				}
			</Container>
		)
	}
}


const styles = StyleSheet.create({
	pantallaTitle: {
		fontFamily: "OpenSans-Regular",
		fontSize: 22,
		color: '#fff',
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
	nuevoViajeBadge: {
		position: 'absolute',
		top: 0,
		right: 0,
		width: 12,
		height: 12,
		backgroundColor: 'rgba(179,15,59,0.8)',
		borderRadius: 6
	}
});
