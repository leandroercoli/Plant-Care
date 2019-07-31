import React from 'react';
import { StatusBar, Dimensions, Text, View, FlatList, Image, TouchableOpacity, TouchableHighlight, Alert, Modal, BackHandler } from 'react-native';
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
import { Labels, Img } from './Const'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
export default class CurrentPlant extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()
		this.EditarPlantaModal = React.createRef()
		this.CurrentPlantFoto = React.createRef()

		this.state = {
			show: false,
			isLoading: true,
			isRefreshing: false,
			data: [], // dummy plant para agregar una nueva
			currentIndex: 0,
			viewableItem: 0,
			nuevaPlantaFoto: null,

			currentPlanta: null,
			currentPlantaIndex: null,
			currentImgFocus: false
		};
	}

	goBack = () => {
		this.props.goBack()
	}

	onEditPlantPress = () => {
		this.EditarPlantaModal.show()
	}

	setAlarmsCurrentPlant = async (selectedHour, selectedMinutes, diasRiego, diasAlimento) => {
		var { currentPlanta, currentPlantaIndex } = this.props
		this.cancelAlarmsCurrentPlant() // cancelar todas las alarmas de la planta antes de agregar nuevas (para que no queden repetidas)
		var diasAlarma = diasRiego.concat(diasAlimento);
		var diasUnique = diasAlarma.filter(function (item, pos) { return diasAlarma.indexOf(item) == pos });

		diasUnique.map(async (dia) => {
			const idAlarmaRiego = await NativeAlarmSetter.setAlarm(currentPlanta.name, 0, (dia + 1), selectedHour, selectedMinutes)
			currentPlanta.alarmasID.push(idAlarmaRiego.alarmId)
		})
		this.props.onCurrentPlantChange(currentPlanta, currentPlantaIndex)
	}

	cancelAlarmsCurrentPlant = () => {
		var { currentPlanta, currentPlantaIndex } = this.props
		const alarmasID = currentPlanta.alarmasID
		for (var i = 0; i < alarmasID.length; i++) {
			NativeAlarmSetter.cancelAlarm("" + alarmasID[i])
		}
		currentPlanta.alarmasID = []
		this.props.onCurrentPlantChange(currentPlanta, currentPlantaIndex)
	}


	onFinishEditar = (plantaName, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante, diasRiego, diasAlimento) => {
		if (plantaName != "")
			this.setState({ isRefreshing: true }, async () => {
				var { currentPlanta, currentPlantaIndex } = this.props
				this.cancelAlarmsCurrentPlant()	
				currentPlanta.name = plantaName
				currentPlanta.hora = selectedHour
				currentPlanta.minutos = selectedMinutes
				currentPlanta.alarma = alarmOn
				currentPlanta.vasosAgua = selectedVasosAgua,
				currentPlanta.vasosAlimento = selectedVasosFertilizante					
				currentPlanta.diasRiego = diasRiego
				currentPlanta.diasAlimento = diasAlimento
				if (alarmOn) this.setAlarmsCurrentPlant(selectedHour, selectedMinutes, diasRiego, diasAlimento)		

				this.props.onCurrentPlantChange(currentPlanta, currentPlantaIndex)
			})
	}

	onChooseNuevaPlantaFoto = () => {
		var { currentPlanta, currentPlantaIndex } = this.props
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
				//	this.setState({ currentPlanta: currentPlanta }, () => {
				this.props.onCurrentPlantChange(currentPlanta, currentPlantaIndex)
				//	});
			}
		});
	}

	deleteCurrentPlant = () => {
		const { idioma, currentPlantaIndex } = this.props
		Alert.alert(
			Labels[idioma].eliminarPlantaAlert.title,
			Labels[idioma].eliminarPlantaAlert.descripcion,
			[
				{ text: Labels[idioma].eliminarPlantaAlert.btnCancelar, onPress: () => null },
				{
					text: Labels[idioma].eliminarPlantaAlert.btnOk, onPress: () => {
						this.setState({ isRefreshing: true }, async () => {
							this.cancelAlarmsCurrentPlant()
							this.props.onCurrentPlantDelete(currentPlantaIndex)
						})
					}
				},
			],
			{ cancelable: true }
		)
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

	onCurrentFotoClose = () => {
		this.setState({ currentImgFocus: false })
	}

	onCurrentFotoDelete = () => {
		const { currentIndex } = this.state
		const { currentPlanta, currentPlantaIndex } = this.props
		currentPlanta.images.splice(currentIndex, 1);
		//this.setState({ currentPlanta: currentPlanta }, () => {
		this.props.onCurrentPlantChange(currentPlanta, currentPlantaIndex)
		//});
	}

	componentDidMount = async () => {
		//AsyncStorage.setItem('Plantas', JSON.stringify([{ name: null }]))
		//this.reloadPlantas()
		this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
			this.goBack();
			return true;
		})
	}

	componentWillUnmount = async () => {
		this.backHandler.remove()
	}

	render = () => {
		const { idioma, colores, currentPlanta, currentPlantaIndex } = this.props
		const { currentIndex, nuevaPlantaFoto, isRefreshing, currentImgFocus } = this.state
		return (
			<View style={{
				flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
			}}>
				<EditarPlanta ref={(r) => this.EditarPlantaModal = r}
					idioma={idioma}
					colores={colores}
					plantaName={currentPlanta ? currentPlanta.name : null}
					selectedHour={currentPlanta ? currentPlanta.hora : null}
					selectedMinutes={currentPlanta ? currentPlanta.minutos : null}
					alarmOn={currentPlanta ? currentPlanta.alarma : null}
					selectedVasosAgua={currentPlanta ? currentPlanta.vasosAgua : null}
					selectedVasosFertilizante={currentPlanta ? currentPlanta.vasosAlimento : null}
					diasRiego={currentPlanta.diasRiego}
					diasAlimento={currentPlanta.diasAlimento}
					onFinishEditar={this.onFinishEditar} />
				<CurrentPlantFoto ref={(r) => this.CurrentPlantFoto = r}
					idioma={idioma}
					imgSource={currentPlanta && currentPlanta.images.length > 0 ? currentPlanta.images[currentIndex] : null}
					onCurrentFotoDelete={this.onCurrentFotoDelete} />
				{isRefreshing && <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color={colores.accentColor} /></View>}
				<View style={{ width: screenWidth, height: '100%', }}>
					{
						currentPlanta && currentPlanta.images.length > 0 ?
							<View style={{
								flex: 1,
								flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
								width: screenWidth,
								height: screenHeight,
							}}>
								<View style={{
									width: '100%', height: '100%',
									overflow: 'hidden',
									justifyContent: 'center',
									alignItems: 'center'
								}}>
									<Image source={currentPlanta.images[0]} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
								</View>
							</View>
							: <View style={{
								flex: 1, overflow: 'hidden',
								flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
								width: screenWidth,
							}}>
								<Image source={Img.logo} style={{ height: '100%', width: '100%', resizeMode: 'cover', opacity: 0.9 }} />
							</View>
					}
					<View style={{ position: 'absolute', top: 0, width: '100%', height: 130, }}>
						<LinearGradient colors={['rgba(0,0,0,1)', 'transparent',]} style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
							<View style={{ width: '100%', height: 65, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 10 }}>
								<TouchableOpacity onPress={this.goBack} style={{ width: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
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
							<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 10 }}>
								<CalendarioComponent color={"#f1f1f1"} idioma={idioma} notClickable onDiaPress={this.onDiaPress} diasRiego={currentPlanta.diasRiego} diasAlimento={currentPlanta.diasAlimento} />
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
									<Icon type={"MaterialCommunityIcons"} name={currentPlanta.alarma ? "alarm-check" : "alarm-off"} style={{ fontSize: 27, color: currentPlanta.alarma ? '#f1f1f1' : '#a1a1a1' }} />
								</View>
							</View>
						</LinearGradient>
					</View>}
				</View>
			</View>
		);
	}
}