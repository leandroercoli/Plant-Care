import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);

import React, { Component } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, Dimensions, View, Image, Modal, ScrollView, Textinput, TouchableOpacity, TouchableHighlight, Alert } from 'react-native';
import { Container, Content, Form, Item, Input, Label, Text, Button, Icon, Picker } from 'native-base';
import Const from './persistente/Const'
import Triangulos from './components/Triangulos'
import type { Notification } from 'react-native-firebase';

export default class Login extends React.Component {
	constructor(props) {
		super(props);

		this.scrollView = React.createRef()

		this.state = {
			usuario: '',
			pass: '',
			dni: '',
			nombre: '',
			apellido: '',
			mostrarPass: false,
			modalResetPassVisible: false,
			resetPassEmail: '',
			perfiles: [],
			perfil: 'placeholder',
			patente: '',
			calle: '',
			calleNro: '',
			localidad: '',
			proveedores: [],
			proveedor: 'placeholder',
			marcas_modelos: [],
			marcas_display: [],
			marca: 'placeholder',
			modelos_display: [],
			modelo: 'placeholder',
			error: null,
		};
	}

	async componentDidMount() {
		const perfiles = await this.getPerfiles()

		const proveedores = await this.getProveedores()
		if (proveedores) {
			var marcas_id = []
			var marcas_display = []
			proveedores.marca_modelo.map((m) => {
				if (!marcas_id.includes(m.marca_id)) {
					marcas_id.push(m.marca_id)
					marcas_display.push(m)
				}
			})
		}

		this.setState({
			perfiles: (perfiles) ? perfiles : [],
			proveedores: (proveedores) ? proveedores.proveedores : [],
			marcas_modelos: (proveedores) ? proveedores.marca_modelo : [],
			marcas_display: (proveedores) ? marcas_display : []
		})
	}

