import React from 'react';
import { StatusBar, Dimensions, Text, View, FlatList, Image, TouchableOpacity, TouchableHighlight, Modal, TimePickerAndroid, Switch, TextInput, Alert, ToastAndroid } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Spinner, Icon, Button } from 'native-base';
import NuevaPlanta from './NuevaPlanta'
import Configuracion from './Configuracion'
import EditarNombre from './EditarNombre'
import CalendarioComponent from './CalendarioComponent'
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import styled from 'styled-components'
import NativeAlarmSetter from './NativeAlarmSetter'
import { Colors } from './Const'

const options = {
	title: 'Elija una foto para la nueva planta',
	takePhotoButtonTitle: 'Tomar una foto',
	chooseFromLibraryButtonTitle: 'Elegir foto desde el teléfono ...',
	customButtons: [],
	storageOptions: {
		skipBackup: true,
		path: 'images',
	},
};
const diasRiego = ["D", "L", "M", "M", "J", "V", "S"]
const hoy = (new Date()).getDay() // retorna un numero entre 0 y 6 (Domingo, Lunes, ...)
const plantasDebug = [
	{ name: 'Monstera', image: require("./img/plantas/monstera.jpg"), diasRiego: [3, 4, 5], diasAlimento: [0, 3, 5], hora: 10, minutos: 15, alarma: true, alarmasID: [], vasosAgua: '2', vasosAlimento: '1' },
	{ name: 'Aloe Vera', image: require("./img/plantas/aloe-vera.jpg"), diasRiego: [2, 5], diasAlimento: [1, 3, 4], hora: 12, minutos: 45, alarma: false, alarmasID: [], vasosAgua: '1.5', vasosAlimento: '1.5' },
	{ name: 'Philodendron', image: require("./img/plantas/philodendron.jpg"), diasRiego: [1, 5, 6], diasAlimento: [4, 5], hora: 15, minutos: 25, alarma: true, alarmasID: [], vasosAgua: '4', vasosAlimento: '2' },
	{ name: null }
]
const logo = require("./img/logo-leaf.png")
/*
const topColor = '#0b0b0b'
const mainColor = '#004d40'
const controlColor = '#237051'
const nameControlColor = '#10654A' */
const topColor = '#fff'// '#1b5020'
const mainColor = '#f1f1f1' //'#2e7d32'
const controlColor = '#388e3c'
const nameControlColor = '#43a047'

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()
		this.NuevaPlantaModal = React.createRef()
		this.ConfiguracionModal = React.createRef()
		this.EditarNombreModal = React.createRef()

		this.state = {
			isRefreshing: true,
			showModalHoraVasos: false,
			selectedHour: null,
			selectedMinutes: null,
			selectedVasosAgua: 0,
			selectedVasosAlimento: 0,
			alarmOn: false,
			nuevaPlantaFoto: null,
			nuevaPlantaName: "",
			data: [], // dummy plant para agregar una nueva
			currentIndex: 0,
			viewableItem: 0,
		};
	}

	reloadPlantas = () => {
		this.setState({ isRefreshing: true }, async () => {
			try {
				const data = await AsyncStorage.getItem('Plantas');
				if (data !== null) {
					this.setState({ data: JSON.parse(data) })
				}
			} catch (error) {
				// Error retrieving data
			}
			this.setState({ isRefreshing: false })
		})
	}

	/*
	handleScroll = (event) => { console.log(event.nativeEvent.contentOffset.x) }

	getIndexOffset = (index) => { return index * Dimensions.get('window').width }

	onBackPress = () => {
		if (this.state.currentIndex > 0)
			this.setState({ currentIndex: this.state.currentIndex - 1 }, () => this.PlantList.scrollToIndex({ animated: true, index: "" + this.state.currentIndex }))
	}

	onForwardPress = () => {
		if (this.state.currentIndex < this.state.data.length - 1)
			this.setState({ currentIndex: this.state.currentIndex + 1 }, () => this.PlantList.scrollToIndex({ animated: true, index: "" + this.state.currentIndex }))
	}
	*/

	onNewPlantPress = () => {
		this.NuevaPlantaModal.show()
	}

	onConfiguracionPress = () => {
		this.ConfiguracionModal.show()
	}

	onEditNombrePress = () => {
		this.EditarNombreModal.show()
	}

	onThumbPress = (index) => {
		var { currentIndex } = this.state
		if (currentIndex != index)
			this.setState({ currentIndex: index }, () => this.PlantList.scrollToIndex({ animated: true, index: "" + this.state.currentIndex }))
	}

	onModalHoraVasosPress = () => {
		var { data, currentIndex, alarmOn } = this.state
		this.setState({
			selectedHour: data[currentIndex].hora,
			selectedMinutes: data[currentIndex].minutos,
			alarmOn: data[currentIndex].alarma,
			selectedVasosAgua: data[currentIndex].vasosAgua,
			selectedVasosAlimento: data[currentIndex].vasosAlimento,
			showModalHoraVasos: true
		})
	}

	onModalHoraVasosHide = () => {
		this.setState({ showModalHoraVasos: false })
	}

	onSelectTimePress = async () => {
		const { selectedHour, selectedMinutes } = this.state
		try {
			const { action, hour, minute } = await TimePickerAndroid.open({
				hour: selectedHour,
				minute: selectedMinutes,
				is24Hour: true, // Will display '2 PM'
			});
			if (action !== TimePickerAndroid.dismissedAction) {
				// Selected hour (0-23), minute (0-59)
				this.setState({ selectedHour: hour, selectedMinutes: minute })
			}
		} catch ({ code, message }) {
			console.warn('Cannot open time picker', message);
		}
	}

	onAlarmSwitch = () => {
		this.setState({ alarmOn: !this.state.alarmOn })
	}

	onSelectedVasosAguaChange = (value) => {
		this.setState({ selectedVasosAgua: value })
	}

	onSelectedVasosAlimentoChange = (value) => {
		this.setState({ selectedVasosAlimento: value })
	}

	setAlarmCurrentPlant = () => {
		var { data, currentIndex } = this.state
		this.cancelAlarmsCurrentPlant() // cancelar todas las alarmas de la planta antes de agregar nuevas (para que no queden repetidas)
		let currentPlanta = data[currentIndex]
		currentPlanta.diasRiego.map(async (dia) => {
			const idAlarmaRiego = await NativeAlarmSetter.setAlarm(currentPlanta.name, 0, (dia + 1), currentPlanta.hora, currentPlanta.minutos)
			data[currentIndex].alarmasID.push(idAlarmaRiego.alarmId)
			//ToastAndroid.show("nueva idalarma: " + idAlarma);
		})
		currentPlanta.diasAlimento.map(async (dia) => {
			const idAlarmaAlimento = await NativeAlarmSetter.setAlarm(currentPlanta.name, 1, (dia + 1), currentPlanta.hora, currentPlanta.minutos)
			data[currentIndex].alarmasID.push(idAlarmaAlimento.alarmId)
			//ToastAndroid.show("nueva idalarma: " + idAlarma);
		})
		this.setState({ data: data }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)) })
	}

	cancelAlarmsCurrentPlant = () => {
		var { data, currentIndex } = this.state
		const currentPlanta = data[currentIndex]
		const alarmasID = currentPlanta.alarmasID
		for (var i = 0; i < alarmasID.length; i++) {
			NativeAlarmSetter.cancelAlarm("" + alarmasID[i])
		}
		data[currentIndex].alarmasID = []
		this.setState({ data: data }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)) })
	}

	onSaveModalHoraVasos = () => {
		var { data, currentIndex, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosAlimento } = this.state
		data[currentIndex].hora = selectedHour
		data[currentIndex].minutos = selectedMinutes
		data[currentIndex].alarma = alarmOn
		data[currentIndex].vasosAgua = selectedVasosAgua
		data[currentIndex].vasosAlimento = selectedVasosAlimento
		this.setState({ data: data, showModalHoraVasos: false },
			() => {
				AsyncStorage.setItem('Plantas', JSON.stringify(data))
				this.state.alarmOn ? this.setAlarmCurrentPlant() : this.cancelAlarmsCurrentPlant()
			})
	}

	onDiaPress = (diasRiego, diasAlimento) => {
		var { data, currentIndex } = this.state
		data[currentIndex].diasRiego = diasRiego
		data[currentIndex].diasAlimento = diasAlimento
		this.setState({ data: data }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)); if (this.state.alarmOn) this.setAlarmCurrentPlant() })
	}
	/*
	onDiaPress = (index) => {
		var { data, currentIndex } = this.state

		if (data[currentIndex].diasRiego.includes(index) && data[currentIndex].diasAlimento.includes(index)) {
			delete data[currentIndex].diasRiego[data[currentIndex].diasRiego.indexOf(index)]
		} else if (data[currentIndex].diasRiego.includes(index))
			data[currentIndex].diasAlimento.push(index)
		else if (data[currentIndex].diasAlimento.includes(index))
			delete data[currentIndex].diasAlimento[data[currentIndex].diasAlimento.indexOf(index)]
		else {
			data[currentIndex].diasRiego.push(index)
		}

		this.setState({ data: data }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)); if (this.state.alarmOn) this.setAlarmCurrentPlant() })
	}
*/
	onFinishEditar = (plantaName, selectedHour, selectedMinutes, alarmOn,selectedVasosAgua,			selectedVasosFertilizante) => {
		if (plantaName != "")
			this.setState({ isRefreshing: true }, async () => {
				var { data, currentIndex } = this.state
				data[currentIndex].name = plantaName
				data[currentIndex].hora = selectedHour
				data[currentIndex].minutos = selectedMinutes
				data[currentIndex].alarma = alarmOn
				data[currentIndex].vasosAgua= selectedVasosAgua,
				data[currentIndex].vasosAlimento = selectedVasosFertilizante
				try {
					await AsyncStorage.setItem('Plantas', JSON.stringify(data));
					//RESETEAR LAS ALARMAS
				} catch (error) {
					// Error retrieving data
				}
				this.setState({ data: data, isRefreshing: false })
			})
	}

	onChooseNuevaPlantaFoto = () => {
		var { data, currentIndex } = this.state
		ImagePicker.showImagePicker(options, (response) => {
			console.log('Response = ', response);

			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			} else {
				const source = { uri: response.uri };

				if (data[currentIndex].name) {// si la planta ya existe, cambiar la foto, si no es una nueva y hay que hacer submit
					data[currentIndex].image = source
					this.setState({ data: data }, () => {
						AsyncStorage.setItem('Plantas', JSON.stringify(data))
					});
				} else {
					this.setState({ nuevaPlantaFoto: source });
				}
			}
		});
	}

	nuevaPlantaTextChange = (text) => {
		this.setState({ nuevaPlantaName: text })
	}

	crearNuevaPlanta = (nombre, foto) => {
		return {
			name: nombre,
			image: foto,
			diasRiego: [],
			diasAlimento: [],
			hora: 0,
			minutos: 0,
			alarma: false,
			alarmasID: [],
			vasosAgua: 0,
			vasosAlimento: 0
		}
	}

	submitNuevaPlanta = () => {
		this.setState({ isRefreshing: true }, async () => {
			var { data, nuevaPlantaName, nuevaPlantaFoto } = this.state
			const planta = this.crearNuevaPlanta(nuevaPlantaName, nuevaPlantaFoto)
			data.pop()
			data.push(planta)
			try {
				await AsyncStorage.setItem('Plantas', JSON.stringify(data));
			} catch (error) {
				// Error retrieving data
			}
			this.setState({ nuevaPlantaName: '', nuevaPlantaFoto: null, data: data, isRefreshing: false, currentIndex: 0 },
				() => { this.PlantList.scrollToIndex({ animated: true, index: '0' }); })
		})
	}

	deleteCurrentPlant = () => {
		Alert.alert(
			'Eliminar planta',
			'¿Está seguro que desea eliminar la planta de su colección?',
			[
				{ text: 'Cancelar', onPress: () => null },
				{
					text: 'Sí', onPress: () => {
						this.setState({ isRefreshing: true }, async () => {
							var { data, currentIndex } = this.state
							this.cancelAlarmsCurrentPlant()
							data.splice(currentIndex, 1)
							try {
								await AsyncStorage.setItem('Plantas', JSON.stringify(data));
							} catch (error) {
								// Error retrieving data
							}
							this.setState({ data: data, currentIndex: this.state.currentIndex > 0 ? this.state.currentIndex - 1 : 0, isRefreshing: false })
						})
					}
				},
			],
			{ cancelable: true }
		)
	}

	cancelAllAlarms = async () => {
		var { data } = this.state
		var currentPlanta, alarmasID
		for (var i = 0; i < data.length; i++) {
			currentPlanta = data[i]
			alarmasID = currentPlanta.alarmasID ? currentPlanta.alarmasID : [] // el ultimo elemento es dummy, no tiene alarmas
			for (var j = 0; j < alarmasID.length; j++) {
				await NativeAlarmSetter.cancelAlarm("" + alarmasID[j])
			}
		}
		data = [{ name: null }]
		this.setState({ data: data, currentIndex: 0 }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)); this.reloadPlantas() })

	}

	onReset = () => {
		this.setState({ isRefreshing: true }, async () => {
			await this.cancelAllAlarms()
			this.setState({ isRefreshing: true }, () => this.reloadPlantas())
		})
	}

	onFinishSubmitting = () => {
		if (this.NuevaPlantaModal) this.NuevaPlantaModal.hide()
		this.reloadPlantas()
	}

	onPlantListPageChange = ({ viewableItems }) => {
		const { currentIndex } = this.state
		const firstViewableItem = viewableItems[0].key;
		if (firstViewableItem != currentIndex)
			this.setState({ viewableItem: firstViewableItem })
	}

	onPlantListMomentumEnd = () => {
		const { currentIndex, viewableItem } = this.state
		if (viewableItem != currentIndex)
			this.setState({ currentIndex: viewableItem }, () => this.PlantList.scrollToIndex({ animated: true, index: "" + this.state.currentIndex }))
	}

	componentDidMount = async () => {
		//AsyncStorage.setItem('Plantas', JSON.stringify([{ name: null }]))
		this.reloadPlantas()
		//	if (this.NuevaPlantaModal) this.NuevaPlantaModal.show()
	}

	render = () => {
		const { data, currentIndex, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosAlimento, nuevaPlantaName, nuevaPlantaFoto, isRefreshing } = this.state
		const screenWidth = Dimensions.get('window').width
		const screenHeight = Dimensions.get('window').height
		const currentPlanta = data[currentIndex]
		const nuevaPlantaReadyToAdd = nuevaPlantaName != '' // && nuevaPlantaFoto 
		return (
			<Container >
				<Header transparent>
					<Body>
						<Text style={{ fontFamily: "DosisLight", fontSize: 28, color: '#2b2b2b' }}>Plant Care</Text>
					</Body>
					<Right>
						{data.length > 0 && <TouchableOpacity onPress={() => this.onNewPlantPress()} style={{ marginLeft: 10, marginRight: 10 }}>
							<Icon type="EvilIcons" name="plus" style={{ fontSize: 38, color: '#414141' }} />
						</TouchableOpacity>}
						<TouchableOpacity onPress={this.onConfiguracionPress} style={{ marginLeft: 10, marginRight: 10, paddingBottom: 2 }}>
							<Icon type="EvilIcons" name="gear" style={{ fontSize: 34, color: '#414141' }} />
						</TouchableOpacity>
					</Right>
				</Header>
				<NuevaPlanta ref={(r) => this.NuevaPlantaModal = r} onFinishSubmitting={this.onFinishSubmitting} />
				<Configuracion ref={(r) => this.ConfiguracionModal = r} onReset={this.onReset} />
				<EditarNombre ref={(r) => this.EditarNombreModal = r}
					plantaName={currentPlanta ? currentPlanta.name : null}
					selectedHour={currentPlanta ? currentPlanta.hora : null}
					selectedMinutes={currentPlanta ? currentPlanta.minutos : null}
					alarmOn={currentPlanta ? currentPlanta.alarmOn : null}
					onFinishEditar={this.onFinishEditar} />
				{
					data.length > 0 &&
					<View style={{ height: 65, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
						<FlatList
							ref={(r) => this.ThumbPlantList = r}
							horizontal
							scrollEnabled={true}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ flex: 1, paddingHorizontal: 10, }}
							data={data}
							initialScrollIndex={0}
							extraData={[this.state.isRefreshing, this.state.nuevaPlantaFoto]}
							keyExtractor={(item, index) => 'plant' + index}
							renderItem={({ item, index }) => (
								<View style={{ width: screenWidth * 0.15, height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
									<TouchableOpacity onPress={() => this.onThumbPress(index)}>
										<View style={{
											width: 50, height: 50,
											borderRadius: 25,
											borderWidth: 2,
											borderColor: item.name ? controlColor : 'transparent',
											overflow: 'hidden',
											justifyContent: 'center',
											alignItems: 'center',
											backgroundColor: item.name ? 'rgba(255,255,255,0)' : 'transparent',
											opacity: index == currentIndex || !item.name ? 1 : 0.4
										}}>
											{
												item.image ?
													<Image source={item.image}
														style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
													: <Text style={{ fontFamily: "DosisLight", fontSize: 30, color: '#2b2b2b' }}>{item.name.substring(0, 1)}</Text>
											}
										</View>
									</TouchableOpacity>
								</View>
							)}
						/>
					</View>
				}
				{
					isRefreshing ?
						<View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color={Colors.accentColor} /></View>
						:
						<View style={{
							flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
							backgroundColor: mainColor,
						}}>
							{
								data.length == 0 ?
									<TouchableOpacity onPress={this.onNewPlantPress} style={{ margin: 15 }}>
										<Icon type="EvilIcons" name="plus" style={{ fontSize: 82, color: Colors.accentColor, opacity: 0.8, }} />
									</TouchableOpacity>
									: <View style={{
										flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
									}}>
										<Modal
											animationType="slide"
											transparent={false}
											visible={this.state.showModalHoraVasos}
											onRequestClose={this.onModalHoraVasosHide}>
											<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
												<View style={{ flex: 2, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', margin: 10 }}>
													<TouchableOpacity onPress={this.onSelectTimePress} style={{ margin: 15 }}>
														<Text style={{ fontFamily: "DosisLight", fontSize: 56, color: '#2b2b2b' }}>{selectedHour < 10 ? "0" + selectedHour : selectedHour}:{selectedMinutes < 10 ? "0" + selectedMinutes : selectedMinutes} hs</Text>
													</TouchableOpacity>
													<TouchableOpacity onPress={this.onAlarmSwitch} style={{ margin: 15 }}>
														<Icon type="Feather" name={alarmOn ? "award" : "bar-chart"} style={{ fontSize: 32, color: alarmOn ? '#ff5722' : '#616161', marginRight: 10 }} />
													</TouchableOpacity>
												</View>
												<View style={{ flex: 1, width: screenWidth * 0.85, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<TextInput
														keyboardType='numeric'
														onChangeText={(valor) => this.onSelectedVasosAguaChange(valor)}
														value={"" + selectedVasosAgua}
														maxLength={4}  //setting limit of input
														style={{ padding: 10, fontSize: 56, textAlign: 'center', fontFamily: "DosisLight", color: '#2b2b2b' }}
													/>
													<Icon type="Entypo" name="drop" style={{ fontSize: 56, color: '#616161', padding: 10 }} />
												</View>
												<View style={{ flex: 1, width: screenWidth * 0.85, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
													<TextInput
														keyboardType='numeric'
														onChangeText={(valor) => this.onSelectedVasosAlimentoChange(valor)}
														value={"" + selectedVasosAlimento}
														maxLength={4}  //setting limit of input
														style={{ padding: 10, fontSize: 56, textAlign: 'center', fontFamily: "DosisLight", color: '#2b2b2b' }}
													/>
													<Icon type="Entypo" name="flash" style={{ fontSize: 56, color: '#616161', padding: 10 }} />
												</View>
												<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 10 }}>
													<TouchableOpacity onPress={this.onSaveModalHoraVasos}
														style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: 'rgba(255,87,34,0.7)', padding: 10 }}>
														<Icon type="Feather" name="box" style={{ fontSize: 22, color: '#fff', marginRight: 10 }} />
														<Text style={{ fontFamily: "DosisLight", fontSize: 26, color: '#fff' }}>Guardar</Text>
													</TouchableOpacity>
												</View>
											</View>
										</Modal >
										<View style={{
											flex: 3,
											flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
											width: screenWidth,
										}}>
											<View style={{ width: screenWidth, height: '100%', }}>
												<FlatList
													ref={(r) => this.PlantList = r}
													horizontal
													scrollEnabled={true}
													bounces={false}
													pagingEnabled={true}

													decelerationRate='fast'
													snapToAlignment="center"
													snapToInterval={screenWidth}
													onMomentumScrollEnd={this.onPlantListMomentumEnd}
													onViewableItemsChanged={this.onPlantListPageChange}
													showsHorizontalScrollIndicator={false}
													data={data}
													initialScrollIndex={0}
													extraData={[this.state.isRefreshing, this.state.nuevaPlantaFoto]}
													keyExtractor={(item, index) => "" + index}
													renderItem={({ item, index }) => (
														<View style={{ width: screenWidth, height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
															<View style={{
																width: '100%', height: '100%',
																overflow: 'hidden',
																justifyContent: 'center',
																alignItems: 'center'
															}}>
																{
																	item.image ?
																		<Image source={item.image} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
																		: <Image source={logo} style={{ height: '50%', width: '50%', resizeMode: 'contain', opacity: 0.7 }} />
																}
																<View style={{ position: 'absolute', bottom: 15, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
																	<View style={{ backgroundColor: 'rgba(255,255,255,0.9)', width: 40, height: 40, borderRadius: 20, borderColor: '#2b2b2b', borderWidth: 1, marginLeft: 15, marginRight: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
																		<TouchableOpacity onPress={this.onChooseNuevaPlantaFoto}>
																			<Icon type="EvilIcons" name="camera" style={{ fontSize: 34, color: '#2b2b2b' }} />
																		</TouchableOpacity>
																	</View>
																	<View style={{ backgroundColor: 'rgba(255,255,255,0.9)', width: 40, height: 40, borderRadius: 20, borderColor: '#2b2b2b', borderWidth: 1, marginLeft: 15, marginRight: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
																		<TouchableOpacity onPress={this.deleteCurrentPlant}>
																			<Icon type="EvilIcons" name="trash" style={{ fontSize: 34, color: '#2b2b2b' }} />
																		</TouchableOpacity>
																	</View>
																	<View style={{ backgroundColor: 'rgba(255,255,255,0.9)', width: 40, height: 40, borderRadius: 20, borderColor: '#2b2b2b', borderWidth: 1, marginLeft: 15, marginRight: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
																		<TouchableOpacity onPress={this.onEditNombrePress}>
																			<Icon type="EvilIcons" name="pencil" style={{ fontSize: 34, color: '#2b2b2b' }} />
																		</TouchableOpacity>
																	</View>
																</View>
															</View>
															{
																<View style={{
																	position: 'absolute', top: 10, left: 0,
																	width: '100%',
																	flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
																}}>
																	<View style={{
																		flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
																		padding: 10,
																		backgroundColor: nameControlColor,
																		borderRadius: 15,
																		//	elevation: 15
																	}}>
																		<Text style={{ fontFamily: "DosisLight", fontSize: 22, borderColor: 'transparent', color: '#f1f1f1' }}>{currentPlanta.name}</Text>
																	</View>
																</View>
															}
														</View>

													)}
												/>
											</View>
										</View>
										<View style={{ flex: 1, backgroundColor: Colors.accentColor, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', paddingLeft: '5%', paddingRight: '5%', }}  >
											<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
												<CalendarioComponent color={"#f1f1f1"} onDiaPress={this.onDiaPress} diasRiego={currentPlanta.diasRiego} diasAlimento={currentPlanta.diasAlimento} />
											</View>
											<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', paddingLeft:3 }}>
												<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '25%' }}>
													<Text style={{ fontFamily: "DosisLight", fontSize: 20, color: '#f1f1f1', marginRight: 5 }}>{currentPlanta.vasosAgua} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
													<Icon type="Entypo" name="drop" style={{ fontSize: 22, color: '#f1f1f1', marginLeft: 5 }} />
												</View>
												<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '25%' }}>
													<Text style={{ fontFamily: "DosisLight", fontSize: 20, color: '#f1f1f1', marginRight: 5 }}>{currentPlanta.vasosAlimento} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
													<Icon type="Entypo" name="flash" style={{ fontSize: 22, color: '#f1f1f1', marginLeft: 5 }} />
												</View>
												<View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '50%' }}>
												<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#f1f1f1' }}>{currentPlanta.hora < 10 ? "0" + currentPlanta.hora : currentPlanta.hora}:{currentPlanta.minutos < 10 ? "0" + currentPlanta.minutos : currentPlanta.minutos}</Text>
												<Icon type="EvilIcons" name={"bell"} style={{ fontSize: 27, color: currentPlanta.alarma ? '#f1f1f1' : '#a1a1a1' }} />
												</View>
											</View>
										</View>
									</View>
							}
						</View>
				}
			</Container>
		);
	}
}