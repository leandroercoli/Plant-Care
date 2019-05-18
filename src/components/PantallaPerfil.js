import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ScrollView, Alert, NativeModules } from 'react-native';
import { View, Button, Icon, Text, Badge } from 'native-base';
import Triangulos from './Triangulos'
import Sesion from './../persistente/Sesion';
import firebase from 'react-native-firebase'

export default class Perfil extends Component {
	constructor(props) {
		super(props);

		this.state = {
			persona: null,
		};
	}

	async componentDidMount() {
		const storagedata = await Sesion.getStorageData()
		if (storagedata)
			this.setState({ persona: storagedata.persona })
	}

	render() {
		if (this.state.persona) {
			const persona = this.state.persona;
			console.log("Pantalal perfil persona", persona)
			return (
				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
					<View style={{ flex: 1.3, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#1b0088' }}>
						<Triangulos up={false} red={true} />
						<View style={{ flex: 0.6, marginTop: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
							<View style={[styles.modalImage]}>
								<Image source={require('./../img/no-user.png')} style={{ tintColor: '#fff', width: Dimensions.get('window').width / 4.5, height: Dimensions.get('window').width / 4.5 }} />

								<Badge success={(persona.persona_estado_codigo == 1 || persona.persona_estado_codigo == 6)}
									info={(persona.persona_estado_codigo == 2 || persona.persona_estado_codigo == 3 || persona.persona_estado_codigo == 0)}
									primary={(persona.persona_estado_codigo == 4)}
									danger={(persona.persona_estado_codigo == 5)}
									style={{ position: 'absolute', bottom: 10, left: Dimensions.get('window').width / 7 }}>
									<Text>{persona.estado_descripcion}</Text>
								</Badge>
							</View>
						</View>
						<View style={{ flex: 0.4 }}>
							<View style={{ flexDirection: 'row', justifyContent: 'center', width: Dimensions.get('window').width }}>
								<Text style={styles.modalTextBig}>{persona.razon_social}</Text>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'center', width: Dimensions.get('window').width }}>
								<Icon name={(persona.persona_perfil_codigo == 6) ? 'car' : 'md-person'} style={{ color: '#fafafa', marginRight: 10, bottom: 0, fontSize: 30 }} />
								<Text style={styles.modalSubtext}>{persona.perfil_descripcion}</Text>
							</View>
						</View>
						<Triangulos up={true} red={true} />
					</View>
					<View style={{ flex: 2, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff' }}>
						<Triangulos up={false} red={true} />
						<View style={{ flex: 1, marginTop: 60, marginBottom: 10, marginLeft: 10, marginRight: 10 }}>
							<ScrollView>
								<View style={{ width: Dimensions.get('window').width, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25 }}>
									<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5 }}>
										<Icon
											type="FontAwesome"
											name="id-card-o"
											style={styles.itemIcon}
										/>
									</View>
									<View style={{ flex: 4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
										<Text style={styles.itemTitle} >{persona.dni}</Text>
									</View>
								</View>
								<View style={{ width: Dimensions.get('window').width, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25 }}>
									<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5 }}>
										<Icon
											type="Feather"
											name="mail"
											style={styles.itemIcon}
										/>
									</View>
									<View style={{ flex: 4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
										<Text style={styles.itemTitle} >{firebase.auth().currentUser.email}</Text>
									</View>
								</View>
								<View style={{ width: Dimensions.get('window').width, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25 }}>
									<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5 }}>
										<Icon
											type="Feather"
											name="smartphone"
											style={styles.itemIcon}
										/>
									</View>
									<View style={{ flex: 4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
										<Text style={styles.itemTitle} >+{persona.celular_codigo_pais} {persona.celular_codigo_area} {persona.celular_numero}</Text>
										<Text style={styles.itemSubtitle} >Celular</Text>
									</View>
								</View>
								<View style={{ width: Dimensions.get('window').width, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25 }}>
									<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5 }}>
										<Icon
											type="Feather"
											name="phone"
											style={styles.itemIcon}
										/>
									</View>
									<View style={{ flex: 4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
										<Text style={styles.itemTitle} >+{persona.telefono_codigo_pais} {persona.telefono_codigo_area} {persona.telefono_numero}</Text>
										<Text style={styles.itemSubtitle} >Fijo</Text>
									</View>
								</View>
								<View style={{ width: Dimensions.get('window').width, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25 }}>
									<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5 }}>
										<Icon
											type="EvilIcons"
											name="location"
											style={[styles.itemIcon, { fontSize: 48 }]}
										/>
									</View>
									<View style={{ flex: 4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
										<Text style={styles.itemTitle} >{persona.domicilio_completo} {persona.domicilio_numero} {(persona.domicilio_departamento) ? persona.domicilio_departamento + " " + persona.domicilio_piso : null}</Text>
										<Text style={styles.itemSubtitle} >{persona.domicilio_barrio}</Text>
									</View>
								</View>


								<View style={{ width: Dimensions.get('window').width, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25, paddingRight:15 }}>
									<Button iconLeft
										onPress={() =>
											Alert.alert(
												'¿Cerrar sesión?',
												'',
												[
													{ text: 'Cancelar', onPress: () => null },
													{ text: 'Sí', onPress: () => { NativeModules.GeoLocation.stopService(); this.props.screenProps.handleLogoutPress() } },
												],
												{ cancelable: true }
											)}
										style={{ backgroundColor: 'rgb(27, 0, 136)', width: '90%', justifyContent: 'center' }}>
										<Icon type="Feather" name='log-out' style={{ color: "#fff" }} />
										<Text style={{ fontFamily: "OpenSans-Light", color: "#fff" }}>Cerrar sesión</Text>
									</Button>
								</View>





							</ScrollView>
						</View>
					</View>
				</View>
			)
		}
		return null;
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
});
