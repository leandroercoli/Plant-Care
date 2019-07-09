import React from 'react';
import { Dimensions, Text, View, ScrollView, TouchableOpacity, Alert, ToastAndroid, Modal } from 'react-native';
import { Spinner, Icon, Button } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import styled from 'styled-components'
import DeviceInfo from 'react-native-device-info';
import { Labels, Colors } from './Const'
import ElegirIdioma from './ElegirIdioma';

const configDefault = {
	notificationsOn: true
}
const version = DeviceInfo.getVersion()

const ConfiguracionHeader = styled(View)`
	width: 100%;
	height:10%;
	display:flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
`
const ConfiguracionSection = styled(View)`
	padding:10px;
	margin-bottom:20px;
	display:flex;
	flex-direction:column;
	justify-content: space-evenly;
	align-items: center;
`
const ConfiguracionItem = styled(View)`
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
const ConfiguracionItemIcon = styled(TouchableOpacity)`
	width:50px;
	flex-direction: row;
	justify-content: center;
	align-items: center;
`


export default class Configuracion extends React.Component {
	constructor(props) {
		super(props);

		this.ElegirIdiomaModal = React.createRef()

		this.state = {
			show: false,
			isRefreshing: false,
			config: null
		};
	}

	show = () => {
		this.setState({ show: true })
	}

	hide = () => {
		this.setState({ show: false })
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
	}

	reset = async () => {
		try {
			await AsyncStorage.setItem('Plantas', JSON.stringify([{ name: null }]));
		} catch (error) {
			// Error saving data
		}
	}

	onReset = () => {
		const { idioma } = this.props
		Alert.alert(
			Labels[idioma].configuracion.alertLimpiar.title,
			Labels[idioma].configuracion.alertLimpiar.descripcion,
			[
				{ text: Labels[idioma].configuracion.alertLimpiar.btnCancelar, onPress: null },
				{
					text: Labels[idioma].configuracion.alertLimpiar.btnOk, onPress: () => {
						this.setState({ isRefreshing: true },
							async () => {
								//await this.reset()
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

	onSelectIdiomaPress = () => {
		this.ElegirIdiomaModal.show()
	}

	onSelectIdioma = (idioma) => {
		this.ElegirIdiomaModal.hide()
		this.props.onSelectIdioma(idioma)
	}

	async componentDidMount() {
		this.reloadConfig()
	}

	render() {
		const screenWidth = Dimensions.get('window').width
		const screenHeight = Dimensions.get('window').height
		const { show, config } = this.state
		const { idioma } = this.props
		return (
			<Modal
				animationType="slide"
				transparent={false}
				visible={show}
				onRequestClose={this.hide} >
				<ElegirIdioma ref={(r) => this.ElegirIdiomaModal = r} onSelectIdioma={this.onSelectIdioma} canCancel={true} />
				<View style={{
					flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'
				}}>
					<View style={{ width: '100%', height: '10%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
						<Text style={{ fontFamily: "DosisLight", fontSize: 28, color: '#2b2b2b', paddingRight: 10 }}>{Labels[idioma].configuracion.title}</Text>
						<TouchableOpacity onPress={this.hide} style={{ width: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
							<Icon type="EvilIcons" name="chevron-down" style={{ fontSize: 42, color: '#2b2b2b' }} />
						</TouchableOpacity>
					</View>
					<ScrollView style={{ width: screenWidth, padding: 15, backgroundColor: '#f1f1f1' }}>
						<ConfiguracionSection>
							{/*<ConfiguracionItem style={{
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
					*/}
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
								<TouchableOpacity onPress={this.onSelectIdiomaPress} style={{ flex: 1 }}>
									<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>{Labels[idioma].configuracion.lblIdioma}</Text>
								</TouchableOpacity>
							</ConfiguracionItem>
							<ConfiguracionItem style={{
								shadowColor: "#fff",
								shadowOffset: {
									width: 1,
									height: 1,
								},
								shadowOpacity: 0.15,
								shadowRadius: 1,
								elevation: 3,
							}}>
								<TouchableOpacity onPress={this.onReset} style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
									<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>{Labels[idioma].configuracion.lblLimpiar}</Text>
									<Icon type="EvilIcons" name="trash" style={{ fontSize: 34, color: '#2b2b2b' }} />
								</TouchableOpacity>
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
								<View  style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
								<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>{Labels[idioma].configuracion.lblVersion}</Text>
								<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#414141', paddingRight:10 }}>{version}</Text>
							</View>
								</ConfiguracionItem>
						</ConfiguracionSection>
					</ScrollView>
				</View>
			</Modal>
		)
	}
}
