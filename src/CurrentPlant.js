import React from 'react';
import { Dimensions, Text, View, FlatList, Image, TouchableOpacity, TouchableHighlight, Alert, Modal } from 'react-native';
import { Container, Header, Body, Right, Spinner, Icon } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import NuevaPlanta from './NuevaPlanta'
import Configuracion from './Configuracion'
import EditarPlanta from './EditarPlanta'
import CurrentPlantFoto from './CurrentPlantFoto'
import CalendarioComponent from './CalendarioComponent'
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import NativeAlarmSetter from './NativeAlarmSetter'
import { Labels, Colors, Img } from './Const'

const screenWidth = Dimensions.get('window').width
export default class CurrentPlant extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()
		this.EditarPlantaModal = React.createRef()
		this.CurrentPlantFoto = React.createRef()

		this.state = {
			show: false,
			isLoading: true,
			isRefreshing: true,
			data: [], // dummy plant para agregar una nueva
			currentIndex: 0,
			viewableItem: 0,
			nuevaPlantaFoto: null,

			currentPlanta: null,
			currentPlantaIndex: null
		};
	}

	show = () => {
		this.setState({ show: true })
	}

	hide = () => {
		this.setState({ show: false })
	}

	onEditPlantPress = () => {
		this.EditarPlantaModal.show()
	}

	componentDidUpdate(prevProps) {
		if ((this.props.currentPlanta !== null && this.props.currentPlantaIndex !== null) &&
			(prevProps.currentPlanta === null || prevProps.currentPlantaIndex === null ||
				prevProps.currentPlanta !== this.props.currentPlanta ||
				prevProps.currentPlantaIndex !== this.props.currentPlantaIndex)) {
			this.setState({ currentPlanta: this.props.currentPlanta, currentPlantaIndex: this.props.currentPlantaIndex });
		}
	}

	onThumbPress = (index) => {
		var { currentIndex } = this.state
		if (currentIndex != index)
			this.setState({ currentIndex: index }, () => this.PlantList.scrollToIndex({ animated: true, index: "" + this.state.currentIndex }))
	}

	setAlarmsCurrentPlant = async () => {
		var { data, currentPlanta, currentIndex } = this.state
		this.cancelAlarmsCurrentPlant() // cancelar todas las alarmas de la planta antes de agregar nuevas (para que no queden repetidas)
		var diasAlarma = currentPlanta.diasRiego.concat(currentPlanta.diasAlimento);
		var diasUnique = diasAlarma.filter(function (item, pos) { return diasAlarma.indexOf(item) == pos });

		diasUnique.map(async (dia) => {
			const idAlarmaRiego = await NativeAlarmSetter.setAlarm(currentPlanta.name, 0, (dia + 1), currentPlanta.hora, currentPlanta.minutos)
			data[currentIndex].alarmasID.push(idAlarmaRiego.alarmId)
		})
		this.setState({ data: data }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)) })
	}

	cancelAlarmsCurrentPlant = () => {
		var { data, currentPlanta, currentIndex } = this.state
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
		var { currentPlanta, currentPlantaIndex } = this.state
		const { idioma } = this.props
		ImagePicker.showImagePicker(Labels[idioma].optionsImagePicker, (response) => {
			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			} else {
				const source = { uri: response.uri };
				currentPlanta.images.unshift(source)		
					this.setState({ currentPlanta: currentPlanta }, () => {
						this.props.onCurrentPlantChange(currentPlanta,currentPlantaIndex)
					});
			}
		});
	}

	deleteCurrentPlant = () => {
		const { idioma } = this.props
		Alert.alert(
			Labels[idioma].eliminarPlantaAlert.title,
			Labels[idioma].eliminarPlantaAlert.descripcion,
			[
				{ text: Labels[idioma].eliminarPlantaAlert.btnCancelar, onPress: () => null },
				{
					text: Labels[idioma].eliminarPlantaAlert.btnOk, onPress: () => {
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
			this.setState({ isRefreshing: false, isLoading: false })
		})
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

	onCurrentImgPress = () => {
		if (this.CurrentPlantFoto)
			this.CurrentPlantFoto.show()
	}

	onCurrentFotoDelete= () => {
		const { currentIndex,  currentPlanta, currentPlantaIndex } = this.state
		currentPlanta.images.splice(currentIndex, 1);
			this.setState({ currentPlanta: currentPlanta }, () => {
				this.props.onCurrentPlantChange(currentPlanta,currentPlantaIndex)
			});
	}
	
	componentDidMount = async () => {
		//AsyncStorage.setItem('Plantas', JSON.stringify([{ name: null }]))
		//this.reloadPlantas()
	}

	render = () => {
		const { idioma } = this.props
		const { show, currentIndex, nuevaPlantaFoto, isRefreshing, currentPlanta, currentPlantaIndex } = this.state
		return (
			<Modal
				animationType="slide"
				visible={show}
				onRequestClose={this.hide}
				style={{ backgroundColor: 'red' }}>
				<Container  >
					<EditarPlanta ref={(r) => this.EditarPlantaModal = r}
						idioma={idioma}
						plantaName={currentPlanta ? currentPlanta.name : null}
						selectedHour={currentPlanta ? currentPlanta.hora : null}
						selectedMinutes={currentPlanta ? currentPlanta.minutos : null}
						alarmOn={currentPlanta ? currentPlanta.alarma : null}
						selectedVasosAgua={currentPlanta ? currentPlanta.vasosAgua : null}
						selectedVasosFertilizante={currentPlanta ? currentPlanta.vasosAlimento : null}
						onFinishEditar={this.onFinishEditar} />
					<CurrentPlantFoto ref={(r) => this.CurrentPlantFoto = r}
					idioma={idioma}
						imgSource={currentPlanta && currentPlanta.images.length > 0 ? currentPlanta.images[currentIndex] : null} 
						onCurrentFotoDelete={this.onCurrentFotoDelete}/>

					<View style={{
						flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
					}}>
						{isRefreshing && <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color={Colors.accentColor} /></View>}

						<View style={{ width: screenWidth, height: '100%', }}>
							{
								currentPlanta && currentPlanta.images.length > 0 ?
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
										data={currentPlanta.images}
										initialScrollIndex={0}
										extraData={[this.state.isRefreshing, this.state.nuevaPlantaFoto]}
										keyExtractor={(item, index) => "" + index}
										renderItem={({ item, index }) => (
											<View style={{
												flex: 1,
												flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
												width: screenWidth,
											}}>
												<View style={{
													width: '100%', height: '100%',
													overflow: 'hidden',
													justifyContent: 'center',
													alignItems: 'center'
												}}>
													<TouchableHighlight onPress={() => this.onCurrentImgPress()} style={{ height: '100%', width: '100%' }}>
														<Image source={item} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
													</TouchableHighlight>
												</View>
											</View>
										)}
									/>
									: <View style={{
										flex: 1, overflow: 'hidden',
										flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
										width: screenWidth,
									}}>
										<Image source={Img.logo} style={{ height: '50%', width: '50%', resizeMode: 'cover', opacity: 0.7 }} />
									</View>
							}
							<View style={{ position: 'absolute', top: 0, width: '100%', height: 130, }}>
								<LinearGradient colors={['rgba(0,0,0,1)', 'transparent',]} style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
									<View style={{ width: '100%', height: 65, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 10 }}>
										<TouchableOpacity onPress={this.hide} style={{ width: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
											<Icon type="EvilIcons" name="chevron-left" style={{ fontSize: 48, color: '#fff' }} />
										</TouchableOpacity>
										<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
											<View style={{ width: 40, height: 40, marginLeft: 5, marginRight: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
												<TouchableOpacity onPress={this.onChooseNuevaPlantaFoto}>
													<Icon type="EvilIcons" name="camera" style={{ fontSize: 34, color: '#fff' }} />
												</TouchableOpacity>
											</View>
											<View style={{ width: 40, height: 40, marginLeft: 5, marginRight: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
												<TouchableOpacity onPress={this.onEditPlantPress}>
													<Icon type="EvilIcons" name="pencil" style={{ fontSize: 34, color: '#fff', paddingBottom: 2 }} />
												</TouchableOpacity>
											</View>
											<View style={{ width: 40, height: 40, marginLeft: 5, marginRight: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
												<TouchableOpacity onPress={this.deleteCurrentPlant}>
													<Icon type="EvilIcons" name="trash" style={{ fontSize: 34, color: '#fff' }} />
												</TouchableOpacity>
											</View>
										</View>
									</View>
									{
										currentPlanta && currentPlanta.images.length > 0 &&
										<View style={{ width: '100%', height: 65, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 10 }}>
											<FlatList
												ref={(r) => this.ThumbPlantList = r}
												horizontal
												scrollEnabled={true}
												showsHorizontalScrollIndicator={false}
												contentContainerStyle={{ paddingHorizontal: 10, }}
												style={{ height: '100%', width: '100%', }}
												data={currentPlanta.images}
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
																borderColor: Colors.accentColor,
																overflow: 'hidden',
																justifyContent: 'center',
																alignItems: 'center',
																backgroundColor: 'rgba(255,255,255,0)',
															}}>
																<Image source={item}
																	style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
															</View>
														</TouchableOpacity>
													</View>
												)}
											/>
										</View>
									}
								</LinearGradient>
							</View>
							{currentPlanta && <View style={{
								position: 'absolute', bottom: 0
							}}  >
								<LinearGradient colors={['transparent', 'rgba(0,0,0,1)']}
									style={{
										paddingBottom: 15, paddingTop: 50, paddingLeft: '5%', paddingRight: '5%',
										flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center',
									}}>
									<View style={{
										width: '100%',
										flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
									}}>
										<Text style={{ fontFamily: "DosisLight", fontSize: 24, borderColor: 'transparent', color: '#f1f1f1' }}>{currentPlanta.name}</Text>
									</View>
									<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom:10 }}>
										<CalendarioComponent color={"#f1f1f1"} idioma={idioma} onDiaPress={this.onDiaPress} diasRiego={currentPlanta.diasRiego} diasAlimento={currentPlanta.diasAlimento} />
									</View>
									<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', paddingLeft: 3 }}>
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
								</LinearGradient>
							</View>}
						</View>
					</View>
				</Container>
			</Modal>
		);
	}
}