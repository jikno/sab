import { isMobile, getPlugin } from '../runtime.ts'

export async function takeSelfie() {
	if (!isMobile()) return 'https://picsum.photos/500'

	const camera = getPlugin('@capacitor/camera')

	const image = await camera.Camera.getPhoto({
		quality: 100,
		allowEditing: true,
		resultType: camera.CameraResultType.Uri,
		source: camera.CameraSource.Camera,
		direction: camera.CameraDirection.Front,
	})

	return image.webPath
}
