import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);

import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ScrollView, RefreshControl, Alert } from 'react-native';
import { View, Button, Icon, Text, Spinner, Badge, Container, Header, Left, Right, Body } from 'native-base';
import firebase from 'react-native-firebase'
import moment from 'moment-timezone';
import Triangulos from '../components/Triangulos'

import Sesion from '../persistente/Sesion';
import Const from '../persistente/Const'
import CalificacionesPendientes from '../components/CalificacionesPendientes'

export default class VuelosPasajero extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			sesion: null,
			vuelos: [],
			viajesvuelos: null,
			refreshing: false,
		};
	}

	async componentDidMount() {
		this.setState({ isLoading: true },
			async () => {
				await this.reload();
				this.setState({ isLoading: false })
			}
		);
	}

	async reload() {
		this.setState({ refreshing: true },
			async () => {
				const storagedata = await Sesion.getStorageData()
				if (storagedata) {
					const viajesvuelos = await this.getVuelosViajesPasajero(storagedata.persona.dni)
					this.setState({
						sesion: storagedata,
						vuelos: viajesvuelos.vuelos,
						viajesvuelos: viajesvuelos.viajesvuelos,
						refreshing: false
					})
				}
			}
		)
	}

	render() {
		return (
			<Container>
				{<CalificacionesPendientes ref={(c) => this.modalCalificaciones = c}></CalificacionesPendientes>}
				<Header style={{ backgroundColor: 'rgb(179,15,59)' }}>
					<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<Text style={styles.pantallaTitle}>Próximos vuelos</Text>
					</View>
					<Body>
					</Body>
					<Right>
						{<Button transparent
							onPress={() => this.modalCalificaciones.show()} >
							<Icon
								type="EvilIcons"
								name="star"
								style={{ fontSize: 32, color: '#fff' }}
							/>
						</Button>}
					</Right>
				</Header>
				{
					(this.state.isLoading) ?
						(
							<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color='#3f51b5' /></View>
						)
						:
						<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff',  paddingTop:15, borderBottomColor: 'rgb(179,15,59)', borderBottomWidth: 15 }}>
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
											(!this.state.vuelos || (this.state.vuelos && this.state.vuelos.length == 0)) ?
												<View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<Text style={{ fontFamily: "OpenSans-Light", fontSize: 20, color: '#414141', marginBottom: 15 }}>No tenés vuelos programados</Text>
												</View>
												:
												this.state.vuelos.map((vuelo) => {
													return (
														<View key={vuelo.id} style={styles.viajeVueloItem}>
															<TouchableOpacity onPress={() => null}>
																<View style={{ width: Dimensions.get('window').width * 0.95, flexDirection: 'row', justifyContent: 'space-evenly' }}>
																	<View style={{ flex: 0.15, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
																		<Icon
																			type="EvilIcons"
																			name="chevron-right"
																			style={styles.itemIcon}
																		/>
																	</View>
																	<View style={{ flex: 0.85, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
																		<Text style={styles.vueloTitulo}>{moment.utc(vuelo.vuelo_fecha_hora_partida).tz(Const.tz).format('DD/MM')} - Vuelo {vuelo.vuelo_codigo}{(vuelo.vuelo_aeropuerto_codigo_iata_origen) ? " desde " + vuelo.vuelo_aeropuerto_codigo_iata_origen : null}{(vuelo.vuelo_aeropuerto_codigo_iata_destino) ? " hacia " + vuelo.vuelo_aeropuerto_codigo_iata_destino : null}.</Text>
																		{
																			(vuelo.vuelo_estado_codigo > 0) ?
																				<Badge success={(vuelo.vuelo_estado_codigo == 1 || vuelo.vuelo_estado_codigo == 2 || vuelo.vuelo_estado_codigo == 3)}
																					warning={(vuelo.vuelo_estado_codigo == 5 || vuelo.vuelo_estado_codigo == 6 || vuelo.vuelo_estado_codigo == 7)}
																					danger={(vuelo.vuelo_estado_codigo == 4 || vuelo.vuelo_estado_codigo == 9)}
																					info={vuelo.vuelo_estado_codigo == 10}>
																					<Text>{vuelo.vuelo_estado_descripcion}</Text>
																				</Badge>
																				: null
																		}
																		<Text>
																			<Text style={styles.vueloHoraPresentacion}>Presentarse en {vuelo.vuelo_aeropuerto_codigo_iata_origen} a las </Text>
																			<Text style={[styles.vueloHoraPresentacion, styles.textBold]}>{moment.utc(vuelo.vuelo_fecha_hora_presentacion).tz(Const.tz).format('HH:mm')} hs</Text>
																			<Text style={styles.vueloHoraPresentacion}> ({moment.utc(vuelo.vuelo_fecha_hora_presentacion).tz(Const.tz).format('DD/MM')}).</Text>
																		</Text>
																		{
																			(this.state.viajesvuelos && this.state.viajesvuelos[vuelo.id].length > 0) ?
																				(
																					viaje = this.state.viajesvuelos[vuelo.id][0],
																					(
																						<Text>
																							<Text style={styles.viajeDescripcion}>Te pasará a buscar {viaje.conductor_razon_social}, patente {viaje.viaje_vehiculo_patente}, a partir de las </Text>
																							<Text style={[styles.viajeDescripcion, styles.textBold]}>{moment.utc(viaje.viaje_fecha_hora_inicio).tz(Const.tz).format('HH:mm')} hs</Text>
																							<Text style={[styles.viajeDescripcion]}>.</Text>
																						</Text>
																					)
																				)
																				: (<View>
																					<Text style={styles.viajeDescripcion}>Todavía no se asignó un chofer para el viaje.</Text>
																				</View>)
																		}

																	</View>
																</View>
															</TouchableOpacity>
															<View style={styles.separadorViajes}></View>
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
				'Error al obtener los vuelos y viajes del pasajero.',
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


const styles = StyleSheet.create({
	pantallaTitle: {
		fontFamily: "OpenSans-Regular",
		fontSize: 22,
		color: '#fff',
	},
	viajeVueloItem: {
		marginBottom: 10
	},
	vueloTitulo: {
		fontFamily: "OpenSans-Light",
		fontSize: 20,
		color: '#2b2b2b',
		marginBottom: 5
	},
	vueloHoraPresentacion: {
		fontFamily: "OpenSans-Light",
		fontSize: 16,
		color: '#2b2b2b',
		marginBottom: 5
	},
	viajeDescripcion: {
		fontFamily: "OpenSans-Light",
		fontSize: 16,
		color: '#2b2b2b',
		marginBottom: 5
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
	separadorViajes: {
		height: 2,
		width: '60%',
		backgroundColor: '#f5f5f5',
		marginTop: 10,
		marginBottom: 10,
		left: '20%'
	},
});
