import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);

import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import { View, Button, Card, CardItem, Text, Body, Icon, Right } from 'native-base';
import firebase from 'react-native-firebase'
import moment from 'moment-timezone';
import Const from './../persistente/Const'

export default class CardPasajeroOverMap extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
		};
	}

	render() {
		if (this.props.visible && this.props.pasajeroFocus) {
			const pasajero = this.props.pasajeroFocus;
			return (
				<View style={{ flex: 1 }}>
					<Card>
						<CardItem>
							<Body>
								<TouchableOpacity onPress={() => this.props.onClose()} style={{ position: 'absolute', top: 0, right: 0 }} >
									<Icon type="Feather" name='x' style={{ color: '#2b2b2b', fontSize: 20 }} />
								</TouchableOpacity>
								<Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>{moment.utc(pasajero.pasajero_fh_inicio).tz(Const.tz).format('HH:mm')} hs</Text>
								<Text style={{ fontFamily: "OpenSans-Light", fontSize: 18 }}>{pasajero.pasajero_razon_social}</Text>
								<Text style={{ fontFamily: "OpenSans-Light", fontSize: 16, color: '#616161' }}>{pasajero.pasajero_domicilio}</Text>
							</Body>
						</CardItem>
					</Card>
				</View>
			);
		}
		else return null;
	}
}


const styles = StyleSheet.create({
});
