import React from 'react';
import { Dimensions, Text, View, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Icon } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import { Colors } from './Const'
import NativeAlarmSetter from './NativeAlarmSetter'

export default class ElegirIdioma extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
		};
	}

	show = () => {
		this.setState({ show: true })
	}

	hide = () => {
		this.setState({ show: false })
	}

	onPressEspaniol = () => {
		AsyncStorage.setItem('Idioma', 'es')
		NativeAlarmSetter.setLanguage('es')
		this.props.onSelectIdioma('es')
	}

	onPressEnglish = () => {
		AsyncStorage.setItem('Idioma', 'en')
		NativeAlarmSetter.setLanguage('en')
		this.props.onSelectIdioma('en')
	}

	onRequestClose = () => {
		const { canCancel } = this.props
		if (canCancel) this.hide()
	}

	render = () => {
		const { show } = this.state
		const { canCancel } = this.props
		return (
			<Modal
				animationType="fade"
				transparent={true}
				visible={show}
				onRequestClose={this.onRequestClose}>
				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
					<View style={{ flex: 1,width:'100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<View style={{
							width: '85%',
							flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
							padding: 15,
							backgroundColor: 'rgba(255,255,255,0.9)',
							borderRadius: 20,
							marginBottom: 30,
							//	elevation: 15
						}}>
							<TouchableOpacity onPress={this.onPressEspaniol}>
								<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>Español</Text>
							</TouchableOpacity>
						</View>
						<View style={{
							width: '85%',
							flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
							padding: 15,
							backgroundColor: 'rgba(255,255,255,0.9)',
							borderRadius: 20,
							marginBottom: 30,
							//	elevation: 15
						}}>
							<TouchableOpacity onPress={this.onPressEnglish}>
								<Text style={{ fontFamily: "DosisLight", fontSize: 22, color: '#2b2b2b' }}>English</Text>
							</TouchableOpacity>
						</View>
					</View>
					{
						canCancel && <View style={{
							width: '85%',							
						paddingTop:15, paddingBottom:15,
							flexDirection: 'row',
							justifyContent: 'space-evenly',
							alignItems: 'center',
						}}>
							<TouchableOpacity onPress={this.onRequestClose} >
								<Icon style={{ fontSize: 82, color: '#fff' }} type="EvilIcons" name="close" />
							</TouchableOpacity>
						</View>
					}
				</View>
			</Modal>
		);
	}
}