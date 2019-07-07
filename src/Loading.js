import React from 'react';
import { Dimensions, Text, View, Animated, Image, Easing } from 'react-native';
import { Labels, Colors, Img } from './Const'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
export default class Loading extends React.Component {
	constructor(props) {
		super(props);
		this.spinValue = new Animated.Value(0)
		this.state = {
		};
	}

	componentDidMount() {
		this.spin()
	}

	spin() {
		this.spinValue.setValue(0)
		Animated.timing(
			this.spinValue,
			{
				toValue: 1,
				duration: 3000,
				easing: Easing.linear
			}
		).start(() => this.spin())
	}

	render = () => {
		const spin = this.spinValue.interpolate({
			inputRange: [0, 0.5, 1],
			outputRange: ['-9deg', '-2deg', '-9deg']
		})
		const spinSmall = this.spinValue.interpolate({
			inputRange: [0, 0.5, 1],
			outputRange: ['5deg', '-2deg', '5deg']
		})
		const opacitySmall = this.spinValue.interpolate({
			inputRange: [0, 0.5, 1],
			outputRange: [0.6,1,0.6]
		})
		return (
			<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
				<View style={{ width: screenWidth * 0.6, height: screenWidth * 0.6, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
					<View style={{
						width: '100%', height: '100%',
						overflow: 'hidden',
						justifyContent: 'center',
						alignItems: 'center'
					}}>
					<Animated.Image
						style={{
							position:'absolute',
							height: '100%', width: '100%', resizeMode: 'contain',opacity:opacitySmall,
							transform: [{translateX:15},{ rotate: spinSmall }]
						}}
						source={Img.smallLeaf}
					/>
						<Animated.Image
							style={{
								position:'absolute',
								height: '100%', width: '100%', resizeMode: 'contain',
								transform: [{ rotate: spin }]
							}}
							source={Img.bigLeaf}
						/>
					</View>
				</View>
			</View>
		)
	}
}