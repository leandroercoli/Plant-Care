import React from 'react';
import { StatusBar, Dimensions, Text, View, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Spinner, Icon } from 'native-base';
import Configuracion from './Configuracion'
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import styled from 'styled-components'
import NativeAlarmSetter from './NativeAlarmSetter'
import CalendarioComponent from './CalendarioComponent'
import TimePickerComponent from './TimePickerComponent'
import { Colors } from './Const'

/*
const topColor = '#0b0b0b'
const mainColor = '#004d40'
const controlColor = '#237051'
const nameControlColor = '#10654A' */
const topColor = '#1b5020'
const mainColor = '#2e7d32'
const controlColor = '#388e3c'
const nameControlColor = '#43a047'
const accentColor = '#2e7d32'
const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default class EditarNombre extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
			plantaName: '',
			selectedHour: 0,
			selectedMinutes: 0,
			alarmOn: true,
			selectedVasosAgua: 0,
			selectedVasosFertilizante: 0
		};
	}

	show = () => {
		this.setState({ show: true })
	}

	hide = () => {
		this.setState({ show: false })
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.plantaName !== this.props.plantaName) {
			this.setState({ plantaName: nextProps.plantaName });
		}
		if (nextProps.selectedHour !== this.props.selectedHour) {
			this.setState({ selectedHour: nextProps.selectedHour });
		}
		if (nextProps.selectedMinutes !== this.props.selectedMinutes) {
			this.setState({ selectedMinutes: nextProps.selectedMinutes });
		}
		if (nextProps.alarmOn !== this.props.alarmOn) {
			this.setState({ alarmOn: nextProps.alarmOn });
		}
	}

	plantaTextChange = (text) => {
		this.setState({ plantaName: text })
	}

	onSelectTime = (selectedHour, selectedMinutes) => {
		this.setState({ selectedHour: selectedHour, selectedMinutes: selectedMinutes })
	}

	onAlarmSwitch = () => {
		this.setState({ alarmOn: !this.state.alarmOn })
	}

	onSelectedVasosAguaChange = (text) => {
		this.setState({ selectedVasosAgua: text })
	}

	onSelectedVasosFertilizanteChange = (text) => {
		this.setState({ selectedVasosFertilizante: text })
	}

	onCancelPress = () => {
		this.setState({ plantaName: '' }, () => { this.hide() })
	}

	onDonePress = () => {
		const { plantaName, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante } = this.state
		Alert.alert(
			'Cambiar nombre',
			'¿Está seguro que desea aplicar los cambios?',
			[
				{ text: 'Cancelar', onPress: this.onCancelPress },
				{
					text: 'Sí', onPress: () => { this.props.onFinishEditar(plantaName, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante); this.hide() }
				},
			],
			{ cancelable: true })
	}

	render = () => {
		const { show, plantaName, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante } = this.state
		const readyToSubmit = plantaName != ''  // && nuevaPlantaFoto 
		return (
			<Modal
				animationType="fade"
				transparent={true}
				visible={show}
				onRequestClose={this.hide}>
				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
					<View style={{
						width: '85%',
						flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
						paddingLeft: '4%', paddingRight: '4%',
						backgroundColor: 'rgba(255,255,255,0.9)',
						borderRadius: 20,
						marginBottom: 30,
						//	elevation: 15
					}}>
						<TextInput
							style={{
								width: '100%',
								paddingTop: 20,
								paddingRight: 50,
								paddingBottom: 10,
								paddingLeft: 0,
								color: '#2b2b2b',
								fontFamily: "DosisLight",
								fontSize: 22,
							}}
							defaultValue={plantaName}
							placeholder="Nombre"
							placeholderTextColor={'#616161'}
							onChangeText={this.plantaTextChange}
							autoCapitalize={'words'}
							underlineColorAndroid={accentColor}
							maxLength={30}
						/>
					</View>
					<View style={{
						width: '85%',
						backgroundColor: 'rgba(255,255,255,0.9)',
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						paddingTop: '8%', paddingLeft: '4%', paddingRight: '4%',
						borderRadius: 20,
						marginBottom: 30,
					}}>
						<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>Hora de alarma</Text>
						<TimePickerComponent fontSize={22} onSelectTime={this.onSelectTime} selectedHour={selectedHour} selectedMinutes={selectedMinutes} />
					</View>
					<View style={{
						width: '85%',
						backgroundColor: 'rgba(255,255,255,0.9)',
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						paddingTop: '8%', paddingLeft: '4%', paddingRight: '4%',
						borderRadius: 20,
						marginBottom: 30,
					}}>
						<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>Notificaciones</Text>
						<TouchableOpacity onPress={this.onAlarmSwitch}>
							<Icon type="Feather" name={alarmOn ? "award" : "bar-chart"} style={{ fontSize: 25, color: alarmOn ? Colors.accentColor : '#616161' }} />
						</TouchableOpacity>
					</View>
					<View style={{
							width: '85%',
							flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
							paddingLeft: '4%', paddingRight: '4%',
							backgroundColor: 'rgba(255,255,255,0.9)',
							borderRadius: 20,
							marginBottom: 30,
							//	elevation: 15
					}}>
						<TextInput
							style={{
								width: '100%',
								paddingTop: 20,
								paddingRight: 50,
								paddingBottom: 10,
								paddingLeft: 0,
								color: '#2b2b2b',
								fontFamily: "DosisLight",
								fontSize: 22,
							}}
							keyboardType='numeric'
							placeholder="Vasos de agua"
							placeholderTextColor={'#616161'}
							onChangeText={this.onSelectedVasosAguaChange}
							underlineColorAndroid={Colors.accentColor}
						/>
						<Icon type="Entypo" name="drop" style={{ position: 'absolute', right: 0, fontSize: 22, color: selectedVasosAgua > 0 ? Colors.accentColor : '#616161', padding: 10 }} />
					</View>
					<View style={{
							width: '85%',
							flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
							paddingLeft: '4%', paddingRight: '4%',
							backgroundColor: 'rgba(255,255,255,0.9)',
							borderRadius: 20,
							marginBottom: 30,
							//	elevation: 15
					}}>
						<TextInput
							style={{
								width: '100%',
								paddingTop: 20,
								paddingRight: 50,
								paddingBottom: 10,
								paddingLeft: 0,
								color: '#2b2b2b',
								fontFamily: "DosisLight",
								fontSize: 22,
							}}
							keyboardType='numeric'
							placeholder="Vasos de fertilizante"
							placeholderTextColor={'#616161'}
							onChangeText={this.onSelectedVasosFertilizanteChange}
							underlineColorAndroid={Colors.accentColor}
						/>
						<Icon type="Entypo" name="flash" style={{ position: 'absolute', right: 0, fontSize: 22, color: selectedVasosFertilizante > 0 ? Colors.accentColor : '#616161', padding: 10 }} />
					</View>

					<View style={{
						width: '85%',
						flexDirection: 'row',
						justifyContent: 'space-evenly',
						alignItems: 'center',
					}}>
						<TouchableOpacity onPress={this.onCancelPress} >
							<Icon style={{ fontSize: 82, color: '#fff' }} type="EvilIcons" name="close" />
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onDonePress} disabled={!readyToSubmit}>
							<Icon style={{ fontSize: 82, color: '#fff', opacity: readyToSubmit ? 1 : 0.3 }} type="EvilIcons" name="check" />
						</TouchableOpacity>
					</View>

				</View>
			</Modal>
		);
	}
}