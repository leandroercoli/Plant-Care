import React from 'react';
import { StatusBar, Dimensions, Text, View, FlatList, Image, TouchableOpacity, TouchableHighlight, Alert, } from 'react-native';
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
export default class ListView extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()

		this.state = {
			currentIndex: 0,
			viewableItem: 0,
		};
	}

	scrollToPlantaIndex = (index) => {
		if (this.PlantList)
			this.PlantList.scrollToIndex({ animated: true, index: "" + index })
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

	render = () => {
		const { idioma,colores, data, currentPlantaIndex } = this.props
		return (
			<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'violet' }}>
				<View style={{ width: screenWidth, height: '100%', }}>
					<FlatList
						ref={(r) => this.PlantList = r}
						scrollEnabled={true}
						horizontal={true}
						showsHorizontalScrollIndicator={false}
						data={data}
						initialScrollIndex={0}
						bounces={false}
						pagingEnabled={true}
						decelerationRate='fast'
						snapToAlignment="center"
						snapToInterval={screenWidth}
						onMomentumScrollEnd={this.onPlantListMomentumEnd}
						onViewableItemsChanged={this.onPlantListPageChange}
						extraData={[currentPlantaIndex]}
						style={{ height: screenHeight * 0.4, backgroundColor: colores.listViewBackground, }}
						listKey={(item, index) => 'lv' + index.toString()}
						keyExtractor={(item, index) => "" + index}
						renderItem={({ item, index }) => (
							<CurrentPlant
								idioma={idioma}
								colores={colores} 
								currentPlanta={item}
								currentPlantaIndex={index}
								goBack={this.props.goBack}
								onCurrentPlantChange={this.props.onCurrentPlantChange}
								onCurrentPlantDelete={this.props.onCurrentPlantDelete} />
						)} />
				</View>
			</View>
		);
	}
}