import React from 'react';
import { StatusBar, Dimensions, Text, View, FlatList, Image, TouchableOpacity, TouchableHighlight, Modal, TimePickerAndroid, Switch, TextInput, Alert, ToastAndroid } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Spinner, Icon, Button } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';

const dias = ["D", "L", "M", "M", "J", "V", "S"]
const hoy = (new Date()).getDay() // retorna un numero entre 0 y 6 (Domingo, Lunes, ...)

/*
const topColor = '#0b0b0b'
const mainColor = '#004d40'
const controlColor = '#237051'
const nameControlColor = '#10654A' */
const topColor = '#1b5020'
const mainColor = '#2e7d32'
const controlColor = '#388e3c'
const nameControlColor = '#43a047'

export default class CalendarioComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			diasRiego: props.diasRiego ? props.diasRiego : [],
			diasAlimento: props.diasAlimento ? props.diasAlimento : [],
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.diasRiego !== this.props.diasRiego) {
			this.setState({ diasRiego: nextProps.diasRiego });
		}
		if (nextProps.diasAlimento !== this.props.diasAlimento) {
			this.setState({ diasAlimento: nextProps.diasAlimento });
		}
	}

	onDiaPress = (index) => {
		var { diasRiego, diasAlimento } = this.state

		if (diasRiego.includes(index) && diasAlimento.includes(index)) {
			diasRiego = diasRiego.splice(index, 1);
		} else if (diasRiego.includes(index))
			diasAlimento.push(index)
		else if (diasAlimento.includes(index))
		diasAlimento =  diasAlimento.splice(index, 1);
		else {
			diasRiego.push(index)
		}

		this.setState({ diasRiego: diasRiego, diasAlimento: diasAlimento }, () => this.props.onDiaPress(diasRiego,diasAlimento))
	}

	render = () => {
		const { diasRiego, diasAlimento } = this.state
		const { color } = this.props
		return (
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
				<Icon type="EvilIcons" name="calendar" style={{ fontSize: 32, color:color, paddingTop: 10 }} />
				{
					dias.map((dia, index) =>
						<TouchableOpacity key={"dia" + index} onPress={() => this.onDiaPress(index)}
							style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
								{
									(diasRiego.includes(index) || !diasRiego.includes(index) && !diasAlimento.includes(index)) ?
										<Icon type="Entypo" name="drop" style={{ fontSize: 22, color: color, opacity: diasRiego.includes(index) ? 1 : 0 }} />
										: null
								}
								{
									diasAlimento.includes(index) ?
										<Icon type="Entypo" name="flash" style={{ fontSize: 22, color:color }} />
										: null
								}
							</View>
							<Text style={{ fontFamily: "DosisLight", fontSize: 16, color: color, opacity: diasRiego.includes(index) ? 1 : 0.5 }}>{dia}</Text>
							<Icon type="EvilIcons" name="chevron-up" style={{ fontSize: 18, color: color, opacity: (index === hoy) ? 1 : 0 }} />
						</TouchableOpacity>
					)
				}
			</View>
		);
	}
}