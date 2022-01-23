import { Dialog, Loading } from 'quasar'

export function showErrorMessage(errorMessage,showTitle="錯誤") {
	Loading.hide()
	Dialog.create({
		title: showTitle,
		message: errorMessage
	})
}