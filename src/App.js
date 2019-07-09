import React from 'react';
import { Dimensions, Text, View, FlatList, Image, TouchableOpacity, Alert, } from 'react-native';
import { Container, Header, Body, Right, Spinner, Icon } from 'native-base';
import Loading from './Loading';
import NuevaPlanta from './NuevaPlanta'
import Configuracion from './Configuracion'
import EditarPlanta from './EditarPlanta'
import CalendarioComponent from './CalendarioComponent'
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import NativeAlarmSetter from './NativeAlarmSetter'
import { Labels, Colors, Img } from './Const'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()
		this.NuevaPlantaModal = React.createRef()
		this.ConfiguracionModal = React.createRef()
		this.EditarPlantaModal = React.createRef()

		this.state = {
			isLoading:true,
			isRefreshing: true,
			data: [], // dummy plant para agregar una nueva
			currentIndex: 0,
			viewableItem: 0,
			nuevaPlantaFoto: null,
		};
	}

	reloadPlantas = async () => {
		 this.setState({ isRefreshing: true }, async () => {
			try {
				const data = await AsyncStorage.getItem('Plantas');
				if (data !== null) {
					this.setState({ data: JSON.parse(data) })
				}
			} catch (error) {
				// Error retrieving data
			}
			this.setState({ isRefreshing: false, isLoading:false })
		})
	}

	onNewPlantPress = () => {
		this.NuevaPlantaModal.show()
	}

	onConfiguracionPress = () => {
		this.ConfiguracionModal.show()
	}

	onEditPlantPress = () => {
		this.EditarPlantaModal.show()
	}

	onThumbPress = (index) => {
		var { currentIndex } = this.state
		if (currentIndex != index)
			this.setState({ currentIndex: index }, () => this.PlantList.scrollToIndex({ animated: true, index: "" + this.state.currentIndex }))
	}

	setAlarmsCurrentPlant = async () => {
		var { data, currentIndex } = this.state
		this.cancelAlarmsCurrentPlant() // cancelar todas las alarmas de la planta antes de agregar nuevas (para que no queden repetidas)
		let currentPlanta = data[currentIndex]
		var diasAlarma = currentPlanta.diasRiego.concat(currentPlanta.diasAlimento);
		var diasUnique = diasAlarma.filter(function (item, pos) { return diasAlarma.indexOf(item) == pos });

		diasUnique.map(async (dia) => {
			const idAlarmaRiego = await NativeAlarmSetter.setAlarm(currentPlanta.name, 0, (dia + 1), currentPlanta.hora, currentPlanta.minutos)
			data[currentIndex].alarmasID.push(idAlarmaRiego.alarmId)
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

	onDiaPress = (diasRiego, diasAlimento) => {
		var { data, currentIndex } = this.state
		data[currentIndex].diasRiego = diasRiego
		data[currentIndex].diasAlimento = diasAlimento
		this.setState({ data: data }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)); if (data[currentIndex].alarma) this.setAlarmsCurrentPlant() })
	}

	onFinishEditar = (plantaName, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante) => {
		if (plantaName != "")
			this.setState({ isRefreshing: true }, async () => {
				var { data, currentIndex } = this.state
				data[currentIndex].name = plantaName
				data[currentIndex].hora = selectedHour
				data[currentIndex].minutos = selectedMinutes
				data[currentIndex].alarma = alarmOn
				data[currentIndex].vasosAgua = selectedVasosAgua,
					data[currentIndex].vasosAlimento = selectedVasosFertilizante

				try {
					await AsyncStorage.setItem('Plantas', JSON.stringify(data));
				} catch (error) {
					// Error retrieving data
				}
				this.setState({ data: data, isRefreshing: false }, () => { if (alarmOn) this.setAlarmsCurrentPlant(); else this.cancelAlarmsCurrentPlant() })
			})
	}

	onChooseNuevaPlantaFoto = () => {
		var { data, currentIndex } = this.state
		const { idioma } = this.props
		ImagePicker.showImagePicker(Labels[idioma].optionsImagePicker, (response) => {
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
			alarmasID = currentPlanta.alarmasID
			for (var j = 0; j < alarmasID.length; j++) {
				await NativeAlarmSetter.cancelAlarm("" + alarmasID[j])
			}
			data.alarmOn = false
		}
		this.setState({ data: data, currentIndex: 0 }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)); this.reloadPlantas() })
	}

	onReset = () => {
		var { data } = this.state
		this.setState({ isRefreshing: true }, async () => {
			await this.cancelAllAlarms()
			data = []
			this.setState({ data: data, currentIndex: 0 }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)); this.reloadPlantas() })
		})
	}

	onFinishSubmitting = () => {
		// Las alarmas de la planta nueva se settean en el componente NuevaPlanta antes de llamar a esta funcion
		if (this.NuevaPlantaModal) this.NuevaPlantaModal.hide()
		this.reloadPlantas()
	}

	onPlantListPageChange = ({ viewableItems }) => {
		const { currentIndex } = this.state
		const firstViewableItem = viewableItems[0].key;
		if (firstViewableItem != currentIndex)
			this.setState({ viewableItem: firstViewableItem, currentIndex: firstViewableItem })
	}

	onPlantListMomentumEnd = () => {
		const { currentIndex, viewableItem } = this.state
		if (viewableItem != currentIndex)
			this.setState({ currentIndex: viewableItem })
	}

	componentDidMount = async () => {
		//AsyncStorage.setItem('Plantas', JSON.stringify([{ name: null }]))
		 this.reloadPlantas()
	}

	render = () => {
		const { idioma } = this.props
		const { isLoading, data, currentIndex, nuevaPlantaFoto, isRefreshing } = this.state
		const currentPlanta = data[currentIndex]
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
				<NuevaPlanta ref={(r) => this.NuevaPlantaModal = r} idioma={idioma} onFinishSubmitting={this.onFinishSubmitting} />
				<Configuracion ref={(r) => this.ConfiguracionModal = r} idioma={idioma} onReset={this.onReset} onSelectIdioma={this.props.onSelectIdioma} />
				<EditarPlanta ref={(r) => this.EditarPlantaModal = r}
				idioma={idioma}
					plantaName={currentPlanta ? currentPlanta.name : null}
					selectedHour={currentPlanta ? currentPlanta.hora : null}
					selectedMinutes={currentPlanta ? currentPlanta.minutos : null}
					alarmOn={currentPlanta ? currentPlanta.alarma : null}
					selectedVasosAgua={currentPlanta ? currentPlanta.vasosAgua : null}
					selectedVasosFertilizante={currentPlanta ? currentPlanta.vasosAlimento : null}
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
							extraData={[currentIndex, isRefreshing, nuevaPlantaFoto]}
							keyExtractor={(item, index) => 'plant' + index}
							renderItem={({ item, index }) => (
								<View style={{ width: screenWidth * 0.15, height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
									<TouchableOpacity onPress={() => this.onThumbPress(index)}>
										<View style={{
											width: 50, height: 50,
											borderRadius: 25,
											borderWidth: 2,
											borderColor: item.name ? Colors.accentColor : 'transparent',
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
						}}>
							{
								data.length == 0 ?
									<TouchableOpacity onPress={this.onNewPlantPress} style={{ margin: 15 }}>
										<Icon type="EvilIcons" name="plus" style={{ fontSize: 82, color: Colors.accentColor, opacity: 0.8, }} />
									</TouchableOpacity>
									:
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
												<View style={{
													flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
												}}>
													<View style={{
														flex: 3,
														flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
														width: screenWidth,
													}}>
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
																		: <Image source={Img.logo} style={{ height: '50%', width: '50%', resizeMode: 'contain', opacity: 0.7 }} />
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
																		<TouchableOpacity onPress={this.onEditPlantPress}>
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
																		backgroundColor: Colors.accentColor,
																		borderRadius: 15,
																		//	elevation: 15
																	}}>
																		<Text style={{ fontFamily: "DosisLight", fontSize: 22, borderColor: 'transparent', color: '#f1f1f1' }}>{item.name}</Text>
																	</View>
																</View>
															}
														</View>
													</View>
													<View style={{ flex: 1, backgroundColor: Colors.accentColor, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', paddingLeft: '5%', paddingRight: '5%', }}  >
														<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
															<CalendarioComponent color={"#f1f1f1"} idioma={idioma} onDiaPress={this.onDiaPress} diasRiego={item.diasRiego} diasAlimento={item.diasAlimento} />
														</View>
														<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', paddingLeft: 3 }}>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '25%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 20, color: '#f1f1f1', marginRight: 5 }}>{item.vasosAgua} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
																<Icon type="Entypo" name="drop" style={{ fontSize: 22, color: '#f1f1f1', marginLeft: 5 }} />
															</View>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '25%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 20, color: '#f1f1f1', marginRight: 5 }}>{item.vasosAlimento} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
																<Icon type="Entypo" name="flash" style={{ fontSize: 22, color: '#f1f1f1', marginLeft: 5 }} />
															</View>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '50%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#f1f1f1' }}>{item.hora < 10 ? "0" + item.hora : item.hora}:{item.minutos < 10 ? "0" + item.minutos : item.minutos}</Text>
																<Icon type="EvilIcons" name={"bell"} style={{ fontSize: 27, color: item.alarma ? '#f1f1f1' : '#a1a1a1' }} />
															</View>
														</View>
													</View>
												</View>

											)}
										/>
									</View>
							}
						</View>
				}
			</Container>
		);
	}
}