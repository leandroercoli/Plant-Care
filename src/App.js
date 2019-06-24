import React from 'react';
import { StatusBar, Dimensions, Text, View, FlatList, Image, TouchableOpacity, TouchableHighlight, Modal, TimePickerAndroid, Switch, TextInput, Alert, ToastAndroid } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Spinner, Icon, Button } from 'native-base';
import NuevaPlanta from './NuevaPlanta'
import Configuracion from './Configuracion'
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import styled from 'styled-components'
import NativeAlarmSetter from './NativeAlarmSetter'

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
/*
const topColor = '#0b0b0b'
const mainColor = '#004d40'
const controlColor = '#237051'
const nameControlColor = '#10654A' */
const topColor = '#1b5020'
const mainColor = '#2e7d32'
const controlColor = '#388e3c'
const nameControlColor = '#43a047'

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()

		this.state = {
			isRefreshing: true,
			showModalHoraVasos: false,
			showConfiguracion: false,
			selectedHour: null,
			selectedMinutes: null,
			selectedVasosAgua: 0,
			selectedVasosAlimento: 0,
			alarmOn: false,
			currentPlantaName: "",
			currentPlantaNameChanging: false,
			nuevaPlantaFoto: null,
			nuevaPlantaName: "",
			data: [{ name: null }], // dummy plant para agregar una nueva
			currentIndex: 0,
			viewableItem:0
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

	onConfiguracionOpen = () => {
		this.setState({ showConfiguracion: true })
	}

	onConfiguracionClose = () => {
		this.setState({ showConfiguracion: false })
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

	onCurrentPlantStartNameChange = () => {
		this.setState({ currentPlantaNameChanging: true })
	}

	onCurrentPlantFinishNameChange = () => {
		if (this.state.currentPlantaName != "")
			Alert.alert(
				'Cambiar nombre',
				'¿Está seguro que desea cambiar el nombre de esta planta a \"' + this.state.currentPlantaName + '\"?',
				[
					{ text: 'Cancelar', onPress: () => this.setState({ currentPlantaName: "", currentPlantaNameChanging: false }) },
					{
						text: 'Sí', onPress: () => {
							this.setState({ isRefreshing: true }, async () => {
								var { data, currentIndex } = this.state
								data[currentIndex].name = this.state.currentPlantaName
								try {
									await AsyncStorage.setItem('Plantas', JSON.stringify(data));
								} catch (error) {
									// Error retrieving data
								}
								this.setState({ data: data, isRefreshing: false, currentPlantaNameChanging: false })
							})
						}
					},
				],
				{ cancelable: true }
			)
		else this.setState({ currentPlantaNameChanging: false })
	}

	onCurrentPlantNameChanging = (text) => {
		this.setState({ currentPlantaName: text })
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
			data.push({ name: null })
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
		this.setState({ showConfiguracion: false, isRefreshing: true }, async () => {
			await this.cancelAllAlarms()
			this.setState({ isRefreshing: true }, () => this.reloadPlantas())
		})
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
	}

	render = () => {
		const { data, currentIndex, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosAlimento, currentPlantaName, nuevaPlantaName, nuevaPlantaFoto, isRefreshing } = this.state
		const screenWidth = Dimensions.get('window').width
		const screenHeight = Dimensions.get('window').height
		const currentPlanta = data[currentIndex]
		const nuevaPlantaReadyToAdd = nuevaPlantaName != '' // && nuevaPlantaFoto 
		return (
			<Container style={{ backgroundColor: topColor }}>
				<Header transparent>
					<Body>
						<Text style={{ fontFamily: "DosisLight", fontSize: 28, color: '#d1d1d1' }}>Plant Care</Text>
					</Body>
					<Right>
						<TouchableOpacity onPress={this.onConfiguracionOpen} style={{ margin: 10 }}>
							<Icon type="EvilIcons" name="gear" style={{ fontSize: 34, color: '#d1d1d1' }} />
						</TouchableOpacity>
					</Right>
				</Header>
				{
					data.length > 1 &&
					<View style={{ height: 65, width: '100%' }}>
						<FlatList
							ref={(r) => this.ThumbPlantList = r}
							horizontal
							scrollEnabled={true}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ paddingHorizontal: 10 }}
							data={data}
							initialScrollIndex={0}
							extraData={[this.state.isRefreshing, this.state.nuevaPlantaFoto, currentPlantaName]}
							keyExtractor={(item, index) => 'plant' + index}
							renderItem={({ item, index }) => (
								<View style={{ width: screenWidth * 0.15, height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
									<TouchableOpacity onPress={() => this.onThumbPress(index)}>
										{
											item.name ?
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
															: <Text style={{ fontFamily: "DosisLight", fontSize: 30, color: '#d1d1d1' }}>{item.name.substring(0, 1)}</Text>
													}
												</View>
												: <Icon type="EvilIcons" name="plus" style={{ fontSize: 44, color: '#d1d1d1' }} />
										}
									</TouchableOpacity>
								</View>
							)}
						/>
					</View>
				}
				{
					isRefreshing ?
						<View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color="#ff5722" /></View>
						: <View style={{
							flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
							backgroundColor: mainColor,
							borderTopLeftRadius: 50, borderTopRightRadius: 50,
						}}>
							<Modal
								animationType="slide"
								transparent={false}
								visible={this.state.showConfiguracion}
								onRequestClose={this.onConfiguracionClose} >
								<Configuracion onReset={this.onReset} onClose={this.onConfiguracionClose} />
							</Modal>
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
								width: screenWidth
							}}>
								{/*<TouchableOpacity onPress={this.onBackPress} disabled={currentIndex === 0}>
									<Icon type="EvilIcons" name="chevron-left" style={{ fontSize: 58, color: '#d1d1d1', opacity: currentIndex > 0 ? 1 : 0.3 }} />
						</TouchableOpacity>*/}
								<View style={{ width: screenWidth * 0.8, height: '100%' }}>
									<FlatList
										ref={(r) => this.PlantList = r}
										horizontal
										scrollEnabled={true}
										bounces={false}
										pagingEnabled={true}

										decelerationRate='fast'
										snapToAlignment="center"
										snapToInterval={ screenWidth * 0.8}
										onMomentumScrollEnd={this.onPlantListMomentumEnd}
										onViewableItemsChanged={this.onPlantListPageChange}
										showsHorizontalScrollIndicator={false}
										data={data}
										initialScrollIndex={0}
										extraData={[this.state.isRefreshing, this.state.nuevaPlantaFoto, currentPlantaName]}
										keyExtractor={(item, index) => "" + index}
										renderItem={({ item, index }) => (
											<View style={{ width: screenWidth * 0.8, height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
												<View style={{
													width: '95%', height: '95%',
													borderRadius: 5,
													shadowColor: "#fff",
													shadowOffset: {
														width: 0,
														height: 0,
													},
													shadowOpacity: 0.1,
													shadowRadius: 5,
													elevation: 5,
													overflow: 'hidden',
													justifyContent: 'center',
													alignItems: 'center',
													backgroundColor: '#0000'
												}}>
													{
														item.name ?
															item.image ?
																<Image source={item.image} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
																: <TouchableOpacity onPress={this.onChooseNuevaPlantaFoto} style={{ margin: 15 }}>
																	<Icon type="EvilIcons" name="plus" style={{ fontSize: 82, color: '#c1c1c1' }} />
																</TouchableOpacity>
															: nuevaPlantaFoto ?
																<Image source={this.state.nuevaPlantaFoto} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
																: <TouchableOpacity onPress={this.onChooseNuevaPlantaFoto} style={{ margin: 15 }}>
																	<Icon type="EvilIcons" name="plus" style={{ fontSize: 82, color: '#c1c1c1' }} />
																</TouchableOpacity>
													}
													{
														item.name
														&& [<View key={"btnDelete" + index} style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.7)', width: 40, height: 40, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
															<TouchableOpacity onPress={this.deleteCurrentPlant}>
																<Icon type="EvilIcons" name="trash" style={{ fontSize: 34, color: '#2b2b2b' }} />
															</TouchableOpacity>
														</View>,
														<View key={"btnChangePhoto" + index} style={{ position: 'absolute', bottom: 10, right: 60, backgroundColor: 'rgba(255,255,255,0.7)', width: 40, height: 40, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
															<TouchableOpacity onPress={this.onChooseNuevaPlantaFoto}>
																<Icon type="EvilIcons" name="camera" style={{ fontSize: 34, color: '#2b2b2b' }} />
															</TouchableOpacity>
														</View>]
													}
												</View>
											</View>
										)}
									/>
								</View>
								{/*<TouchableOpacity onPress={this.onForwardPress} disabled={currentIndex === data.length - 1}>
									<Icon type="EvilIcons" name="chevron-right" style={{ fontSize: 58, color: '#d1d1d1', opacity: (currentIndex < data.length - 1) ? 1 : 0.3 }} />
												</TouchableOpacity>*/}
							</View>
							{
								currentPlanta.name &&
								<View style={{
									flex: this.state.currentPlantaNameChanging ? 1 : 0.5, width: '100%', backgroundColor: 'rgba(0,0,0,0)', flexDirection: 'row', justifyContent: currentPlanta.name ? 'center' : 'space-between', alignItems: 'center',
									paddingLeft: '8%', paddingRight: '8%',
									backgroundColor: nameControlColor,
									borderTopLeftRadius: 50, borderTopRightRadius: 50,
									//	elevation: 15
								}}>
									<TextInput
										style={{
											fontFamily: "DosisLight", fontSize: 22, borderColor: 'transparent', color: '#d1d1d1'
										}}
										onChangeText={this.onCurrentPlantNameChanging}
										onFocus={this.onCurrentPlantStartNameChange}
										onBlur={this.onCurrentPlantFinishNameChange}
										value={this.state.currentPlantaNameChanging ? this.state.currentPlantaName : currentPlanta.name}
										defaultValue={currentPlanta.name}
										autoCapitalize={'words'}
										maxLength={30}
									/>
								</View>
							}
							<View style={{ flex: 1, backgroundColor: currentPlanta.name ? nameControlColor : mainColor }}  >
								{
									currentPlanta.name ?
										<View style={{
											flex: 1, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center',
											paddingLeft: '8%', paddingRight: '8%',
											backgroundColor: controlColor,
											borderTopLeftRadius: 50, borderTopRightRadius: 50,
											elevation: 15
										}}>
											<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
												<Icon type="EvilIcons" name="calendar" style={{ fontSize: 32, color: '#c1c1c1', paddingTop: 10 }} />
												{
													diasRiego.map((dia, index) =>
														<TouchableOpacity key={"dia" + index} onPress={() => this.onDiaPress(index)}
															style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
															<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
																{
																	(currentPlanta.diasRiego.includes(index) || !currentPlanta.diasRiego.includes(index) && !currentPlanta.diasAlimento.includes(index)) ?
																		<Icon type="Entypo" name="drop" style={{ fontSize: 22, color: '#c1c1c1', opacity: currentPlanta.diasRiego.includes(index) ? 1 : 0 }} />
																		: null
																}
																{
																	currentPlanta.diasAlimento.includes(index) ?
																		<Icon type="Entypo" name="flash" style={{ fontSize: 22, color: '#c1c1c1' }} />
																		: null
																}
															</View>
															<Text style={{ fontFamily: "DosisLight", fontSize: 16, color: '#c1c1c1', opacity: currentPlanta.diasRiego.includes(index) ? 1 : 0.5 }}>{dia}</Text>
															<Icon type="EvilIcons" name="chevron-up" style={{ fontSize: 18, color: '#c1c1c1', opacity: (index === hoy) ? 1 : 0 }} />
															{/*<Icon type="Entypo" name="dot-single" style={{ fontSize: 18, color: '#ff5722', }} /> */}
														</TouchableOpacity>
													)
												}
											</View>
											<View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
												<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '50%' }}>
													<TouchableOpacity onPress={this.onModalHoraVasosPress}
														style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
														<Icon type="Feather" name={currentPlanta.alarma ? "award" : "bar-chart"} style={{ fontSize: 20, color: currentPlanta.alarma ? '#c1c1c1' : '#c1c1c1', marginRight: 10 }} />
														<Text style={{ fontFamily: "DosisLight", fontSize: 18, color: '#c1c1c1' }}>{currentPlanta.hora < 10 ? "0" + currentPlanta.hora : currentPlanta.hora}:{currentPlanta.minutos < 10 ? "0" + currentPlanta.minutos : currentPlanta.minutos}</Text>
													</TouchableOpacity>
												</View>
												<View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '50%' }}>
													<TouchableOpacity onPress={this.onModalHoraVasosPress}
														style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
														<Text style={{ fontFamily: "DosisLight", fontSize: 18, color: '#c1c1c1' }}>{currentPlanta.vasosAgua} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
														<Icon type="Entypo" name="drop" style={{ fontSize: 22, color: '#c1c1c1', marginLeft: 5, marginRight: 15 }} />
													</TouchableOpacity>
													<TouchableOpacity onPress={this.onModalHoraVasosPress}
														style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
														<Text style={{ fontFamily: "DosisLight", fontSize: 18, color: '#c1c1c1' }}>{currentPlanta.vasosAlimento} {/*currentPlanta.vasosAlimento == 1 ? 'vaso' : 'vasos'*/}</Text>
														<Icon type="Entypo" name="flash" style={{ fontSize: 22, color: '#c1c1c1', marginLeft: 5 }} />
													</TouchableOpacity>
												</View>
											</View>
										</View>
										: <View style={{
											flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
											width: screenWidth, backgroundColor: controlColor,
											borderTopLeftRadius: 50, borderTopRightRadius: 50,
											paddingLeft: '5%',
											paddingRight: '5%',
										}}>
											<TextInput
												style={{
													flex: 1,
													paddingTop: 10,
													paddingRight: 10,
													paddingBottom: 10,
													paddingLeft: 0,
													backgroundColor: 'transparent',
													color: '#d1d1d1',
													fontFamily: "DosisLight",
													fontSize: 22,
												}}
												autoFocus
												placeholder="Nombre de la planta"
												placeholderTextColor={'#b1b1b1'}
												onChangeText={this.nuevaPlantaTextChange}
												autoCapitalize={'words'}
												underlineColorAndroid="transparent"
											/>
											{nuevaPlantaReadyToAdd &&
												<TouchableOpacity onPress={this.submitNuevaPlanta} style={{ margin: 15, marginRight: 0 }} disabled={!nuevaPlantaReadyToAdd}>
													<Icon style={{ padding: 10, fontSize: 34, color: '#fff' }} type="Feather" name="box" />
												</TouchableOpacity>
											}
											{/*<TextInput
												style={{ height: '30%', width: '65%', paddingTop: 0, paddingBottom: 0, paddingLeft: 5, fontFamily: "DosisLight", fontSize: 22, borderColor: '#c1c1c1', borderWidth: 1 }}
											
												placeholder={"Nueva planta"}
											
											/>
											<TouchableOpacity onPress={this.submitNuevaPlanta} style={{ margin: 15, marginRight: 0 }} disabled={!nuevaPlantaReadyToAdd}>
												<Icon  style={{  }} />
											</TouchableOpacity> */}
										</View>
								}
							</View>
						</View>
				}
			</Container>
		);
	}
}