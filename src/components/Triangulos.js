import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);

import React from 'react';
import { StyleSheet, Dimensions, } from 'react-native';
import { View, } from 'native-base';

export default class Triangulos extends React.Component {
	render() {
		return (
			(this.props.up) ? (
				(this.props.red) ?
					(
						[<View key={"triangleBigUp"} style={[styles.triangleBigUp]} />,
						<View key={"triangleMediumUp"} style={[styles.triangleMediumUp]} />,
						<View key={"triangleSmallUp"} style={[styles.triangleSmallUp]} />]
					)
					: (
						[<View key={"triangleBigUpBlue"} style={[styles.triangleBigUpBlue]} />,
						<View key={"triangleMediumUpBlue"} style={[styles.triangleMediumUpBlue]} />,
						<View key={"triangleSmallUpBlue"} style={[styles.triangleSmallUpBlue]} />]
					))
				: // down
				((this.props.red) ?
					(
						[<View key={"triangleBigDown"} style={[styles.triangleBigDown]} />,
						<View key={"triangleMediumDown"} style={[styles.triangleMediumDown]} />,
						<View key={"triangleSmallDown"} style={[styles.triangleSmallDown]} />]
					)
					: (
						[<View key={"triangleBigDownBlue"} style={[styles.triangleBigDownBlue]} />,
						<View key={"triangleMediumDownBlue"} style={[styles.triangleMediumDownBlue]} />,
						<View key={"triangleSmallDownBlue"} style={[styles.triangleSmallDownBlue]} />]
					))
		)
	}
}


const styles = StyleSheet.create({
	triangleBigUp: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: Dimensions.get('window').width,
		borderRightWidth: 0,
		borderBottomWidth: 150,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: 'rgba(179,15,59,0.3)',
		zIndex: -3
	},
	triangleMediumUp: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: Dimensions.get('window').width,
		borderRightWidth: 0,
		borderBottomWidth: 100,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: 'rgba(179,15,59,0.6)',
		zIndex: -2
	},
	triangleSmallUp: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: Dimensions.get('window').width,
		borderRightWidth: 0,
		borderBottomWidth: 40,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: '#b30f3b',
		zIndex: -1
	},
	triangleBigDown: {
		position: 'absolute',
		right: 0,
		top: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderRightWidth: Dimensions.get('window').width,
		borderLeftWidth: 0,
		borderTopWidth: 110,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: 'rgba(179,15,59,0.3)',
		zIndex: -3
	},
	triangleMediumDown: {
		position: 'absolute',
		right: 0,
		top: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderRightWidth: Dimensions.get('window').width,
		borderLeftWidth: 0,
		borderTopWidth: 80,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: 'rgba(179,15,59,0.6)',
		zIndex: -2
	},
	triangleSmallDown: {
		position: 'absolute',
		right: 0,
		top: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderRightWidth: Dimensions.get('window').width,
		borderLeftWidth: 0,
		borderTopWidth: 40,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: 'rgba(179,15,59,1)',
		zIndex: -1
	},
	triangleBigUpBlue: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: Dimensions.get('window').width,
		borderRightWidth: 0,
		borderBottomWidth: 150,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: 'rgba(27, 0, 136,0.3)',
		zIndex: -3
	},
	triangleMediumUpBlue: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: Dimensions.get('window').width,
		borderRightWidth: 0,
		borderBottomWidth: 100,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: 'rgba(27, 0, 136,0.6)',
		zIndex: -2
	},
	triangleSmallUpBlue: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: Dimensions.get('window').width,
		borderRightWidth: 0,
		borderBottomWidth: 40,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: 'rgba(27, 0, 136,1)',
		zIndex: -1
	},
	triangleBigDownBlue: {
		position: 'absolute',
		right: 0,
		top: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderRightWidth: Dimensions.get('window').width,
		borderLeftWidth: 0,
		borderTopWidth: 110,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: 'rgba(27, 0, 136,0.3)',
		zIndex: -3
	},
	triangleMediumDownBlue: {
		position: 'absolute',
		right: 0,
		top: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderRightWidth: Dimensions.get('window').width,
		borderLeftWidth: 0,
		borderTopWidth: 80,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: 'rgba(27, 0, 136,0.6)',
		zIndex: -2
	},
	triangleSmallDownBlue: {
		position: 'absolute',
		right: 0,
		top: 0,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderRightWidth: Dimensions.get('window').width,
		borderLeftWidth: 0,
		borderTopWidth: 40,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: 'rgba(27, 0, 136,1)',
		zIndex: -1
	},
});
