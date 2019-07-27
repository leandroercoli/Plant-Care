import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Icon } from 'native-base';
import {  Labels } from './Const'

const hoy = (new Date()).getDay() // retorna un numero entre 0 y 6 (Domingo, Lunes, ...)

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

	onDiaPress = (dianro) => {
		var { diasRiego, diasAlimento } = this.state

		if (diasRiego.includes(dianro) && diasAlimento.includes(dianro)) {
			diasRiego.splice(diasRiego.indexOf(dianro), 1);
		} else if (diasRiego.includes(dianro))
			diasAlimento.push(dianro)
		else if (diasAlimento.includes(dianro))
			diasAlimento.splice(diasAlimento.indexOf(dianro), 1);
		else {
			diasRiego.push(dianro)
		}

		this.setState({ diasRiego: diasRiego, diasAlimento: diasAlimento }, () => this.props.onDiaPress(diasRiego, diasAlimento))
	}

	render = () => {
		const { diasRiego, diasAlimento } = this.state
		const { color, idioma, thumb } = this.props
		const dias = Labels[idioma].dias
		const dropFontSize = thumb ? 15 : 18
		const chevronFontSize = thumb ? 15 : 18
		const daysFontSize = thumb ? 15 : 16 
		return (
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
				{!thumb &&<Icon type="EvilIcons" name="calendar" style={{ fontSize: 32, color: color, paddingTop: 10 }} />}
				{
					dias.map((dia, index) =>
						<TouchableOpacity key={"dia" + index} onPress={() => !thumb ? this.onDiaPress(index) : null}
							style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
								{
									(diasRiego.includes(index) || !diasRiego.includes(index) && !diasAlimento.includes(index)) ?
										<Icon type="Entypo" name="drop" style={{ fontSize: dropFontSize, color: color, opacity: diasRiego.includes(index) ? 1 : 0 }} />
										: null
								}
								{
									diasAlimento.includes(index) ?
										<Icon type="Entypo" name="flash" style={{ fontSize: dropFontSize, color: color }} />
										: null
								}
							</View>
							<Text style={{ fontFamily: "DosisLight", fontSize: daysFontSize, color: color, opacity: diasRiego.includes(index) ? 1 : 0.5 }}>{dia}</Text>
							<Icon type="EvilIcons" name="chevron-up" style={{ fontSize: chevronFontSize, color: color, opacity: (index === hoy) ? 1 : 0 }} />
						</TouchableOpacity>
					)
				}
			</View>
		);
	}
}