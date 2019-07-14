import React from 'react';
import {  View, Animated, Easing } from 'react-native';
import {  Img } from './Const'
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
				duration: 500,
				easing: Easing.ease
			}
		).start(() => {
			// Logic whenever an iteration finishes...
			this.props.onAnimationDone()
		  })
	}

	render = () => {
		const scale = this.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: [1, 0]
		})
		const scaleBackground = this.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: [1, 10]
		})
		const scaleOpacity = this.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: [1,  0]
		})
		return (
			<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor:'#fff' }}>
				<Animated.View style={{
					position:'absolute',
					height: 160, width: 160, borderRadius: 80,
					transform: [{ scale: scaleBackground }],
					backgroundColor:'#089ace'
			}}/>
				<Animated.Image
						style={{
							position:'absolute',
							height: 150, width: 150,
							transform: [{ scale: scale }],
							opacity:scaleOpacity
							//transform: [{translateX:15},{ rotate: spinSmall }]
						}}
						source={Img.fullLogo}
					/>
			</View>
		)
	}
}