	render() {
		return (
			<Container style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
				<Modal
					animationType="slide"
					transparent={false}
					visible={this.state.modalResetPassVisible}
					onRequestClose={() => {
						this.setModalResetPassVisible(!this.state.modalResetPassVisible)
					}}>
					<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#fff' }}>
						<View style={{ height: 40, flexDirection: 'row', paddingLeft: 15, alignItems: 'flex-end', backgroundColor: 'rgb(27, 0, 136)' }}>
							<Text style={styles.modalTitle}>¿Olvidaste tu contraseña?</Text>
							<TouchableOpacity transparent style={{ position: 'absolute', top: 5, right: 5 }} onPress={() => this.setModalResetPassVisible(!this.state.modalResetPassVisible)} >
								<Icon type="Feather" name='x' style={{ color: '#fafafa', fontSize: 30 }} />
							</TouchableOpacity>
						</View>
						<View style={{ flex: 0.5, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' }}>
							<Triangulos up={false} red={false} />
						</View>
						<View style={{ flex: 3, flexDirection: 'column', justifyContent: 'center', backgroundColor: 'transparent' }}>
							<View style={{ flex: 0.85, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginRight: 20 }}>
								<Text style={styles.modalText}>Se enviará un mensaje a tu dirección de mail con los pasos para restablecer la contraseña.</Text>
								<Form style={{ width: Dimensions.get('window').width }} >
									<Item floatingLabel style={styles.formItem}>
										<Label style={styles.formLabel}>E-mail</Label>
										<Input style={styles.formTextInput} keyboardType='email-address' textContentType='emailAddress' onChangeText={(text) => { this.setState({ resetPassEmail: text }) }} />
									</Item>
								</Form>
							</View>
							<View style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
								<Button transparent iconRight
									disabled={this.state.resetPassEmail == '' ? true : false}
									style={[{ backgroundColor: 'rgba(27, 0, 136,0.9)' }, (this.state.resetPassEmail == '') ? { opacity: 0.6 } : { opacity: 1 }]}
									onPress={() => {
										this.props.onResetPassword(this.state.resetPassEmail);
										this.setModalResetPassVisible(!this.state.modalResetPassVisible)
									}}>
									<Text style={{ fontFamily: "OpenSans-Light", color: '#fff' }}>Restablecer</Text>
									<Icon type="EvilIcons" name='chevron-right' style={{ color: '#fff' }} />
								</Button>
							</View>
						</View>
					</View>
				</Modal>
				<View style={{ flex: 0.8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1b0088' }}>
					<View style={{ height: 75, position: 'absolute', top: 5, left: 5 }}>
						<Image
							style={{
								flex: 1,
								aspectRatio: 1,
								resizeMode: 'contain'
							}}
							source={require('./img/ic_launcher.png')}
						/>
					</View>
					<View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
						<Text style={{ fontFamily: "OpenSans-Light", fontSize: 42, color: '#fff' }}>SST</Text>
					</View>
					<Triangulos up={true} red={true} />
				</View>
				<View style={{ flex: 2 }}>
					<Triangulos up={false} red={true} />
					<ScrollView horizontal={true} scrollEnabled={false} ref={(c) => this.scrollView = c}>
						<View style={{ width: Dimensions.get('window').width - 15, flexDirection: 'column', paddingTop: 15 }}>
							<ScrollView>
								<Form >
									<Item floatingLabel style={styles.formItem}>
										<Label style={styles.formLabel}>E-mail</Label>
										<Input style={styles.formTextInput} keyboardType='email-address' textContentType='emailAddress' onChangeText={(text) => { this.setState({ usuario: text }) }} />
									</Item>
									<Item style={[styles.formItem, { paddingBottom: 0, marginBottom: 0 }]}>
										<View style={{ flex: 1, justifyContent: 'center' }}>
											<Item floatingLabel style={[styles.formItem, { backgroundColor: 'transparent', paddingLeft: 0 }]}>
												<Label style={[styles.formLabel, { marginLeft: 0 }]}>Contraseña</Label>
												<Input style={styles.formTextInput} secureTextEntry={!this.state.mostrarPass} textContentType='password' inlineLabel='Label' onChangeText={(text) => { this.setState({ pass: text }) }} />
											</Item>
											<TouchableOpacity onPress={() => this.passwordToggle()} style={{ position: 'absolute', right: 0 }}>
												<Icon type="Feather" name={(this.state.mostrarPass) ? 'eye' : 'eye-off'} />
											</TouchableOpacity>
										</View>
									</Item>
									<Item style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15, borderBottomColor: 'transparent' }}>
										<TouchableOpacity transparent onPress={() => this.setModalResetPassVisible(!this.state.modalResetPassVisible)}>
											<Text style={{ fontFamily: "OpenSans-Light", color: '#2b2b2b', fontSize: 16 }}>Olvidé mi clave</Text>
										</TouchableOpacity>
									</Item>
									<Item style={{ flexDirection: 'row', justifyContent: 'center', borderColor: 'transparent', marginBottom: 15 }}>
										<Button iconLeft onPress={() => this.props.onLoginPress(this.state.usuario, this.state.pass)}
											disabled={this.canLogin() ? false : true}
											style={[this.canLogin() ? styles.loginButtonEnabled : styles.loginButtonDisabled, { marginBottom: 10, width: '100%', justifyContent: 'center' }]}>
											<Icon type="Feather" name='log-in' />
											<Text style={{ fontFamily: "OpenSans-Light" }}>Iniciar sesión</Text>
										</Button>
									</Item>
									<Item style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5, borderBottomColor: 'transparent' }}>
										<Text style={{ fontFamily: "OpenSans-Light", color: '#2b2b2b', fontSize: 15 }}>¿No estás registrado?</Text>
									</Item>
									<Item style={{ flexDirection: 'row', justifyContent: 'center', borderColor: 'transparent', marginBottom: 15 }}>
										<Button transparent iconLeft onPress={() => { this.scrollView.scrollToEnd() }}
											style={{ backgroundColor: 'rgb(27, 0, 136)', width: '100%', justifyContent: 'center' }}>
											<Icon type="Feather" name='user-plus' style={{ color: '#fff' }} />
											<Text style={{ fontFamily: "OpenSans-Light", color: '#fff' }}>Crear cuenta</Text>
										</Button>
									</Item>
								</Form>
							</ScrollView>
						</View>
						<View style={{ width: Dimensions.get('window').width, flexDirection: 'column', paddingRight: 15, paddingTop: 15 }}>
							<ScrollView>
								<Form>
									<Item floatingLabel style={styles.formItem}>
										<Label style={styles.formLabel}>DNI</Label>
										<Input style={styles.formTextInput} keyboardType='number-pad' onChangeText={(text) => { this.setState({ dni: text }) }} />
									</Item>
									<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
										<Item floatingLabel style={[{ flex: 0.5 }, styles.formItem]}>
											<Label style={styles.formLabel}>Nombre</Label>
											<Input style={styles.formTextInput} onChangeText={(text) => { this.setState({ nombre: text }) }} />
										</Item>
										<Item floatingLabel style={[{ flex: 0.5 }, styles.formItem]}>
											<Label style={styles.formLabel}>Apellido</Label>
											<Input style={styles.formTextInput} onChangeText={(text) => { this.setState({ apellido: text }) }} />
										</Item>
									</View>
									<Item floatingLabel style={styles.formItem}>
										<Label style={styles.formLabel}>E-mail</Label>
										<Input style={styles.formTextInput} keyboardType='email-address' textContentType='emailAddress' onChangeText={(text) => { this.setState({ usuario: text }) }} />
									</Item>
									<Item style={[styles.formItem, { paddingBottom: 0 }]}>
										<View style={{ flex: 1, justifyContent: 'center' }}>
											<Item floatingLabel style={[styles.formItem, { backgroundColor: 'transparent', paddingLeft: 0 }]}>
												<Label style={[styles.formLabel, { marginLeft: 0 }]}>Contraseña</Label>
												<Label style={[styles.formLabelGrey, { marginLeft: 0 }]}> (al menos 6 caracteres)</Label>
												<Input style={styles.formTextInput} secureTextEntry={!this.state.mostrarPass} textContentType='password' inlineLabel='Label' onChangeText={(text) => { this.setState({ pass: text }) }} />
											</Item>
											<TouchableOpacity onPress={() => this.passwordToggle()} style={{ position: 'absolute', right: 0 }}>
												<Icon type="Feather" name={(this.state.mostrarPass) ? 'eye' : 'eye-off'} />
											</TouchableOpacity>
										</View>
									</Item>
									<Item style={[styles.formItem, { paddingBottom: 0, paddingRight: 0 }]}>
										<Picker
											mode="dropdown"
											selectedValue={this.state.perfil}
											onValueChange={(p) => this.onPerfilChange(p)}
										>
											<Picker.Item label="Seleccione su perfil ..." value="placeholder" color='#616161' />
											{
												this.state.perfiles.map((p) => {
													return <Picker.Item label={p.descripcion} value={p.codigo} key={"" + p.id} color='#414141' />
												})
											}
										</Picker>
									</Item>
									{
										(this.state.perfil == '6') ?
											(
												[
													<Item key="inputPatente" floatingLabel style={styles.formItem}>
														<Label style={styles.formLabel}>Patente</Label>
														<Input style={styles.formTextInput} onChangeText={(text) => { this.setState({ patente: text }) }} autoCapitalize="characters" />
													</Item>,
													<Item key="inputProveedor" style={[styles.formItem, { paddingBottom: 0, paddingRight: 0 }]}>
														<Picker
															key="inputProveedor"
															mode="dropdown"
															selectedValue={this.state.proveedor}
															onValueChange={(p) => this.onProveedorChange(p)}
														>
															<Picker.Item label="Seleccione su proveedor ..." value="placeholder" color='#616161' />
															{
																this.state.proveedores.map((p) => {
																	return <Picker.Item label={p.razon_social} value={p.id} key={"" + p.id} color='#414141' />
																}
																)
															}
														</Picker>
													</Item>,
													<Item key="inputMarcas" style={[styles.formItem, { paddingBottom: 0, paddingRight: 0 }]}>
														<Picker
															key="inputMarcas"
															mode="dropdown"
															selectedValue={this.state.marca}
															onValueChange={(m) => this.onMarcaChange(m)}
														>
															<Picker.Item label="Seleccione la marca de su auto ..." value="placeholder" color='#616161' />
															{
																this.state.marcas_display.map((m) => {
																	return <Picker.Item label={m.marca_nombre} value={m.marca_id} key={"" + m.marca_id} color='#414141' />
																})
															}
														</Picker>
													</Item>,
													(!this.state.modelos_display) ? null
														: <Item key="inputModelos" style={[styles.formItem, { paddingBottom: 0, paddingRight: 0 }]}>
															<Picker
																key="inputModelos"
																mode="dropdown"
																selectedValue={this.state.modelo}
																onValueChange={(m) => this.onModeloChange(m)}
															>
																<Picker.Item label="Seleccione el modelo de su auto ..." value="placeholder" color='#616161' />
																{
																	this.state.modelos_display.map((m) => {
																		return <Picker.Item label={m.modelo_nombre} value={m.modelo_id} key={"" + m.modelo_id} color='#414141' />
																	}
																	)
																}
															</Picker>
														</Item>
												]
											)
											: (
												(this.state.perfil != 'placeholder') ?
													[
														<View key="inputDireccion" style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
															<Item floatingLabel style={[{ flex: 0.6 }, styles.formItem]}>
																<Label style={styles.formLabel}>Calle</Label>
																<Input style={styles.formTextInput} onChangeText={(text) => { this.setState({ calle: text }) }} />
															</Item>
															<Item floatingLabel style={[{ flex: 0.4 }, styles.formItem]}>
																<Label style={styles.formLabel}>Número</Label>
																<Input style={styles.formTextInput} keyboardType='number-pad' onChangeText={(text) => { this.setState({ calleNro: text }) }} />
															</Item>
														</View>,
														<Item key="localidad" floatingLabel style={[{ flex: 0.4 }, styles.formItem]}>
															<Label style={styles.formLabel}>Localidad</Label>
															<Input style={styles.formTextInput} onChangeText={(text) => { this.setState({ localidad: text }) }} autoCapitalize="sentences"/>
														</Item>
													]
													: null
											)
									}
									<Item style={{ flexDirection: 'row', justifyContent: 'center', borderColor: 'transparent', marginBottom: 15 }}>
										<Button iconLeft onPress={() => (this.state.perfil == '6') ? this.signUpChofer() : this.signUpTripulante()}
											disabled={this.canSignUp() ? false : true}
											style={[this.canSignUp() ? styles.loginButtonEnabled : styles.loginButtonDisabled, { width: '100%', justifyContent: 'center' }]}>
											<Icon type="Feather" name='user-plus' />
											<Text style={{ fontFamily: "OpenSans-Light" }}>Registrarse</Text>
										</Button>
									</Item>
									<Item style={{ flexDirection: 'row', justifyContent: 'center', borderColor: 'transparent', marginBottom: 15 }}>
										<Button iconLeft onPress={() => this.scrollView.scrollTo({ x: 0, y: 0, animated: true })}
											style={{ backgroundColor: 'rgb(27, 0, 136)', width: '100%', justifyContent: 'center' }}>
											<Icon type="Feather" name='chevron-left' style={{ color: "#fff" }} />
											<Text style={{ fontFamily: "OpenSans-Light", color: "#fff" }}>Volver</Text>
										</Button>
									</Item>
								</Form>
							</ScrollView>
						</View>
					</ScrollView>
				</View>
				<Triangulos up={true} red={false} />
			</Container>
		)
	}

