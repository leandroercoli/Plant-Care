export const Colors = {
	accentColor: '#2e7d32'
};
export const Labels = {
	permisoCamera: 	{
		title: 'Permiso para acceder a la cámara',
		message:
			'Plant Care necesita permiso para acceder a la cámara.',
		buttonNegative: 'Ahora no',
		buttonPositive: 'OK',
	},
	permisoGaleria: 	{
		title: 'Permiso para acceder a los archivos multimedia',
		message:
			'Plant Care necesita permiso para acceder a los archivos multimedia de tu dispositivo.',
		buttonNegative: 'Ahora no',
		buttonPositive: 'OK',
	},
	permisosAlerta : {
		titulo: 'Error al elegir una foto',
		descripcion: 'Plant Care necesita permisos para acceder a la cámara y a la galería de fotos para elegir una foto para tu planta.'
	},
	optionsImagePicker : {
		title: 'Elija una foto para la nueva planta',
		takePhotoButtonTitle: 'Tomar una foto',
		chooseFromLibraryButtonTitle: 'Elegir foto desde el teléfono ...',
		customButtons: [],
		storageOptions: {
			skipBackup: true,
			path: 'images',
		},
	}
}
export const Img = {
	logo: require("./img/logo-leaf.png"),	
	bigLeaf: require("./img/logo-leaf-front.png"),
	smallLeaf: require("./img/logo-leaf-back.png")
}
export const plantasDebug = [
	{ name: 'Monstera', image: require("./img/plantas/monstera.jpg"), diasRiego: [3, 4, 5], diasAlimento: [0, 3, 5], hora: 10, minutos: 15, alarma: true, alarmasID: [], vasosAgua: '2', vasosAlimento: '1' },
	{ name: 'Aloe Vera', image: require("./img/plantas/aloe-vera.jpg"), diasRiego: [2, 5], diasAlimento: [1, 3, 4], hora: 12, minutos: 45, alarma: false, alarmasID: [], vasosAgua: '1.5', vasosAlimento: '1.5' },
	{ name: 'Philodendron', image: require("./img/plantas/philodendron.jpg"), diasRiego: [1, 5, 6], diasAlimento: [4, 5], hora: 15, minutos: 25, alarma: true, alarmasID: [], vasosAgua: '4', vasosAlimento: '2' },
	{ name: null }
]