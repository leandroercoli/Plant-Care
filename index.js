import React, { Component } from 'react';
import { name as appName } from './app.json';
import { AppRegistry, Text, View } from 'react-native';
import { Spinner } from 'native-base';

import App from './src/App';

class Main extends Component {
    state = {
        isLoading: true
    }

    render() {
            return <App />
    }
}


//<View style={{flex:1, backgroundColor:'red'}}/>

AppRegistry.registerComponent(appName, () => Main);
