import React from 'react';
import { Dimensions, Text, View, FlatList, Image, TouchableOpacity, TouchableHighlight, Modal, TimePickerAndroid, Switch } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Spinner, Icon, Button } from 'native-base';

const diasRiego = ["D", "L", "M", "M", "J", "V", "S"]
const hoy = (new Date()).getDay() // retorna un numero entre 0 y 6 (Domingo, Lunes, ...)

export default class NuevaPlanta extends React.Component {
	constructor(props) {
		super(props);

		this.Lista = React.createRef()

		this.state = {
			step: 0
		};
	}

	onForwardPress = () => {
		this.Lista.scrollToIndex({ animated: true, index: "1" })
	}
	render() {
		const { } = this.state
		const screenWidth = Dimensions.get('window').width
		const screenHeight = Dimensions.get('window').height
		return (
			<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
				<FlatList
					ref={(r) => this.Lista = r}
					horizontal
					scrollEnabled={false}
					showsHorizontalScrollIndicator={false}
					data={[0, 1]}
					initialScrollIndex={0}
					keyExtractor={(item, index) => 'step' + index}
					renderItem={({ item, index }) => (
						index == 0 ?
							<View style={{ width: screenWidth, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 10 }}>
								<TouchableOpacity onPress={this.props.onClose}
									style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: 'rgba(255,87,34,0.7)', padding: 10 }}>
									<Icon type="Feather" name="box" style={{ fontSize: 22, color: '#fff', marginRight: 10 }} />
									<Text style={{ fontFamily: "DosisLight", fontSize: 26, color: '#fff' }}>Guardar</Text>
								</TouchableOpacity>
							</View>
						: null
					)} />

				<TouchableOpacity onPress={this.onForwardPress} >
					<Icon type="EvilIcons" name="chevron-left" style={{ fontSize: 58, color: '#2b2b2b' }} />
				</TouchableOpacity>

				<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 10 }}>
					<TouchableOpacity onPress={this.props.onClose}
						style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: 'rgba(255,87,34,0.7)', padding: 10 }}>
						<Icon type="Feather" name="box" style={{ fontSize: 22, color: '#fff', marginRight: 10 }} />
						<Text style={{ fontFamily: "DosisLight", fontSize: 26, color: '#fff' }}>Guardar</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}
