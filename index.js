import React, { Component } from 'react';
import { name as appName } from './app.json';
import { AppRegistry, Text, View } from 'react-native';
import { Spinner } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';

import App from './src/App';
import Loading from './src/Loading';
import ElegirIdioma from './src/ElegirIdioma';
import { Labels, Colors, Img } from './src/Const'

class Main extends Component {
    constructor(props) {
        super(props);
        this.ElegirIdiomaModal = React.createRef()
        this.state = {
            isLoading: true,
            idioma: null,
            temaOscuro: false
        }
    }

    componentDidMount = async () => {
        const idioma = await AsyncStorage.getItem('Idioma');
        const temaOscuro = await AsyncStorage.getItem('temaOscuro');
        if (idioma == null) {
            if (this.ElegirIdiomaModal) this.ElegirIdiomaModal.show()
        } else {
            this.setState({ idioma: idioma, temaOscuro: temaOscuro !== null ? JSON.parse(temaOscuro) : false  })
        }
    }

    onAnimationDone = () => {
        this.setState({ isLoading: false })
    }

    onSelectIdioma = (idioma) => { // esto se llama desde el componente ElegirIdioma de aca
        this.setState({ idioma: idioma }, () => {
            if (this.ElegirIdiomaModal) this.ElegirIdiomaModal.hide()
        })
    }

    onChangeIdioma = (idioma) => { // esto se llama desde el componente de configuracion adentro de App
        this.setState({ idioma: idioma })
    }

    onTemaOscuroToggle = () => {
        const { temaOscuro } = this.state
        this.setState({ temaOscuro: !temaOscuro }, () => {
            AsyncStorage.setItem('temaOscuro', JSON.stringify(!temaOscuro));
        })
    }


    render() {
        const { idioma, temaOscuro, isLoading } = this.state
        return (
            <View style={{ flex: 1 }}>
                {isLoading || !idioma ? <Loading onAnimationDone={this.onAnimationDone} />
                    : <App idioma={idioma} colores={temaOscuro ? Colors.darkTheme : Colors.lightTheme } temaOscuro={temaOscuro} onSelectIdioma={this.onChangeIdioma} onTemaOscuroToggle={this.onTemaOscuroToggle} />}
                <ElegirIdioma ref={(r) => this.ElegirIdiomaModal = r} onSelectIdioma={this.onSelectIdioma} canCancel={false} />
            </View>

        )
    }
}


//<View style={{flex:1, backgroundColor:'red'}}/>

AppRegistry.registerComponent(appName, () => Main);
