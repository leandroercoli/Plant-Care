export const Colors = {
	accentColor: '#2e7d32',
	darkTheme: {
		statusBarColor: 'rgb(0,0,0)',
		headerTitle: '#fff',
		listViewHeaderBackground: '#2b2b2b',
		listViewBackground: '#414141',
		newPlantBigIcon: '#fff',
		icons: '#fff',
		text: '#fff',
		placeholderText:'#f1f1f1',
		defaultBackground: "#2b2b2b",
		configuracion: {
			headerBackground: '#2b2b2b',
			background: '#414141',
			itemBackground:'#2b2b2b'
		},
		nuevaPlanta: {
			headerBackground: '#2b2b2b',
			background: '#414141',
		},
	},
	lightTheme: {
		statusBarColor: 'rgb(0,0,0)',
		headerTitle: '#2b2b2b',
		listViewHeaderBackground: '#fff',
		listViewBackground: '#f1f1f1',
		newPlantBigIcon: '#2e7d32',
		icons: '#2b2b2b',
		text: '#2b2b2b',
		placeholderText:'#616161',
		defaultBackground: "#fff",
		configuracion: {
			headerBackground: '#fff',
			background: '#f1f1f1',
			itemBackground:'#fff'
		},
		nuevaPlanta: {
			headerBackground: '#fff',
			background: '#f1f1f1',
		},
	}
};
export const Img = {
	logo: require("./img/logo-leaf.png"),
	bigLeaf: require("./img/logo-leaf-front.png"),
	smallLeaf: require("./img/logo-leaf-back.png"),
	fullLogo: require("./img/logo-full.png")
}
export const plantasDebug = [
	{ name: 'Monstera', image: require("./img/plantas/monstera.jpg"), diasRiego: [3, 4, 5], diasAlimento: [0, 3, 5], hora: 10, minutos: 15, alarma: true, alarmasID: [], vasosAgua: '2', vasosAlimento: '1' },
	{ name: 'Aloe Vera', image: require("./img/plantas/aloe-vera.jpg"), diasRiego: [2, 5], diasAlimento: [1, 3, 4], hora: 12, minutos: 45, alarma: false, alarmasID: [], vasosAgua: '1.5', vasosAlimento: '1.5' },
	{ name: 'Philodendron', image: require("./img/plantas/philodendron.jpg"), diasRiego: [1, 5, 6], diasAlimento: [4, 5], hora: 15, minutos: 25, alarma: true, alarmasID: [], vasosAgua: '4', vasosAlimento: '2' },
	{ name: null }
]
export const Labels = {
	'es': {
		test: 'espaniol',
		configuracion: {
			title: 'Configuración',
			lblLimpiar: 'Limpiar',
			lblIdioma: 'Idioma',
			lblTemaOscuro: 'Modo noche',
			lblTemaClaro: 'Modo día',
			lblVersion: 'Versión',
			alertLimpiar: {
				title: 'Eliminar todo',
				descripcion: '¿Está seguro que desea eliminar todas las plantas? Esta operación no se puede revertir',
				btnCancelar: 'Cancelar',
				btnOk: 'Sí'
			}
		},
		nuevaPlanta: {
			title: 'Nueva planta',
			btnSiguiente: 'Siguiente',
			btnVolver: 'Volver',
			btnListo: 'Listo',
			lblPlaceholderNombre: 'Nombre',
			lblHoraAlarma: 'Hora de alarma',
			lblNotificaciones: 'Notificaciones',
			lblVasosAgua: 'Vasos de agua',
			lblVasosFertilizante: 'Vasos de fertilizante',
		},
		onSubmitPlantaSinDias: {
			title: '¿Olvidaste algo?',
			descripcion: 'Parece que no agendaste ningún día de cuidado para ',
			btnCancelar: 'Volver',
			btnOk: 'Agendar después'
		},
		editarPlanta: {
			lblPlaceholderNombre: 'Nombre',
			lblHoraAlarma: 'Hora de alarma',
			lblNotificaciones: 'Notificaciones',
			lblVasosAgua: 'Vasos de agua',
			lblVasosFertilizante: 'Vasos de fertilizante',
			lblEliminarFoto: "Eliminar foto"
		},
		editarPlantaDoneAlert: {
			title: 'Editar planta',
			descripcion: '¿Está seguro que desea aplicar los cambios?',
			btnCancelar: 'Cancelar',
			btnOk: 'Sí'
		},
		editarPlantaEliminarFotoAlert:{
			title: 'Eliminar foto',
			descripcion:'¿Está seguro que desea eliminar la foto de su planta?',
			btnCancelar: 'Cancelar',
			btnOk: 'Sí'
		},
		eliminarPlantaAlert: {
			title: 'Eliminar planta',
			descripcion: '¿Está seguro que desea eliminar la planta de su colección?',
			btnCancelar: 'Cancelar',
			btnOk: 'Sí'
		},
		eliminarFotoAlert: {
			title: 'Eliminar foto',
			descripcion: '¿Está seguro que desea eliminar esta foto?',
			btnCancelar: 'Cancelar',
			btnOk: 'Sí'
		},
		dias: ["D", "L", "M", "M", "J", "V", "S"],
		permisoCamera: {
			title: 'Permiso para acceder a la cámara',
			message:
				'Plant Care necesita permiso para acceder a la cámara.',
			buttonNegative: 'Ahora no',
			buttonPositive: 'OK',
		},
		permisoGaleria: {
			title: 'Permiso para acceder a los archivos multimedia',
			message:
				'Plant Care necesita permiso para acceder a los archivos multimedia de tu dispositivo.',
			buttonNegative: 'Ahora no',
			buttonPositive: 'OK',
		},
		permisosAlerta: {
			titulo: 'Error al elegir una foto',
			descripcion: 'Plant Care necesita permisos para acceder a la cámara y a la galería de fotos para elegir una foto para tu planta.'
		},
		optionsImagePicker: {
			title: 'Subir una foto',
			takePhotoButtonTitle: 'Desde la cámara...',
			chooseFromLibraryButtonTitle: 'Desde el teléfono...',
			customButtons: [],
			storageOptions: {
				skipBackup: true,
				path: 'images',
			},
		}
	},
	'en': {
		test: 'english',
		configuracion: {
			title: 'Settings',
			lblLimpiar: 'Reset',
			lblIdioma: 'Language',
			lblTemaOscuro: 'Night mode',
			lblTemaClaro: 'Day mode',
			lblVersion: 'Version',
			alertLimpiar: {
				title: 'Reset',
				descripcion: 'Are you sure you want to delete every plant? This action cannot be reversed.',
				btnCancelar: 'Cancel',
				btnOk: 'Yes'
			}
		},
		nuevaPlanta: {
			title: 'New plant',
			btnSiguiente: 'Next',
			btnVolver: 'Back',
			btnListo: 'Done',
			lblPlaceholderNombre: 'Name',
			lblHoraAlarma: 'Alarm',
			lblNotificaciones: 'Notifications',
			lblVasosAgua: 'Water cups',
			lblVasosFertilizante: 'Fertilizer cups',
		},
		onSubmitPlantaSinDias: {
			title: 'Forgetting something?',
			descripcion: 'It looks like you haven\'t scheduled any care days for ',
			btnCancelar: 'Go back',
			btnOk: 'Do it later'
		},
		editarPlanta: {
			lblPlaceholderNombre: 'Name',
			lblHoraAlarma: 'Alarm',
			lblNotificaciones: 'Notifications',
			lblVasosAgua: 'Water cups',
			lblVasosFertilizante: 'Fertilizer cups',
			lblEliminarFoto: "Delete photo"
		},
		editarPlantaEliminarFotoAlert:{
			title: 'Delete photo',
			descripcion: 'Are you sure you want to delete your plant\'s foto?',
			btnCancelar: 'Cancel',
			btnOk: 'Yes'
		},
		eliminarPlantaAlert: {
			title: 'Delete plant',
			descripcion: 'Are you sure you want to delete the plant from your collection?',
			btnCancelar: 'Cancel',
			btnOk: 'Yes'
		},
		eliminarFotoAlert: {
			title: 'Delete picture',
			descripcion: 'Are you sure you want to delete this picture?',
			btnCancelar: 'Cancel',
			btnOk: 'Yes'
		},
		dias: ["S", "M", "T", "W", "T", "F", "S"],
		editarPlantaDoneAlert: {
			title: 'Edit plant',
			descripcion: 'Are you sure you want to apply the changes?',
			btnCancelar: 'Cancel',
			btnOk: 'Yes'
		},
		permisoCamera: {
			title: 'Plant Care camera permission',
			message:
				'Plant Care needs access to your camera so you can take awesome pictures.',
			buttonNegative: 'Ask me later',
			buttonPositive: 'OK',
		},
		permisoGaleria: {
			title: 'Plant Care file access permission',
			message:
				'Plant Care needs access to your multimedia files so you can choose a great picture for your plant.',
			buttonNegative: 'Ask me later',
			buttonPositive: 'OK',
		},
		permisosAlerta: {
			titulo: 'Error uploading a photo',
			descripcion: 'Plant Care needs access to the camera and your multimedia files so you can choose a great picture for your plant.'
		},
		optionsImagePicker: {
			title: 'Upload a photo',
			takePhotoButtonTitle: 'From camera...',
			chooseFromLibraryButtonTitle: 'From files...',
			customButtons: [],
			storageOptions: {
				skipBackup: true,
				path: 'images',
			},
		}
	}
}