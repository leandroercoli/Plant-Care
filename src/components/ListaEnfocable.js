import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { View, Button, Icon, Fab, Text, Card, CardItem, Spinner } from 'native-base';

/* Scrollview con enfoque en un item, que puede ir cambiando con la función siguiente() 
los items tienen que tener un campo id, que empiece en 0  */
export default class ListaEnfocable extends React.Component {
  constructor(props) {
    super(props);

    this.lista = React.createRef(); //referencia al scrollview
    this.itemRefs = []; //referencia a los items de la lista

    this.state = {
      items: this.props.items,
      indexEnfocado: this.props.items.index
    };
  }

  getMensajeBoton() {
    return (this.props.items.index > -1) ? this.props.items[this.props.items.index].mensajeBoton : '';
  }

  componentDidMount() {
    this.scrollLista()
  }

  scrollLista() {
    setTimeout(() => {
      this.lista.current.scrollTo({ y: this.props.items.index * 100 })
    }, 1)
  }

  componentWillReceiveProps(props) {
    const { items } = this.props;
    if (props.items.index != items.index) {
      console.log("LISTA ENFOCABLE componentWillReceiveProps", props)
      this.setState({
        items: props.items,
        indexEnfocado: props.items.index
      }, this.scrollLista())
    }
  }

  render() {
    return (
      <View key={'lista'}>
        {
          (this.props.refreshing) ?
            <Spinner color='rgb(179,15,59)' style={{ position: 'absolute', bottom: 0, right: 5 }} />
            : null
        }
        <ScrollView ref={this.lista} style={{ marginBottom: 5 }}>
          {
            (this.state.items) ?
              this.state.items.recorrido.map((item) =>
                <ListaItem
                  item={item}
                  key={item.id}
                  ref={(c) => { this.itemRefs[item.id] = c }}
                  activo={(this.state.items.index == item.id) ? true : false}
                  completo={(this.state.items.index > item.id) ? true : false}></ListaItem>
              ) : null
          }
        </ScrollView>
      </View>
    );
  }
}

class ListaItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const item = this.props.item;
    if (this.props.activo) {
      return (
        <View style={[styles.listaTRealItemActivado, { flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
          <View style={{ flex: 0.15, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <Icon
              type="EvilIcons"
              name="chevron-right"
              style={{ color: '#2b2b2b' }}
            />
          </View>
          <View style={[styles.listaTRealItem, styles.listaTRealItemActivado]}>
            <TouchableOpacity onPress={() => Alert.alert(
              item.itemTitulo,
              item.itemPasajero + '\n' + item.itemDomicilio,
              [
                { text: 'Ok', onPress: () => null }
              ],
              { cancelable: true })}>
              <Text style={styles.listaTRealItemTitulo}>{item.itemTitulo}</Text>
              <Text style={styles.listaTRealItemPasajero}>{item.itemPasajero}</Text>
              <Text style={styles.listaTRealItemDireccion}>{item.itemDomicilio.substring(0, 20) + ((item.itemDomicilio.length > 20) ? ' ...' : '')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else
      if (this.props.completo) {
        return (
          <View style={[styles.listaTRealItemCompleto, { flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
            <View style={{ flex: 0.15, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              <Icon
                type="EvilIcons"
                name="check"
                style={{ color: '#2b2b2b' }}
              />
            </View>
            <View style={[styles.listaTRealItem, styles.listaTRealItemCompleto]}>
              <Text style={styles.listaTRealItemTitulo}>{item.itemTitulo}</Text>
              <Text style={styles.listaTRealItemPasajero}>{item.itemPasajero}</Text>
              <Text style={styles.listaTRealItemDireccion}>{item.itemDomicilio.substring(0, 20) + ((item.itemDomicilio.length > 20) ? ' ...' : '')}</Text>
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.listaTRealItem}>
            <Text style={styles.listaTRealItemTitulo}>{item.itemTitulo}</Text>
            <Text style={styles.listaTRealItemPasajero}>{item.itemPasajero}</Text>
            <Text style={styles.listaTRealItemDireccion}>{item.itemDomicilio.substring(0, 20) + ((item.itemDomicilio.length > 20) ? ' ...' : '')}</Text>
          </View>
        );
      }

  }
}



const styles = StyleSheet.create({
  listaTRealItem: {
    flex: 1,
    height: 100,
    flexDirection: 'column',
    justifyContent: 'center',
    opacity: 1
  },
  listaTRealItemActivado: {
    opacity: 1
  },
  listaTRealItemCompleto: {
    opacity: 0.3
  },
  listaTRealItemTitulo: {
    fontFamily: "OpenSans-Light",
    fontSize: 18,
    color: '#2b2b2b'
  },
  listaTRealItemPasajero: {
    fontFamily: "OpenSans-Light",
    fontSize: 16,
    color: '#2b2b2b'
  },
  listaTRealItemDireccion: {
    fontFamily: "OpenSans-Light",
    fontSize: 16,
    color: '#616161'
  },
  separadorListaTRealItem: {
    height: 2,
    width: '100%',
    backgroundColor: '#f5f5f5',
    marginTop: 10,
    marginBottom: 10,
  },
});
