import Const from '../persistente/Const'
import moment from 'moment-timezone';

var Log = (function () {
  var log = async function (dni, evento_tipo_codigo, evento_descripcion) {
    const fecha_hora_envio = moment.utc().format('YYYY-MM-DD HH:mm:ss')
    console.log("[" + fecha_hora_envio + "] Evento código " + evento_tipo_codigo + ": " + evento_descripcion)
    try {
      await fetch(Const.webURLPublica + '/log', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fecha_hora_envio: fecha_hora_envio,
          persona_dni: dni,
          evento_tipo_codigo: evento_tipo_codigo,
          evento_descripcion: evento_descripcion
        }),
      })
    } catch (error) {
    }
  }

  return {
    log: log
  }
})();

export default Log;