	signUpChofer() {
		this.props.onSignupPressChofer(this.state.dni, this.state.usuario, this.state.nombre, this.state.apellido, this.state.pass, this.state.perfil, this.state.patente, this.state.proveedor, this.state.marca, this.state.modelo)
	}

	signUpTripulante() {
		this.props.onSignupPressTripulante(this.state.dni, this.state.usuario, this.state.nombre, this.state.apellido, this.state.pass, this.state.perfil, this.state.calle, this.state.calleNro, this.state.localidad)
	}

	canLogin() {
		return this.state.usuario && this.state.pass
	}

	canSignUp() {
		return this.state.dni && this.state.usuario && this.state.nombre && this.state.apellido && this.state.pass && this.state.pass.length > 5 
			&& (
				(this.state.perfil == 6 && this.state.patente && this.state.proveedor != 'placeholder' && this.state.marca != 'placeholder' && this.state.modelo != 'placeholder')
				||
				(this.state.perfil != 6 && this.state.perfil != 'placeholder' && this.state.calle && this.state.calleNro && this.state.localidad)
			)
	}

	passwordToggle() {
		this.setState({ mostrarPass: !this.state.mostrarPass })
	}

	setModalResetPassVisible(visible) {
		this.setState({ modalResetPassVisible: visible, resetPassEmail: '' });
	}

