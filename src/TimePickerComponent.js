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

export default class TimePickerComponent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedHour:props.selectedHour ? props.selectedHour: 0,
			selectedMinutes: props.selectedMinutes ? props.selectedMinutes: 0,
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.selectedHour !== this.props.selectedHour) {
			this.setState({ selectedHour: nextProps.selectedHour });
		}
		if (nextProps.selectedMinutes !== this.props.selectedMinutes) {
			this.setState({ selectedMinutes: nextProps.selectedMinutes });
		}
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
				this.setState({ selectedHour: hour, selectedMinutes: minute },
					() => this.props.onSelectTime(hour, minute))
			}
		} catch ({ code, message }) {
			console.warn('Cannot open time picker', message);
		}
	}

	render = () => {
		const { selectedHour, selectedMinutes } = this.state
		const { fontSize ,colores} = this.props
		return (
			<TouchableOpacity onPress={this.onSelectTimePress} >
				<Text style={{ fontFamily: "DosisLight", fontSize: fontSize, color: colores? colores.text : '#2b2b2b' }}>{selectedHour < 10 ? "0" + selectedHour : selectedHour}:{selectedMinutes < 10 ? "0" + selectedMinutes : selectedMinutes} hs</Text>
			</TouchableOpacity>
		);
	}
}