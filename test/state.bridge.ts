import { makeStorable } from 'https://deno.land/x/storable@1.1.1/mod.ts'
import { getPlugin, isMobile } from '../runtime.ts'

export class AppState {
	photoUrl = makeStorable<string | null>(null)
	name = 'Jason'

	async takeSelfie() {
		if (!isMobile()) return this.photoUrl.set('https://picsum.photos/500')

		const camera = getPlugin('@capacitor/camera')

		try {
			const image = await camera.Camera.getPhoto({
				quality: 100,
				allowEditing: true,
				resultType: camera.CameraResultType.Uri,
				source: camera.CameraSource.Camera,
				direction: camera.CameraDirection.Front,
			})

			this.photoUrl.set(image.webPath)
		} catch (error) {
			console.log(error.message)
		}
	}

	removePhoto() {
		this.photoUrl.set(null)
	}
}
