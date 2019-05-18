import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);

import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import { View, Button, Icon, Text, Spinner, Container, Header, Left, Right, Body } from 'native-base';
import Triangulos from '../components/Triangulos'
import firebase from 'react-native-firebase'

export default class Mensajes extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			rastrear: false,
			latitude: null,
			longitude: null,
			dataSourceWEB: null,
			fechaHoraUltimaActualizacion: null,
			fechaHoraUltimaActualizacion2: null,
			error: null,
		};
	}
	render() {
		return (
			<Container>
				<Header style={{ backgroundColor: '#1b0088' }}>
					<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<Text style={styles.pantallaTitle}>Mensajes</Text>
					</View>
					<Body>
					</Body>
					<Right>
					</Right>
				</Header>

				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', backgroundColor: 'transparent', paddingTop:15, borderBottomColor: '#1b0088', borderBottomWidth: 15 }}>
					<View style={{ flex: 1, marginTop: 0, marginBottom: 0, marginLeft: 10, marginRight: 10 }}>
						<ScrollView style={{ backgroundColor: 'transparent' }}>

						</ScrollView>
					</View>
					<Triangulos up={true} red={false} />
				</View>

				</Container>
		);
	}
}


const styles = StyleSheet.create({
	pantallaTitle: {
		fontFamily: "OpenSans-Regular",
		fontSize: 22,
		color: '#fff',
	},
	
});
