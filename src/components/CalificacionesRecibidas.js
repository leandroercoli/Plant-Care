import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ScrollView, RefreshControl, Alert } from 'react-native';
import { View, Button, Icon, Text } from 'native-base';
import moment from 'moment-timezone';
import Triangulos from './Triangulos'
import Sesion from '../persistente/Sesion';
import Const from '../persistente/Const'

export default class CalificacionesRecibidas extends Component {
	constructor(props) {
		super(props);

		this.listaCalificaciones = React.createRef()

		this.state = {
			sesion: null,
			modalVisible: false,
			calificaciones: null,
			calificacionGeneral: 1,
			refreshing: false,
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
					const calificaciones = await this.getCalificaciones(storagedata.persona.dni)
					var calificacionGeneral = 1
					if (calificaciones) {
						calificaciones.map((c) => { calificacionGeneral = (calificacionGeneral + c.puntaje) / 2 })
					}
					this.setState({
						sesion: storagedata,
						calificaciones: calificaciones,
						calificacionGeneral: calificacionGeneral,
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
		if (this.state.sesion) {
			return (
				<Modal
					animationType="slide"
					transparent={false}
					visible={this.state.modalVisible}
					onRequestClose={() => {
						this.hide();
					}}>
					<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
						<View style={{ flex: 1.3, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#1b0088' }}>
							<Triangulos up={false} red={true} />
							<Button transparent style={{ position: 'absolute', top: 10, left: 0 }} onPress={() => this.setState({ modalVisible: false })} >
								<Icon type="Feather" name='chevron-left' style={{ color: '#fafafa', fontSize: 30 }} />
							</Button>
							<View style={{ flex: 0.6, marginTop: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
								<View style={[styles.modalImage]}>
									<Image source={require('./../img/no-user.png')} style={{ tintColor: '#fff', width: Dimensions.get('window').width / 4.5, height: Dimensions.get('window').width / 4.5 }} />
								</View>
							</View>
							<View style={{ flex: 0.4 }}>
								<Text style={styles.modalTextBig}>{this.state.sesion.persona.razon_social}</Text>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<Icon name={(this.state.sesion.persona.persona_perfil_codigo == 6) ? 'car' : 'md-person'} style={{ color: '#fafafa', marginRight: 10, bottom: 0, fontSize: 30 }} />
									<Text style={styles.modalSubtext}>{this.state.sesion.persona.perfil_descripcion}</Text>
								</View>
							</View>
							<Triangulos up={true} red={true} />
						</View>
						{this.renderCalificacion()}
						<View style={{ flex: 2, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff' }}>
							<Triangulos up={false} red={true} />
							<View style={{ flex: 1, marginTop: 30 }}>
								<ScrollView
									ref={this.listaCalificaciones}
									onScroll={event => {
										this.yOffset = event.nativeEvent.contentOffset.y
									}}
									style={{marginRight:10 }}
									scrollEventThrottle={16}
									refreshControl={
										<RefreshControl
											refreshing={this.state.refreshing}
											onRefresh={() => this.reload()}
										/>
									}>
									{
										(!this.state.calificaciones) ?
											<View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
												<Text style={{ fontFamily: "OpenSans-Light", fontSize: 20, color: '#414141', marginBottom: 15 }}>No hay calificaciones para mostrar.</Text>
											</View>
											: this.state.calificaciones.map((calificacion) =>
												<View
													key={calificacion.viaje_id}
													style={{ width: Dimensions.get('window').width, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25 }}>
													<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5 }}>
														<Icon
															type="Entypo"
															name={(calificacion.viaje_sentido_codigo == "IN") ? "aircraft-take-off" : "aircraft-landing"}
															style={styles.itemIcon}
														/>
													</View>
													<View style={{ flex: 4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
														<Text style={styles.itemTitle} >{moment.utc(calificacion.fecha_hora).tz(Const.tz).format('DD/MM HH:mm')} hs</Text>
														<Text style={styles.itemTitle} >{calificacion.pasajero_razon_social} calificó el viaje {(calificacion.viaje_sentido_codigo == "IN") ? "hacia " + calificacion.aeropuerto_codigo_iata : "desde " + calificacion.aeropuerto_codigo_iata} con {calificacion.puntaje} estrellas.</Text>
														{(calificacion.mensaje && calificacion.mensaje != "") ?
															<Text style={styles.itemTitle}>Además, comentó "{calificacion.mensaje}".</Text>
															: null
														}
													</View>
												</View>
											)
									}
								</ScrollView>
							</View>
						</View>
					</View>
				</Modal >
			)
		}
		return null;
	}

	renderCalificacion() {
		return (
			<View style={{ height: 60, width: '100%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: 'rgb(179,15,59)' }}>
				<Icon
					type='EvilIcons'
					name="star"
					style={[styles.calificacionStar, (this.state.calificacionGeneral > 0) ? styles.calificacionActivo : null]}
				/>
				<Icon
					type='EvilIcons'
					name="star"
					style={[styles.calificacionStar, (this.state.calificacionGeneral > 1) ? styles.calificacionActivo : null]}
				/>
				<Icon
					type='EvilIcons'
					name="star"
					style={[styles.calificacionStar, (this.state.calificacionGeneral > 2) ? styles.calificacionActivo : null]}
				/>
				<Icon
					type='EvilIcons'
					name="star"
					style={[styles.calificacionStar, (this.state.calificacionGeneral > 3) ? styles.calificacionActivo : null]}
				/>
				<Icon
					type='EvilIcons'
					name="star"
					style={[styles.calificacionStar, (this.state.calificacionGeneral > 4) ? styles.calificacionActivo : null]}
				/>
			</View>
		)
	}

	async getCalificaciones(conductor_dni) {
		var calificaciones = null;
		try {
			const response = await fetch(Const.webURLPublica + '/getCalificaciones', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					conductor_dni: conductor_dni,
				}),
			})
			calificaciones = await response.json();
			calificaciones = calificaciones.calificaciones;
			console.log("getCalificaciones response", calificaciones)
		} catch (error) {
			Alert.alert(
				'Error interno',
				'Error al obtener las calificaciones',
				[
					{ text: 'Ok', onPress: () => null }
				],
				{ cancelable: true }
			)
			console.log("No se pudieron obtener las calificaciones para el conductor.", error);
		}
		return calificaciones;
	}
}


const styles = StyleSheet.create({
	modalImage: {
		width: Dimensions.get('window').width / 3,
		height: Dimensions.get('window').width / 3,
		borderRadius: Dimensions.get('window').width / 2,
		borderWidth: 4,
		borderColor: 'rgba(179,15,59,0.8)',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 15
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
		color: '#2b2b2b'
	},
	calificacionStar: {
		fontSize: 58,
		color: '#fff',
		opacity: 0.4
	},
	calificacionActivo: {
		fontSize: 58,
		color: '#fff',
		opacity: 1
	},
});
