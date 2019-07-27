import React from 'react';
import { PermissionsAndroid, Dimensions, Text, View, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Container, Header, Body, Right, Spinner, Icon, } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import CalendarioComponent from './CalendarioComponent'
import TimePickerComponent from './TimePickerComponent'
import NativeAlarmSetter from './NativeAlarmSetter'
import { Colors, Labels } from './Const'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default class NuevaPlanta extends React.Component {
	constructor(props) {
		super(props);

		this.NewPlantStepsList = React.createRef()

		this.state = {
			show: false,
			isRefreshing: false,
			step: 0,
			nuevaPlantaName: "",
			nuevaPlantaFoto: null,
			diasRiego: [],
			diasAlimento: [],
			selectedHour: 0,
			selectedMinutes: 0,
			alarmOn: true,
			selectedVasosAgua: 0,
			selectedVasosFertilizante: 0
		};
	}

	show = () => {
		this.setState({ show: true, step: 0 }, () => this.NewPlantStepsList.scrollTo({ x: 0, animated: true }))
	}

	hide = () => {
		this.setState({ show: false })
	}

	resetForm = async () => {
		await this.setState({
			step: 0,
			nuevaPlantaName: "",
			nuevaPlantaFoto: null,
			diasRiego: [],
			diasAlimento: [],
			selectedHour: 0,
			selectedMinutes: 0,
			alarmOn: true,
			selectedVasosAgua: 0,
			selectedVasosFertilizante: 0
		})
	}

	onChooseNuevaPlantaFotoCamara = async () => {
		const { idioma } = this.props
		const permisoGranted = await this.requestCameraPermission() && await this.requestGaleriaPermission()
		if (permisoGranted) ImagePicker.launchCamera(Labels[idioma].permisoCamera, (response) => {
			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			} else {
				const source = { uri: response.uri };
				this.setState({ nuevaPlantaFoto: source });
			}
		});
		else Alert.alert(
			Labels[idioma].permisosAlerta.titulo,
			Labels[idioma].permisosAlerta.descripcion,
			[
				{
					text: 'Ok', onPress: () => null
				},
			],
			{ cancelable: true }
		)
	}

	onChooseNuevaPlantaFotoGaleria = async () => {
		const { idioma } = this.props
		const permisoGranted = await this.requestCameraPermission() && await this.requestGaleriaPermission()
		if (permisoGranted) ImagePicker.launchImageLibrary(Labels[idioma].permisoGaleria, (response) => {
			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			} else {
				const source = { uri: response.uri };
				this.setState({ nuevaPlantaFoto: source });
			}
		});
		else Alert.alert(
			Labels[idioma].permisosAlerta.titulo,
			Labels[idioma].permisosAlerta.descripcion,
			[
				{
					text: 'Ok', onPress: () => null
				},
			],
			{ cancelable: true }
		)
	}

	requestCameraPermission = async () => {
		try {
			const grantedCamera = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
			return (grantedCamera === PermissionsAndroid.RESULTS.GRANTED);
		} catch (err) {
			console.warn(err);
			return false;
		}
	}


	requestGaleriaPermission = async () => {
		try {
			const grantedGaleria = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
			return (grantedGaleria === PermissionsAndroid.RESULTS.GRANTED);
		} catch (err) {
			console.warn(err);
			return false;
		}
	}

	onChooseNuevaPlantaFotoDelete = () => {
		this.setState({ nuevaPlantaFoto: null });
	}

	onDiaPress = (diasRiego, diasAlimento) => {
		this.setState({ diasRiego: diasRiego, diasAlimento: diasAlimento })
	}

	onSelectTime = (selectedHour, selectedMinutes) => {
		this.setState({ selectedHour: selectedHour, selectedMinutes: selectedMinutes })
	}

	onAlarmSwitch = () => {
		this.setState({ alarmOn: !this.state.alarmOn })
	}

	onSelectedVasosAguaChange = (value) => {
		this.setState({ selectedVasosAgua: value })
	}

	onSelectedVasosFertilizanteChange = (value) => {
		this.setState({ selectedVasosFertilizante: value })
	}

	crearNuevaPlanta = (nombre, foto, diasRiego, diasAlimento, hora, minutos, alarmOn, vasosAgua, vasosAlimento, ) => {
		return {
			name: nombre,
			images: [foto],
			diasRiego: diasRiego,
			diasAlimento: diasAlimento,
			hora: hora,
			minutos: minutos,
			alarma: alarmOn,
			alarmasID: [],
			vasosAgua: vasosAgua,
			vasosAlimento: vasosAlimento
		}
	}

	setPlantAlarms = async (planta) => {
		var diasAlarma = planta.diasRiego.concat(planta.diasAlimento);
		var diasUnique = diasAlarma.filter(function (item, pos) { return diasAlarma.indexOf(item) == pos });

		diasUnique.map(async (dia) => {
			const idAlarmaRiego = await NativeAlarmSetter.setAlarm(planta.name, 0, (dia + 1), planta.hora, planta.minutos)
			planta.alarmasID.push(idAlarmaRiego.alarmId)
		})
		return planta
	}

	onSubmitPlanta = () => {
		const { idioma } = this.props
		const { nuevaPlantaName, diasRiego, diasAlimento } = this.state
		// Mostrar un alerta si no se seleccionaron dias de riego y alimento para la nueva planta
		if (diasRiego.length == 0 && diasAlimento.length == 0)
			Alert.alert(
				Labels[idioma].onSubmitPlantaSinDias.title,
				Labels[idioma].onSubmitPlantaSinDias.descripcion + nuevaPlantaName,
				[
					{
						text: Labels[idioma].onSubmitPlantaSinDias.btnCancelar, onPress: () => null
					},
					{
						text: Labels[idioma].onSubmitPlantaSinDias.btnOk, onPress: () => this.submitPlanta()
					},
				],
				{ cancelable: true }
			)
		else this.submitPlanta()
	}

	submitPlanta = () => {
		const { nuevaPlantaName, nuevaPlantaFoto, diasRiego, diasAlimento, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante } = this.state
		this.setState({ isRefreshing: true }, async () => {
			var planta = this.crearNuevaPlanta(nuevaPlantaName, nuevaPlantaFoto, diasRiego, diasAlimento, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante)
			planta = await this.setPlantAlarms(planta)
			var data = await AsyncStorage.getItem('Plantas');
			if (data != null) {
				data = JSON.parse(data)
				data.push(planta)
			} else {
				data = [planta]
			}
			try {
				await AsyncStorage.setItem('Plantas', JSON.stringify(data));
			} catch (error) {
				// Error retrieving data
			}
			await this.resetForm();
			this.setState({ isRefreshing: false }, () => { this.props.onFinishSubmitting() })
		})
	}

	onNextStep = () => {
		const { step } = this.state
		if (this.NewPlantStepsList) {
			this.setState({ step: step + 1 }, () => this.NewPlantStepsList.scrollTo({ x: screenWidth * (step + 1), animated: true }))
		}
	}

	onPrevStep = () => {
		const { step } = this.state
		if (this.NewPlantStepsList) {
			this.setState({ step: step - 1 }, () => this.NewPlantStepsList.scrollTo({ x: screenWidth * (step - 1), animated: true }))
		}
	}

	nuevaPlantaTextChange = (text) => {
		this.setState({ nuevaPlantaName: text })
	}

	render = () => {
		const { idioma } = this.props
		const { show, step, nuevaPlantaName, nuevaPlantaFoto, isRefreshing, alarmOn, selectedVasosAgua, selectedVasosFertilizante } = this.state
		const nuevaPlantaReadyToAdd = nuevaPlantaName != '' // && nuevaPlantaFoto 
		const viewableScreen = screenHeight * 0.9 // pantalla sin header
		const stepFormScreen = screenHeight * 0.9 * 0.85 // pantalla sin header y sin el control de abajo
		return (
			<Modal
				animationType="slide"
				transparent={false}
				visible={show}
				onRequestClose={this.hide}>
				<Container>
					<Header transparent style={{ paddingTop: 0 }}>
						<Body>
							<Text style={{ fontFamily: "DosisLight", fontSize: 28, color: '#2b2b2b' }}>{Labels[idioma].nuevaPlanta.title}</Text>
						</Body>
						<Right>
							<TouchableOpacity onPress={this.hide} style={{ width: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
								<Icon type="EvilIcons" name="chevron-down" style={{ fontSize: 42, color: '#2b2b2b' }} />
							</TouchableOpacity>
						</Right>
					</Header>
					<View style={{
						flex: 1, height: viewableScreen, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
					}}>
						<View style={{ width: screenWidth, height: stepFormScreen, backgroundColor: '#f1f1f1', }}>
							<ScrollView
								ref={(r) => this.NewPlantStepsList = r}
								horizontal
								scrollEnabled={false}
								bounces={false}
								pagingEnabled={true}
								showsHorizontalScrollIndicator={false}
								keyExtractor={(item, index) => "" + index}>
								<View style={{
									width: screenWidth,
									height: stepFormScreen,
									overflow: 'hidden',
									justifyContent: 'center',
									alignItems: 'center'
								}}>
									{nuevaPlantaFoto && <Image source={nuevaPlantaFoto} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />}
									{
										nuevaPlantaFoto ?
											<View style={{ position: 'absolute', bottom: 5, width: '100%', height: '10%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
												<View style={{ width: 50, height: 50, borderRadius: 25, borderColor: '#616161', backgroundColor: '#fff', borderWidth: 2, margin: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<TouchableOpacity onPress={this.onChooseNuevaPlantaFotoCamara}>
														<Icon type="EvilIcons" name="camera" style={{ fontSize: 42, color: '#616161' }} />
													</TouchableOpacity>
												</View>
												<View style={{ width: 50, height: 50, borderRadius: 25, borderColor: '#616161', backgroundColor: '#fff', borderWidth: 2, margin: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<TouchableOpacity onPress={this.onChooseNuevaPlantaFotoGaleria}>
														<Icon type="EvilIcons" name="image" style={{ fontSize: 42, color: '#616161' }} />
													</TouchableOpacity>
												</View>
												<View style={{ width: 50, height: 50, borderRadius: 25, borderColor: '#616161', backgroundColor: '#fff', borderWidth: 2, margin: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<TouchableOpacity onPress={this.onChooseNuevaPlantaFotoDelete}>
														<Icon type="EvilIcons" name="trash" style={{ fontSize: 42, color: '#616161' }} />
													</TouchableOpacity>
												</View>
											</View>
											: <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
												<View style={{ width: 90, height: 90, borderRadius: 45, borderColor: Colors.accentColor, opacity: 0.8, borderWidth: 4, margin: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<TouchableOpacity onPress={this.onChooseNuevaPlantaFotoCamara} style={{}}>
														<Icon type="EvilIcons" name="camera" style={{ fontSize: 82, color: Colors.accentColor }} />
													</TouchableOpacity>
												</View>
												<View style={{ width: 90, height: 90, borderRadius: 45, borderColor: Colors.accentColor, opacity: 0.8, borderWidth: 4, margin: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<TouchableOpacity onPress={this.onChooseNuevaPlantaFotoGaleria} style={{}}>
														<Icon type="EvilIcons" name="image" style={{ fontSize: 82, color: Colors.accentColor }} />
													</TouchableOpacity>
												</View>
											</View>
									}
								</View>
								<View style={{
									width: screenWidth,
									height: stepFormScreen,
									overflow: 'hidden',
									flexDirection: 'column',
									justifyContent: 'flex-start',
									alignItems: 'flex-start',
								}}>
									<ScrollView contentContainerStyle={{ width: screenWidth, paddingLeft: 20, paddingRight: 20, }}>
										<TextInput
											style={{
												width: '100%',
												paddingTop: 10,
												paddingRight: 10,
												paddingBottom: 10,
												paddingLeft: 0,
												color: '#2b2b2b',
												fontFamily: "DosisLight",
												fontSize: 22,
												marginBottom: 30,
												marginTop: 30
											}}
											placeholder={Labels[idioma].nuevaPlanta.lblPlaceholderNombre}
											placeholderTextColor={'#616161'}
											onChangeText={this.nuevaPlantaTextChange}
											autoCapitalize={'words'}
											underlineColorAndroid={Colors.accentColor}
										/>
										<View style={{ marginBottom: 30 }}><CalendarioComponent color={"#2b2b2b"} onDiaPress={this.onDiaPress} idioma={idioma} /></View>
										<View style={{
											width: '100%',
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											marginBottom: 30,
										}}>
											<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b', paddingRight: 10 }}>{Labels[idioma].nuevaPlanta.lblHoraAlarma}</Text>
											<TimePickerComponent fontSize={22} onSelectTime={this.onSelectTime} />
										</View>
										<View style={{
											width: '100%',
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											marginBottom: 30,
											paddingRight: 10
										}}>
											<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>{Labels[idioma].nuevaPlanta.lblNotificaciones}</Text>
											<TouchableOpacity onPress={this.onAlarmSwitch}>
												<Icon type="Feather" name={alarmOn ? "award" : "bar-chart"} style={{ fontSize: 25, color: alarmOn ? Colors.accentColor : '#616161' }} />
											</TouchableOpacity>
										</View>
										<View style={{
											width: '100%',
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											marginBottom: 30,
										}}>
											<TextInput
												style={{
													width: '100%',
													paddingTop: 10,
													paddingRight: 10,
													paddingBottom: 10,
													paddingLeft: 0,
													color: '#2b2b2b',
													fontFamily: "DosisLight",
													fontSize: 22,
												}}
												keyboardType='numeric'
												placeholder={Labels[idioma].nuevaPlanta.lblVasosAgua}
												placeholderTextColor={'#616161'}
												onChangeText={this.onSelectedVasosAguaChange}
												underlineColorAndroid={Colors.accentColor}
											/>
											<Icon type="Entypo" name="drop" style={{ position: 'absolute', right: 0, fontSize: 22, color: selectedVasosAgua > 0 ? Colors.accentColor : '#616161', padding: 10 }} />
										</View>
										<View style={{
											width: '100%',
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											marginBottom: 30,
										}}>
											<TextInput
												style={{
													width: '100%',
													paddingTop: 10,
													paddingRight: 10,
													paddingBottom: 10,
													paddingLeft: 0,
													color: '#2b2b2b',
													fontFamily: "DosisLight",
													fontSize: 22,
												}}
												keyboardType='numeric'
												placeholder={Labels[idioma].nuevaPlanta.lblVasosFertilizante}
												placeholderTextColor={'#616161'}
												onChangeText={this.onSelectedVasosFertilizanteChange}
												underlineColorAndroid={Colors.accentColor}
											/>
											<Icon type="Entypo" name="flash" style={{ position: 'absolute', right: 0, fontSize: 22, color: selectedVasosFertilizante > 0 ? Colors.accentColor : '#616161', padding: 10 }} />
										</View>
									</ScrollView>
								</View>
							</ScrollView>
						</View>
						<View style={{
							flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
							paddingLeft: 10, paddingRight: 10
						}}>
							{
								step == 1 && <TouchableOpacity onPress={this.onPrevStep} style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
									<Icon style={{ fontSize: 34, color: '#2b2b2b', paddingRight: 5 }} type="EvilIcons" name="chevron-left" />
									<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>{Labels[idioma].nuevaPlanta.btnVolver}</Text>
								</TouchableOpacity>
							}
							{
								step == 1 && <TouchableOpacity onPress={this.onSubmitPlanta} style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', opacity: (!nuevaPlantaReadyToAdd || isRefreshing) ? 0.5 : 1 }} disabled={!nuevaPlantaReadyToAdd || isRefreshing}>
									<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b', }}>{Labels[idioma].nuevaPlanta.btnListo}</Text>
									{isRefreshing ? <Spinner color={Colors.accentColor} style={{ marginLeft: 10 }} /> : <Icon style={{ fontSize: 34, color: '#2b2b2b', paddingLeft: 5 }} type="EvilIcons" name="chevron-right" />}
								</TouchableOpacity>
							}
							{
								step == 0 && <TouchableOpacity onPress={this.onNextStep} style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', }}>
									<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>{Labels[idioma].nuevaPlanta.btnSiguiente}</Text>
									<Icon style={{ fontSize: 34, color: '#2b2b2b', paddingLeft: 5 }} type="EvilIcons" name="chevron-right" />
								</TouchableOpacity>
							}
						</View>
					</View>
				</Container>
			</Modal >
		);
	}
}