	onPerfilChange(p) {
		this.setState({
			perfil: p,
			patente: '',
			proveedor: 'placeholder',
			marca: 'placeholder',
			modelo: 'placeholder',
			calle: '',
			calleNro: '',
			localidad: ''
		});
	}

	onProveedorChange(p) {
		this.setState({
			proveedor: p
		});
	}

	onMarcaChange(m) {
		let newModelosDisplay = []
		this.state.marcas_modelos.map((mm) => { if (mm.marca_id == m) newModelosDisplay.push(mm) })
		this.setState({
			marca: m,
			modelos_display: newModelosDisplay,
			modelo: 'placeholder'
		});
	}

	onModeloChange(m) {
		console.log('onModeloChange', m)
		this.setState({
			modelo: m
		});
	}

	async getPerfiles() {
		var perfiles = null;
		try {
			const response = await fetch(Const.webURLPublica + '/getPerfiles', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
				}),
			})
			perfiles = (await response.json());
			console.log("getPerfiles perfiles", perfiles)
		} catch (error) {
			Alert.alert(
				'Error interno',
				'Error al obtener los perfiles.',
				[
					{ text: 'Ok', onPress: () => null }
				],
				{ cancelable: true }
			)
			console.log("No se pudieron obtener los perfiles.", error);
		}
		return perfiles;
	}

	async getProveedores() {
		var proveedores = null;
		try {
			const response = await fetch(Const.webURLPublica + '/getProveedores', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
				}),
			})
			proveedores = (await response.json());
			console.log("getProveedores proveedores", proveedores)
		} catch (error) {
			Alert.alert(
				'Error interno',
				'Error al obtener los proveedores.',
				[
					{ text: 'Ok', onPress: () => null }
				],
				{ cancelable: true }
			)
			console.log("No se pudieron obtener los proveedores.", error);
		}
		return proveedores;
	}
}

