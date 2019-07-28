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
export default class GridView extends React.Component {
	constructor(props) {
		super(props);

		this.PlantList = React.createRef()

		this.state = {
		};
	}

	onPlantaThumbPress = (index) => {
		this.props.onPlantaThumbPress(index)
	}

	onCurrentPlantChange = (currentPlanta, currentPlantaIndex) => {
		this.props.onCurrentPlantChange(currentPlanta, currentPlantaIndex)
	}

	render = () => {
		const { idioma,colores, data } = this.props
		return (
			<View style={{ width: '100%', height: '100%' }}>
				<View style={{ width: '100%', height: 60, backgroundColor: colores.listViewHeaderBackground, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
					<View style={{
						height: '100%',
						flexDirection: 'row',
						justifyContent: 'flex-start',
						alignItems: 'center',
					}}>
						<View style={{
							width: 50, height: '100%',
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
						}}>
							<Image source={Img.fullLogo} style={{ height: '60%', width: '60%', resizeMode: 'contain' }} />
						</View>
						<Text style={{ fontFamily: "DosisLight", fontSize: 28, color: colores.headerTitle }}>Plant Care</Text>
					</View>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'flex-end',
						alignItems: 'center',
					}}>
						{data.length > 0 && <TouchableOpacity onPress={this.props.onNewPlantPress} style={{ marginLeft: 10, marginRight: 10 }}>
							<Icon type="EvilIcons" name="plus" style={{ fontSize: 38, color: colores.headerTitle }} />
						</TouchableOpacity>}
						<TouchableOpacity onPress={this.props.onConfiguracionPress} style={{ marginLeft: 10, marginRight: 10, paddingBottom: 2 }}>
							<Icon type="EvilIcons" name="gear" style={{ fontSize: 34, color: colores.headerTitle }} />
						</TouchableOpacity>
					</View>
				</View>
				<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: colores.listViewBackground }}>
					{
						data.length == 0 ?
							<TouchableOpacity onPress={this.props.onNewPlantPress}>
								<Icon type="EvilIcons" name="plus" style={{ fontSize: 102, color: colores.newPlantBigIcon }} />
							</TouchableOpacity>
							: <FlatList
								ref={(r) => this.PlantList = r}
								scrollEnabled={true}
								horizontal={false}
								numColumns={2}
								columnWrapperStyle={{ justifyContent: 'space-between', }}
								showsHorizontalScrollIndicator={false}
								data={data}
								initialScrollIndex={0}
								//extraData={[data]}
								style={{ width: '100%', height: '100%' }}
								keyExtractor={(item, index) => "" + index}
								contentContainerStyle={{ width: '100%', height: '100%' }}
								renderItem={({ item, index }) => (
									<View style={{
										flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
										width: screenWidth * 0.5,
										height: screenHeight * 0.5,
										padding: 10,
									}}>
										<TouchableOpacity onPress={() => this.onPlantaThumbPress(index)} style={{ height: '100%', width: '100%' }}>
											<View style={{
												width: '100%', height: '100%',
												overflow: 'hidden',
												justifyContent: 'center',
												alignItems: 'center',
												borderRadius: 15
											}}>
												{
													item.images && item.images.length > 0 ?
														<Image source={item.images[0]} style={{ height: '100%', width: '100%', resizeMode: 'cover' }} />
														: <Image source={Img.logo} style={{ height: '100%', width: '100%', resizeMode: 'cover', opacity: 0.9 }} />
												}
												<View style={{
													position: 'absolute', bottom: 0
												}}  >
													<LinearGradient colors={['transparent', 'rgba(0,0,0,1)']}
														style={{
															paddingBottom: 5, paddingTop: 50, paddingLeft: '5%', paddingRight: '5%',
															flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center',
														}}>
														<View style={{
															width: '100%',
															flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
														}}>
															<Text style={{ fontFamily: "DosisLight", fontSize: 24, borderColor: 'transparent', color: '#f1f1f1' }}>{item.name}</Text>
														</View>
														<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', paddingLeft: 3, marginBottom: 5 }}>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '25%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 15, color: '#f1f1f1', marginRight: 1 }}>{item.vasosAgua} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
																<Icon type="Entypo" name="drop" style={{ fontSize: 15, color: '#f1f1f1', marginLeft: 3 }} />
															</View>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '25%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 15, color: '#f1f1f1', marginRight: 1 }}>{item.vasosAlimento} {/*currentPlanta.vasosAgua == 1 ? 'vaso' : 'vasos'*/}</Text>
																<Icon type="Entypo" name="flash" style={{ fontSize: 15, color: '#f1f1f1', marginLeft: 3 }} />
															</View>
															<View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '50%' }}>
																<Text style={{ fontFamily: "DosisLight", fontSize: 15, color: '#f1f1f1' }}>{item.hora < 10 ? "0" + item.hora : item.hora}:{item.minutos < 10 ? "0" + item.minutos : item.minutos}</Text>
																<Icon type="EvilIcons" name={"bell"} style={{ fontSize: 20, color: item.alarma ? '#f1f1f1' : '#a1a1a1' }} />
															</View>
														</View>
														<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
															<CalendarioComponent thumb color={"#f1f1f1"} idioma={idioma} diasRiego={item.diasRiego} diasAlimento={item.diasAlimento} />
														</View>
													</LinearGradient>
												</View>
											</View>
										</TouchableOpacity>
									</View>
								)}
							/>
					}
				</View>
			</View>
		);
	}
}