import React from 'react';
import { Dimensions, Text, View, ScrollView, TouchableOpacity, Alert,ToastAndroid } from 'react-native';
import { Spinner, Icon, Button } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import styled from 'styled-components'
import DeviceInfo from 'react-native-device-info';

import NativeAlarmSetter from './NativeAlarmSetter'

const configDefault = {
	notificationsOn: true
}
const version = DeviceInfo.getVersion()

const ConfiguracionHeader = styled(View) `
	width: 100%;
	height:10%;
	display:flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
`
const ConfiguracionSection = styled(View) `
	padding:10px;
	margin-bottom:20px;
	display:flex;
	flex-direction:column;
	justify-content: space-evenly;
	align-items: center;
`
const ConfiguracionItem = styled(View) `
	width: 100%;
	display:flex;
	flex-direction:row;
	justify-content: space-between;
	align-items: center;
	padding:20px;
	margin-bottom:10px;
	background-color:#fff;
	border-radius: 5;
`
const ConfiguracionItemIcon = styled(TouchableOpacity) `
	width:50px;
	flex-direction: row;
	justify-content: center;
	align-items: center;
`


export default class Configuracion extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isRefreshing: false,
			config: null
		};
	}

	reloadConfig = () => {
		this.setState({ isRefreshing: true }, async () => {
			try {
				const data = await AsyncStorage.getItem('Config');
				if (data !== null) {
					this.setState({ config: JSON.parse(data) })
				} else {
					await AsyncStorage.setItem('Config', JSON.stringify(configDefault));
					this.setState({ config: configDefault })
				}
			} catch (error) {
				// Error retrieving data
			}
			this.setState({ isRefreshing: false })
		})
	}

	onSwitchNotifications = async () => {
		let { config } = this.state
		if (config) {
			config.notificationsOn = !config.notificationsOn
			await AsyncStorage.setItem('Config', JSON.stringify(config));
			// TODO: set notificaciones on/off
			this.setState({ config: config })
		}
		this.onCancelAlarm()
	}

	reset = async () => {
		try {
			await AsyncStorage.setItem('Plantas', JSON.stringify([{ name: null }]));
		} catch (error) {
			// Error saving data
		}
	}

	onReset = () => {
		Alert.alert(
			'Eliminar todo',
			'¿Está seguro que desea eliminar todas las plantas? Esta operación no se puede revertir',
			[
				{ text: 'Cancelar', onPress: null },
				{
					text: 'Sí', onPress: () => {
						this.setState({ isRefreshing: true },
							async () => {
								await this.reset()
								this.props.onReset()
								this.setState({ isRefreshing: false })
							}
						)
					}
				},
			],
			{ cancelable: true }
		)
	}

	onSetAlarm = () => {
		NativeAlarmSetter.setAlarm("1","potus","1","10","35")
		NativeAlarmSetter.setAlarm("2","cactus","1","10","35")
	}

	onCancelAlarm = () => {
		NativeAlarmSetter.cancelAlarm("1")
	}

	async componentDidMount() {
		this.reloadConfig()

		this.onSetAlarm()
	}

	render() {
		const screenWidth = Dimensions.get('window').width
		const screenHeight = Dimensions.get('window').height
		const { config } = this.state
		return (
			<View style={{
				flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'
			}}>
				<ConfiguracionHeader>
					<ConfiguracionItemIcon onPress={this.props.onClose} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
						<Icon type="EvilIcons" name="chevron-down" style={{ fontSize: 42, color: '#2b2b2b' }} />
					</ConfiguracionItemIcon>
					<Text style={{ fontFamily: "DosisLight", fontSize: 28, color: '#2b2b2b', paddingRight: 10 }}>Configuración</Text>
				</ConfiguracionHeader>

				<ScrollView style={{ width: screenWidth, padding: 15, backgroundColor: '#f1f1f1' }}>
					<ConfiguracionSection>
						<ConfiguracionItem style={{
							shadowColor: "#fff",
							shadowOffset: {
								width: 1,
								height: 1,
							},
							shadowOpacity: 0.15,
							shadowRadius: 1,
							elevation: 3
						}}>
							<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>Notificaciones</Text>
							<ConfiguracionItemIcon onPress={this.onSwitchNotifications}>
								<Icon type="Feather" name={config && config.notificationsOn ? "award" : "bar-chart"} style={{ fontSize: 28, color: config && config.notificationsOn ? '#616161' : '#a1a1a1' }} />
							</ConfiguracionItemIcon>
						</ConfiguracionItem>
						<ConfiguracionItem style={{
							shadowColor: "#fff",
							shadowOffset: {
								width: 1,
								height: 1,
							},
							shadowOpacity: 0.15,
							shadowRadius: 1,
							elevation: 3
						}}>
							<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>Limpiar</Text>
							<ConfiguracionItemIcon onPress={this.onReset}>
								<Icon type="EvilIcons" name="trash" style={{ fontSize: 34, color: '#2b2b2b' }} />
							</ConfiguracionItemIcon>
						</ConfiguracionItem>
					</ConfiguracionSection>

					<ConfiguracionSection>
						<ConfiguracionItem style={{
							shadowColor: "#fff",
							shadowOffset: {
								width: 1,
								height: 1,
							},
							shadowOpacity: 0.15,
							shadowRadius: 1,
							elevation: 3
						}}>
							<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>Versión</Text>
							<ConfiguracionItemIcon onPress={this.onSwitchNotifications}>
								<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#414141' }}>{version}</Text>
							</ConfiguracionItemIcon>
						</ConfiguracionItem>
					</ConfiguracionSection>
				</ScrollView>
			</View>
		)
	}
}
