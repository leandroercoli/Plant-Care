import React, { Component } from 'react';
import { name as appName } from './app.json';
import { AppRegistry, Text, View } from 'react-native';
import { Spinner } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';

import App from './src/App';
import Loading from './src/Loading';
import ElegirIdioma from './src/ElegirIdioma';

class Main extends Component {
    constructor(props) {
		super(props);
        this.ElegirIdiomaModal = React.createRef()
        this.state = {
            isLoading: true,
            idioma: null
        }
    } 

    componentDidMount = async ()  => {
        const idioma = await AsyncStorage.getItem('Idioma');
        if (idioma == null) {
            if(this.ElegirIdiomaModal) this.ElegirIdiomaModal.show()
        }else{
            this.setState({idioma:idioma})
        }
    }

    onAnimationDone = () => {
        this.setState({isLoading:false})
    }

    onSelectIdioma = (idioma) => { // esto se llama desde el componente ElegirIdioma de aca
        this.setState({idioma:idioma}, ()=> {if(this.ElegirIdiomaModal)this.ElegirIdiomaModal.hide()})
    }

    onChangeIdioma = (idioma) => { // esto se llama desde el componente de configuracion adentro de App
        this.setState({idioma:idioma})
    }


    render() {
        const { idioma , isLoading} = this.state
        return (
            isLoading ? 
            <Loading onAnimationDone={this.onAnimationDone} />
            : idioma ?
                <App idioma={idioma} onSelectIdioma={this.onChangeIdioma} />
                : <ElegirIdioma ref={(r) => this.ElegirIdiomaModal = r} onSelectIdioma={this.onSelectIdioma} canCancel={false} />
        )
    }
}


//<View style={{flex:1, backgroundColor:'red'}}/>

AppRegistry.registerComponent(appName, () => Main);