const styles = StyleSheet.create({
	loginScreenContainer: {
		backgroundColor: '#1b0088'
	},
	loginLogoView: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').width * 9 / 16,
		//backgroundColor: 'red',
		alignItems: 'center',
		justifyContent: 'center'
	},
	loginFieldsView: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').width * 9 / 16,
		//backgroundColor: 'skyblue',
		flexDirection: 'column',
		alignItems: 'stretch',
		justifyContent: 'flex-start',
		color: '#fff'
	},
	formItem: {
		backgroundColor: 'rgba(255,255,255,0.8)',
		borderRadius: 15,
		paddingBottom: 25,
		paddingRight: 25,
		paddingLeft: 25,
		borderBottomColor: 'transparent',
		marginBottom: 10,
		marginTop: 0
	},
	formLabel: {
		fontFamily: "OpenSans-Light",
		color: '#2b2b2b',
		fontSize: 20,
		marginLeft: 25
	},
	formLabelGrey: {
		fontFamily: "OpenSans-Light",
		color: '#616161',
		fontSize: 16,
		marginLeft: 25
	},
	formTextInput: {
		fontFamily: "OpenSans-Light",
		color: '#2b2b2b',
		height: 50,
		borderBottomColor: '#2b2b2b',
		borderBottomWidth: 1,
		textAlignVertical: 'bottom'
	},
	loginButtonEnabled: {
		backgroundColor: '#b30f3b',
		color: '#fff'
	},
	loginButtonDisabled: {
		backgroundColor: '#7d0a29',
		opacity: 0.6
	},
	modalTitle: {
		fontFamily: "OpenSans-Regular",
		fontSize: 22,
		color: '#fff',
	},
	modalText: {
		fontFamily: "OpenSans-Light",
		fontSize: 20,
		color: '#2b2b2b',
	}
});
