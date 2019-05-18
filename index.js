import React, { Component } from 'react';
import { name as appName } from './app.json';
import { AppRegistry, Text, View } from 'react-native';
import { Spinner } from 'native-base';

import App from './src/App';

class Main extends Component {
    state = {
        isLoading: false
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                    <Text style={{ fontFamily: "DosisLight", fontSize: 42, color: '#2b2b2b' }}>PlantCare</Text>
                    <Spinner color='rgb(179,15,59)' />
                </View>
            )
        } else
            return <App />
    }
}

AppRegistry.registerComponent(appName, () => Main);
