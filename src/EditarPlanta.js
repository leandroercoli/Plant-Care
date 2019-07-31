import React from 'react';
import { Dimensions, Text, View, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Icon } from 'native-base';
import TimePickerComponent from './TimePickerComponent'
import CalendarioComponent from './CalendarioComponent'
import { Labels, Colors } from './Const'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
export default class EditarPlanta extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
			plantaName: '',
			selectedHour: 0,
			selectedMinutes: 0,
			alarmOn: true,
			selectedVasosAgua: '0',
			selectedVasosFertilizante: '0'
		};
	}

	show = () => {
		this.setState({ show: true })
	}

	hide = () => {
		this.setState({ show: false })
	}

	/*componentWillReceiveProps(nextProps) {
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
		if (nextProps.selectedVasosAgua !== this.props.selectedVasosAgua) {
			this.setState({ selectedVasosAgua: String(nextProps.selectedVasosAgua) });
		}
		if (nextProps.selectedVasosFertilizante !== this.props.selectedVasosFertilizante) {
			this.setState({ selectedVasosFertilizante: String(nextProps.selectedVasosFertilizante) });
		}
		if (nextProps.diasRiego !== this.props.diasRiego) {
			this.setState({ diasRiego: nextProps.diasRiego });
		}
		if (nextProps.diasAlimento !== this.props.diasAlimento) {
			this.setState({ diasAlimento: nextProps.diasAlimento });
		}
	}*/

	componentDidMount() {
		const { plantaName, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante, diasRiego, diasAlimento } = this.props
		this.setState({
			plantaName: plantaName,
			selectedHour: selectedHour ? selectedHour : 0,
			selectedMinutes: selectedMinutes ? selectedMinutes : 0,
			alarmOn: alarmOn,
			selectedVasosAgua: selectedVasosAgua ? String(selectedVasosAgua) : '0',
			selectedVasosFertilizante: selectedVasosFertilizante ? String(selectedVasosFertilizante) : '0',
			diasRiego:diasRiego ? diasRiego : [],
			diasAlimento:diasAlimento ? diasAlimento : []
		})
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

	onDiaPress = (diasRiego, diasAlimento) => {
		this.setState({ diasRiego: diasRiego, diasAlimento:diasAlimento })
	}

	onDonePress = () => {
		const { idioma } = this.props
		const { plantaName, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante , diasRiego, diasAlimento} = this.state
		const vasosAgua = selectedVasosAgua != '' ? selectedVasosAgua : 0
		const vasosFertilizante = selectedVasosFertilizante != '' ? selectedVasosFertilizante : 0
		Alert.alert(
			Labels[idioma].editarPlantaDoneAlert.title,
			Labels[idioma].editarPlantaDoneAlert.descripcion,
			[
				{ text: Labels[idioma].editarPlantaDoneAlert.btnCancelar, onPress: this.hide },
				{
					text: Labels[idioma].editarPlantaDoneAlert.btnOk, onPress: () => {
						this.props.onFinishEditar(plantaName, selectedHour, selectedMinutes, alarmOn, Number(vasosAgua), Number(vasosFertilizante), diasRiego, diasAlimento); this.hide()
					}
				},
			],
			{ cancelable: true })
	}

	render = () => {
		const { idioma, colores } = this.props
		const { show, plantaName, selectedHour, selectedMinutes, alarmOn, selectedVasosAgua, selectedVasosFertilizante, diasRiego, diasAlimento } = this.state
		const readyToSubmit = plantaName != ''  // && nuevaPlantaFoto 
		return (
			<Modal
				animationType="fade"
				transparent={true}
				visible={show}
				onRequestClose={this.hide}>
				<View style={{
					flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',  flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
				}}>
					<ScrollView >
						<View style={{
							width:screenWidth, paddingTop:25, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
						}}>
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
										paddingTop: 15,
										paddingRight: 50,
										paddingBottom: 10,
										paddingLeft: 10,
										color: '#2b2b2b',
										fontFamily: "DosisLight",
										fontSize: 22,
									}}
									defaultValue={plantaName}
									placeholder={Labels[idioma].editarPlanta.lblPlaceholderNombre}
									placeholderTextColor={'#616161'}
									onChangeText={this.plantaTextChange}
									autoCapitalize={'words'}
									underlineColorAndroid={Colors.accentColor}
									maxLength={30}
								/>
							</View>
							<View style={{
								width: '85%',
								backgroundColor: 'rgba(255,255,255,0.9)',
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								paddingTop: '4%', paddingLeft: '4%', paddingRight: '4%',paddingBottom:10,
								borderRadius: 20,
								marginBottom: 30,
							}}>
								<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>{Labels[idioma].editarPlanta.lblHoraAlarma}</Text>
								<TimePickerComponent fontSize={22} onSelectTime={this.onSelectTime} selectedHour={selectedHour} selectedMinutes={selectedMinutes} />
							</View>
							<View style={{
								width: '85%',
								backgroundColor: 'rgba(255,255,255,0.9)',
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								paddingTop: '4%', paddingLeft: '4%', paddingRight: '4%',paddingBottom:10,
								borderRadius: 20,
								marginBottom: 30,
							}}>
								<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>{Labels[idioma].editarPlanta.lblNotificaciones}</Text>
								<TouchableOpacity onPress={this.onAlarmSwitch}>
									<Icon type={"MaterialCommunityIcons"} name={alarmOn ? "alarm-check" : "alarm-off"} style={{ fontSize: 25, color: alarmOn ? Colors.accentColor : '#616161' }} />
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
										paddingTop: 15,
										paddingRight: 50,
										paddingBottom: 10,
										paddingLeft: 10,
										color: '#2b2b2b',
										fontFamily: "DosisLight",
										fontSize: 22,
									}}
									defaultValue={selectedVasosAgua}
									keyboardType='numeric'
									placeholder={Labels[idioma].editarPlanta.lblVasosAgua}
									placeholderTextColor={'#616161'}
									onChangeText={this.onSelectedVasosAguaChange}
									underlineColorAndroid={Colors.accentColor}
								/>
								<Icon type="Entypo" name="drop" style={{ position: 'absolute', right: 10, fontSize: 22, color: selectedVasosAgua > 0 ? Colors.accentColor : '#616161', padding: 10 }} />
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
										paddingTop: 15,
										paddingRight: 50,
										paddingBottom: 10,
										paddingLeft: 10,
										color: '#2b2b2b',
										fontFamily: "DosisLight",
										fontSize: 22,
									}}
									defaultValue={selectedVasosFertilizante}
									keyboardType='numeric'
									placeholder={Labels[idioma].editarPlanta.lblVasosFertilizante}
									placeholderTextColor={'#616161'}
									onChangeText={this.onSelectedVasosFertilizanteChange}
									underlineColorAndroid={Colors.accentColor}
								/>
								<Icon type="Entypo" name="flash" style={{ position: 'absolute', right: 10, fontSize: 22, color: selectedVasosFertilizante > 0 ? Colors.accentColor : '#616161', padding: 10 }} />
							</View>
							<View style={{ 			width: '85%',
								flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
								paddingLeft: '4%', paddingRight: '4%',
								paddingTop:15,
								backgroundColor: 'rgba(255,255,255,0.9)',
								borderRadius: 20,
								marginBottom: 30, }}>
								<CalendarioComponent color={"#2b2b2b"} idioma={idioma} onDiaPress={this.onDiaPress} diasRiego={diasRiego} diasAlimento={diasAlimento} />
							</View>
						</View>
					</ScrollView>

					<View style={{
						width: '85%',
						flexDirection: 'row',
						justifyContent: 'space-evenly',
						alignItems: 'center',
					}}>
						<TouchableOpacity onPress={this.hide} >
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