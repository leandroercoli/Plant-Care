import React from 'react';
import { Dimensions, Text, View, FlatList, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { Container, Header, Body, Right, Spinner, Icon } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import NuevaPlanta from './NuevaPlanta'
import Configuracion from './Configuracion'
import EditarPlanta from './EditarPlanta'
import CalendarioComponent from './CalendarioComponent'
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import NativeAlarmSetter from './NativeAlarmSetter'
import { Labels, Colors, Img } from './Const'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
export default class CurrentPlantFoto extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
			imgSource: null
		};
	}

	show = () => {
		this.setState({ show: true })
	}

	hide = () => {
		this.setState({ show: false })
	}

	deleteCurrentFoto = () => {
		const { idioma } = this.props
		Alert.alert(
			Labels[idioma].eliminarFotoAlert.title,
			Labels[idioma].eliminarFotoAlert.descripcion,
			[
				{ text: Labels[idioma].eliminarFotoAlert.btnCancelar, onPress: () => null },
				{
					text: Labels[idioma].eliminarFotoAlert.btnOk, onPress: () => {
						this.setState({ imgSource: this.props.imgSource },
							() => {
								this.hide()
								this.props.onCurrentFotoDelete()
							})
					}
				}
			],
			{ cancelable: true }
		)
	}

	componentDidUpdate(prevProps) {
		if ((this.props.imgSource !== null) && (prevProps.imgSource === null || prevProps.imgSource !== this.props.imgSource)) {
			this.setState({ imgSource: this.props.imgSource });
		}
	}

	componentDidMount() {
		if (this.props.imgSource) {
			this.setState({ imgSource: this.props.imgSource });
		}
	}

	render = () => {
		const { idioma } = this.props
		const { show, imgSource, isRefreshing } = this.state
		return (
			<Modal
				animationType="fade"
				visible={show}
				onRequestClose={this.hide}>
				<Container>
					{
						isRefreshing ?
							<View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}><Spinner color={Colors.accentColor} /></View>
							:
							<View style={{ width: screenWidth, height: screenHeight }}>
								<View style={{
									width: '100%', height: '100%',
									overflow: 'hidden',
									justifyContent: 'center',
									alignItems: 'center',
								}}>
									<TouchableOpacity onPress={this.hide} style={{ height: '100%', width: '100%' }}>
										<Image source={imgSource} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
									</TouchableOpacity>

								</View>
							</View>
					}
					<View style={{
						position: 'absolute', bottom: 0, width: '100%', padding: 25,
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',

					}}>
						<View style={{
							backgroundColor: 'rgba(255,255,255,1)', width: 50, height: 50, borderRadius: 25, borderColor: '#2b2b2b', borderWidth: 1,
							marginLeft: 15, marginRight: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
						}}>
							<TouchableOpacity onPress={this.hide} >
								<Icon style={{ fontSize: 42, color: '#2b2b2b' }} type="EvilIcons" name="close" />
							</TouchableOpacity>
						</View>
						<View style={{
							backgroundColor: 'rgba(255,255,255,1)', width: 50, height: 50, borderRadius: 25, borderColor: '#2b2b2b', borderWidth: 1,
							marginLeft: 15, marginRight: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
						}}>
							<TouchableOpacity onPress={this.deleteCurrentFoto}>
								<Icon style={{ fontSize: 42, color: '#2b2b2b' }} type="EvilIcons" name="trash" />
							</TouchableOpacity>
						</View>
					</View>
				</Container>
			</Modal>
		);
	}
}