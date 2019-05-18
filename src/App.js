import React from 'react';
import { Dimensions, Text, View, FlatList, Image, TouchableOpacity, TouchableHighlight, Modal, TimePickerAndroid, Switch, TextInput, Alert } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Spinner, Icon, Button } from 'native-base';
import NuevaPlanta from './NuevaPlanta'
import Configuracion from './Configuracion'
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';

const options = {
	title: 'Elija una foto para la nueva planta',
	customButtons: [],
	storageOptions: {
		skipBackup: true,
		path: 'images',
	},
};
const diasRiego = ["D", "L", "M", "M", "J", "V", "S"]
const hoy = (new Date()).getDay() // retorna un numero entre 0 y 6 (Domingo, Lunes, ...)
const plantas = [
	{ name: 'Monstera', image: require("./img/plantas/monstera.jpg"), diasRiego: [3, 4, 5], diasAlimento: [0, 3, 5], hora: 10, minutos: 15, alarma: true, vasosAgua: '2', vasosAlimento: '1' },
	{ name: 'Aloe Vera', image: require("./img/plantas/aloe-vera.jpg"), diasRiego: [2, 5], diasAlimento: [1, 3, 4], hora: 12, minutos: 45, alarma: false, vasosAgua: '1.5', vasosAlimento: '1.5' },
	{ name: 'Philodendron', image: require("./img/plantas/philodendron.jpg"), diasRiego: [1, 5, 6], diasAlimento: [4, 5], hora: 15, minutos: 25, alarma: true, vasosAgua: '4', vasosAlimento: '2' },
	{ name: null }
]

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()

		this.state = {
			isRefreshing: true,
			showModalHoraVasos: false,
			showConfiguracion: true,
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
			currentIndex: 0
		};
	}

	onReset = () => {
		this.reloadPlantas()
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

		this.setState({ data: data }, () => AsyncStorage.setItem('Plantas', JSON.stringify(data)))
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

	onSaveModalHoraVasos = () => {
		var { data, currentIndex, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosAlimento } = this.state
		data[currentIndex].hora = selectedHour
		data[currentIndex].minutos = selectedMinutes
		data[currentIndex].alarma = alarmOn
		data[currentIndex].vasosAgua = selectedVasosAgua
		data[currentIndex].vasosAlimento = selectedVasosAlimento
		this.setState({ data: data, showModalHoraVasos: false }, () => AsyncStorage.setItem('Plantas', JSON.stringify(data)))
	}

	onCurrentPlantStartNameChange = () => {
		this.setState({ currentPlantaNameChanging: true })
	}

	onCurrentPlantFinishNameChange = () => {
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
	}

	onCurrentPlantNameChanging = (text) => {
		this.setState({ currentPlantaName: text })
	}

	onChooseNuevaPlantaFoto = () => {
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

				// You can also display the image using data:
				// const source = { uri: 'data:image/jpeg;base64,' + response.data };
				this.setState({
					nuevaPlantaFoto: source,
				});
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

	async componentDidMount() {
		//this.reset()
		this.reloadPlantas()
	}

	render() {
		const { data, currentIndex, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosAlimento, currentPlantaName, nuevaPlantaName, nuevaPlantaFoto, isRefreshing } = this.state
		const screenWidth = Dimensions.get('window').width
		const screenHeight = Dimensions.get('window').height
		const currentPlanta = data[currentIndex]
		const nuevaPlantaReadyToAdd = nuevaPlantaFoto && nuevaPlantaName != ''
		return (
			<Container>
				<Header transparent>
					<Body>
						<Text style={{ fontFamily: "DosisLight", fontSize: 28, color: '#2b2b2b' }}>App</Text>
					</Body>
					<Right>
						<TouchableOpacity onPress={this.onConfiguracionOpen} style={{ margin: 10 }}>
							<Icon type="EvilIcons" name="gear" style={{ fontSize: 34, color: '#2b2b2b' }} />
						</TouchableOpacity>
					</Right>
				</Header>
				{
					isRefreshing ?
						<View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color="#ff5722" /></View>
						: <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
							<Modal
								animationType="slide"
								transparent={false}
								visible={this.state.showConfiguracion}
								onRequestClose={this.onConfiguracionClose} >
								<Configuracion onReset={this.onReset} onClose={this.onConfiguracionClose}/>
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
											<Icon type="Feather" name={alarmOn ? "award" : "bar-chart"} style={{ fontSize: 32, color: alarmOn ? '#2b2b2b' : '#616161', marginRight: 10 }} />
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
										<Icon type="Entypo" name="cup" style={{ fontSize: 56, color: '#616161', padding: 10 }} />
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
								flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
								width: screenWidth
							}}>
								<TouchableOpacity onPress={this.onBackPress} disabled={currentIndex === 0}>
									<Icon type="EvilIcons" name="chevron-left" style={{ fontSize: 58, color: '#2b2b2b', opacity: currentIndex > 0 ? 1 : 0.3 }} />
								</TouchableOpacity>
								<View style={{ width: screenWidth * 0.7, height: '100%' }}>
									<FlatList
										ref={(r) => this.PlantList = r}
										horizontal
										scrollEnabled={false}
										showsHorizontalScrollIndicator={false}
										data={data}
										initialScrollIndex={0}
										extraData={[this.state.isRefreshing, this.state.nuevaPlantaFoto, currentPlantaName]}
										keyExtractor={(item, index) => 'plant' + index}
										renderItem={({ item, index }) => (
											<View style={{ width: screenWidth * 0.7, height: '100%', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
												<View style={{
													width: '95%', height: '80%',
													borderRadius: 5,
													shadowColor: "#fff",
													shadowOffset: {
														width: 5,
														height: 5,
													},
													shadowOpacity: 0.25,
													shadowRadius: 3.84,
													elevation: 5,
													overflow: 'hidden',
													justifyContent: 'center',
													alignItems: 'center',
												}}>
													{
														item.name ?
															<Image source={item.image} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
															: nuevaPlantaFoto ?
																<Image source={this.state.nuevaPlantaFoto} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
																: <TouchableOpacity onPress={this.onChooseNuevaPlantaFoto} style={{ margin: 15 }}>
																	<Icon type="EvilIcons" name="plus" style={{ fontSize: 82, color: '#c1c1c1' }} />
																</TouchableOpacity>
													}
													{
														item.name ?
															<View style={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.7)', width: 40, height: 40, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
																<TouchableOpacity onPress={this.deleteCurrentPlant}>
																	<Icon type="EvilIcons" name="trash" style={{ fontSize: 34, color: '#2b2b2b' }} />
																</TouchableOpacity>
															</View>
															: null
													}
												</View>
												<View style={{ width: '95%', height: '18%', backgroundColor: 'rgba(0,0,0,0)', flexDirection: 'row', justifyContent: item.name ? 'center' : 'space-between', alignItems: 'center' }}>
													{
														item.name ?
															<TextInput
																style={{
																	fontFamily: "DosisLight", fontSize: 22, borderColor: 'transparent'
																}}
																onChangeText={this.onCurrentPlantNameChanging}
																onFocus={this.onCurrentPlantStartNameChange}
																onBlur={this.onCurrentPlantFinishNameChange}
																value={this.state.currentPlantaNameChanging ? this.state.currentPlantaName : item.name}
																defaultValue={item.name}
																autoCapitalize={'words'}
															/>
															: null
													}
												</View>
											</View>
										)}
									/>
								</View>
								<TouchableOpacity onPress={this.onForwardPress} disabled={currentIndex === data.length - 1}>
									<Icon type="EvilIcons" name="chevron-right" style={{ fontSize: 58, color: '#2b2b2b', opacity: (currentIndex < data.length - 1) ? 1 : 0.3 }} />
								</TouchableOpacity>
							</View>
							<View style={{ flex: 1 }}>
								{
									currentPlanta.name ?
										<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', width: screenWidth * 0.85 }}>
											<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
												<Icon type="EvilIcons" name="calendar" style={{ fontSize: 28, color: '#616161' }} />
												{
													diasRiego.map((dia, index) =>
														<TouchableOpacity key={"dia" + index} onPress={() => this.onDiaPress(index)}
															style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
															<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
																{
																	(currentPlanta.diasRiego.includes(index) || !currentPlanta.diasRiego.includes(index) && !currentPlanta.diasAlimento.includes(index)) ?
																		<Icon type="Entypo" name="drop" style={{ fontSize: 16, color: '#a1a1a1', opacity: currentPlanta.diasRiego.includes(index) ? 1 : 0 }} />
																		: null
																}
																{
																	currentPlanta.diasAlimento.includes(index) ?
																		<Icon type="Entypo" name="cup" style={{ fontSize: 16, color: '#a1a1a1' }} />
																		: null
																}
															</View>
															<Text style={{ fontFamily: "DosisLight", fontSize: 16, color: '#2b2b2b', opacity: currentPlanta.diasRiego.includes(index) ? 1 : 0.5 }}>{dia}</Text>
															<Icon type="EvilIcons" name="chevron-up" style={{ fontSize: 18, color: '#616161', opacity: (index === hoy) ? 1 : 0 }} />
															{/*<Icon type="Entypo" name="dot-single" style={{ fontSize: 18, color: '#ff5722', }} /> */}
														</TouchableOpacity>
													)
												}
											</View>
											<View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
												<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '50%' }}>
													<TouchableOpacity onPress={this.onModalHoraVasosPress}
														style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
														<Icon type="Feather" name={currentPlanta.alarma ? "award" : "bar-chart"} style={{ fontSize: 20, color: currentPlanta.alarma ? '#ff5722' : '#616161', marginRight: 10 }} />
														<Text style={{ fontFamily: "DosisLight", fontSize: 18, color: '#2b2b2b' }}>{currentPlanta.hora < 10 ? "0" + currentPlanta.hora : currentPlanta.hora}:{currentPlanta.minutos < 10 ? "0" + currentPlanta.minutos : currentPlanta.minutos}</Text>
													</TouchableOpacity>
												</View>
												<View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '50%' }}>
													<TouchableOpacity onPress={this.onModalHoraVasosPress}
														style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
														<Text style={{ fontFamily: "DosisLight", fontSize: 18, color: '#2b2b2b' }}>{currentPlanta.vasosAgua} {currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'}</Text>
														<Icon type="Entypo" name="drop" style={{ fontSize: 18, color: '#616161', marginLeft: 5, marginRight: 15 }} />
													</TouchableOpacity>
													<TouchableOpacity onPress={this.onModalHoraVasosPress}
														style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
														<Text style={{ fontFamily: "DosisLight", fontSize: 18, color: '#2b2b2b' }}>{currentPlanta.vasosAlimento} {currentPlanta.vasosAlimento == 1 ? 'vaso' : 'vasos'}</Text>
														<Icon type="Entypo" name="cup" style={{ fontSize: 18, color: '#616161', marginLeft: 5 }} />
													</TouchableOpacity>
												</View>
											</View>
										</View>
										: <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '95%' }}>
											<TextInput
												style={{ height: '30%', width: '65%', paddingTop: 0, paddingBottom: 0, paddingLeft: 5, fontFamily: "DosisLight", fontSize: 22, borderColor: '#c1c1c1', borderWidth: 1 }}
												onChangeText={this.nuevaPlantaTextChange}
												placeholder={"Nueva planta"}
												autoCapitalize={'words'}
											/>
											<TouchableOpacity onPress={this.submitNuevaPlanta} style={{ margin: 15, marginRight: 0 }} disabled={!nuevaPlantaReadyToAdd}>
												<Icon type="Feather" name="box" style={{ fontSize: 26, color: nuevaPlantaReadyToAdd ? '#ff5722' : '#c1c1c1' }} />
											</TouchableOpacity>
										</View>
								}
							</View>
						</View>
				}
			</Container>
		);
	}
}
