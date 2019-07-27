import React from 'react';
import { Dimensions, Text, View, FlatList, Image, TouchableOpacity,TouchableHighlight, Alert, } from 'react-native';
import { Container, Header, Body, Right, Spinner, Icon } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import NuevaPlanta from './NuevaPlanta'
import Configuracion from './Configuracion'
import CurrentPlant from './CurrentPlant'
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
		this.CurrentPlantModal = React.createRef()

		this.state = {
			isLoading: true,
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
			this.setState({ isRefreshing: false, isLoading: false })
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

	onPlantaThumbPress = (index) => {
		this.setState({ currentIndex: index }, () => {
			if (this.CurrentPlantModal)
				this.CurrentPlantModal.show()
		})
	}

	onCurrentPlantChange = (currentPlanta, currentPlantaIndex) => {
		var { data } = this.state
		data[currentPlantaIndex] = currentPlanta
		this.setState({ data: data, }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)); this.reloadPlantas() })
	}

	componentDidMount = async () => {
		//AsyncStorage.setItem('Plantas', JSON.stringify([{ name: null }]))
		this.reloadPlantas()
	}

	render = () => {
		const { idioma } = this.props
		const { data, currentIndex, isRefreshing } = this.state
		return (
			<Container >
				<Header transparent style={{ paddingLeft: 0 }}>
					<View style={{
						width: 50, height: '100%',
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
					}}><Image source={Img.fullLogo} style={{ height: '60%', width: '60%', resizeMode: 'contain' }} /></View>
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
				<CurrentPlant ref={(r) => this.CurrentPlantModal = r} idioma={idioma}
					currentPlanta={data.length > 0 ? data[currentIndex] : null} currentPlantaIndex={currentIndex}
					onCurrentPlantChange={this.onCurrentPlantChange} />
				<View style={{
					flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
				}}>
					{
						data.length == 0 ?
							<TouchableOpacity onPress={this.onNewPlantPress} style={{ margin: 15 }}>
								<Icon type="EvilIcons" name="plus" style={{ fontSize: 102, color: Colors.accentColor, opacity: 0.8, }} />
							</TouchableOpacity>
							:
							<View style={{ width: screenWidth, height: '100%', }}>
								<FlatList
									ref={(r) => this.PlantList = r}
									scrollEnabled={true}
									horizontal={false}
									numColumns={2}
									columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 5 }}
									showsHorizontalScrollIndicator={false}
									data={data}
									initialScrollIndex={0}
									extraData={[this.state.isRefreshing, this.state.nuevaPlantaFoto]}
									keyExtractor={(item, index) => "" + index}
									renderItem={({ item, index }) => (
										<View style={{
											flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
											width: screenWidth * 0.5,
											height: screenHeight * 0.5,
											padding: 10,
										}}>
											<View style={{
												width: '100%', height: '100%',
												overflow: 'hidden',
												justifyContent: 'center',
												alignItems: 'center',
												borderRadius: 15
											}}>
												<TouchableOpacity onPress={() => this.onPlantaThumbPress(index)} style={{ height: '100%', width: '100%' }}>
													{
														item.images && item.images.length > 0 ?
															<Image source={item.images[0]} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
															: <Image source={Img.logo} style={{ height: '100%', width: '100%', resizeMode: 'cover', opacity: 0.9 }} />
													}
												</TouchableOpacity>
												<View style={{
													position: 'absolute', bottom: 0
												}}  >
													<LinearGradient colors={['transparent', 'rgba(0,0,0,1)']}
														style={{
															paddingBottom: 5, paddingTop: 50, paddingLeft: '5%', paddingRight: '5%',
															flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center',
														}}>
														<View style={{
															width: '100%',
															flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
														}}>
															<Text style={{ fontFamily: "DosisLight", fontSize: 24, borderColor: 'transparent', color: '#f1f1f1' }}>{item.name}</Text>
														</View>
														<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', paddingLeft: 3, marginBottom:5 }}>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '25%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 15, color: '#f1f1f1', marginRight: 1 }}>{item.vasosAgua} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
																<Icon type="Entypo" name="drop" style={{ fontSize: 15, color: '#f1f1f1', marginLeft: 3 }} />
															</View>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '25%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 15, color: '#f1f1f1', marginRight: 1 }}>{item.vasosAlimento} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
																<Icon type="Entypo" name="flash" style={{ fontSize: 15, color: '#f1f1f1', marginLeft: 3 }} />
															</View>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '50%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 15, color: '#f1f1f1' }}>{item.hora < 10 ? "0" + item.hora : item.hora}:{item.minutos < 10 ? "0" + item.minutos : item.minutos}</Text>
																<Icon type="EvilIcons" name={"bell"} style={{ fontSize: 20, color: item.alarma ? '#f1f1f1' : '#a1a1a1' }} />
															</View>
														</View>
														<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
															<CalendarioComponent thumb color={"#f1f1f1"} idioma={idioma} diasRiego={item.diasRiego} diasAlimento={item.diasAlimento} />
														</View>
													</LinearGradient>
												</View>
											</View>
										</View>
									)}
								/>
							</View>
					}
					{isRefreshing && <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,1)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color={Colors.accentColor} /></View>}
				</View>
			</Container>
		);
	}
}