import React from 'react';
import { StatusBar, Dimensions, Text, View, FlatList, ScrollView, Image, TouchableOpacity, TouchableHighlight, Alert, } from 'react-native';
import { Container, Content, Header, Body, Right, Spinner, Icon } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import GridView from './GridView'
import ListView from './ListView'
import NuevaPlanta from './NuevaPlanta'
import Configuracion from './Configuracion'
import CurrentPlant from './CurrentPlant'
import CalendarioComponent from './CalendarioComponent'
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import NativeAlarmSetter from './NativeAlarmSetter'
import { Labels, Img } from './Const'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()
		this.NuevaPlantaModal = React.createRef()
		this.ConfiguracionModal = React.createRef()
		this.ViewsList = React.createRef()
		this.PlantsListView = React.createRef()

		this.state = {
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
			this.setState({ isRefreshing: false })
		})
	}

	reloadPlantasBackground = async () => {
		try {
			const data = await AsyncStorage.getItem('Plantas');
			if (data !== null) {
				this.setState({ data: JSON.parse(data) })
			}
		} catch (error) {
			// Error retrieving data
		}
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
			this.toCurrentPlantView()
		})
	}

	toCurrentPlantView = () => {
		const { currentIndex } = this.state
		if (this.ViewsList) {
			this.ViewsList.scrollTo({ x: screenWidth, animated: true })
			if (this.PlantsListView) {
				this.PlantsListView.scrollToPlantaIndex(currentIndex)
			}
		}
	}

	toGridView = () => {
		if (this.ViewsList) {
			this.ViewsList.scrollTo({ x: 0, animated: true })
		}
	}

	onCurrentPlantChange = (currentPlanta, currentPlantaIndex) => {
		var { data } = this.state
		data[currentPlantaIndex] = currentPlanta
		this.setState({ data: data, }, () => { AsyncStorage.setItem('Plantas', JSON.stringify(data)); this.reloadPlantasBackground() })
	}

	onCurrentPlantDelete = async (currentPlantaIndex) => {
		var { data, currentIndex } = this.state
		data.splice(currentPlantaIndex, 1)
		try {
			await AsyncStorage.setItem('Plantas', JSON.stringify(data));
		} catch (error) {
			// Error retrieving data
		}
		this.setState({ data: data, currentIndex: currentIndex > 0 ? (currentIndex - 1) : 0, isRefreshing: false }, () => {
			if (data.length == 0) this.toGridView()
			else this.toCurrentPlantView()
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

	componentDidMount = async () => {
		//AsyncStorage.setItem('Plantas', JSON.stringify([{ name: null }]))
		this.reloadPlantas()
	}

	render = () => {
		const { idioma, colores } = this.props
		const { data, currentIndex, isRefreshing } = this.state
		return (
			<Container>
				<StatusBar backgroundColor={colores.statusBarColor}></StatusBar>
				<NuevaPlanta ref={(r) => this.NuevaPlantaModal = r} idioma={idioma} colores={colores} onFinishSubmitting={this.onFinishSubmitting} />
				<Configuracion ref={(r) => this.ConfiguracionModal = r} idioma={idioma} colores={colores} onReset={this.onReset} onSelectIdioma={this.props.onSelectIdioma} onTemaOscuroToggle={this.props.onTemaOscuroToggle} />
				<View style={{ flex: 1 }}>
					<ScrollView
						ref={(r) => this.ViewsList = r}
						horizontal
						scrollEnabled={false}
						bounces={false}
						pagingEnabled={true}
						showsHorizontalScrollIndicator={false}
						keyExtractor={(item, index) => "" + index}
						style={{ flex: 1, }}>
						<View style={{ width: screenWidth }}>
							<GridView
								idioma={idioma}
								colores={colores}
								data={data}
								onPlantaThumbPress={this.onPlantaThumbPress}
								onCurrentPlantChange={this.onCurrentPlantChange}
								onNewPlantPress={this.onNewPlantPress}
								onConfiguracionPress={this.onConfiguracionPress} />
						</View>
						<View style={{ width: screenWidth }}>
							<ListView
								ref={(r) => this.PlantsListView = r}
								idioma={idioma}
								colores={colores}
								data={data}
								currentPlantaIndex={currentIndex}
								goBack={this.toGridView}
								onCurrentPlantChange={this.onCurrentPlantChange}
								onCurrentPlantDelete={this.onCurrentPlantDelete} />
						</View>
					</ScrollView>
					{isRefreshing && <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colores.defaultBackground, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<Spinner color={colores.accentColor} /></View>}
				</View>
			</Container>
		);
	}
}