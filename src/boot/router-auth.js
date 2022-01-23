import { LocalStorage } from 'quasar'

export default ({ router }) => {
	router.beforeEach((to, from, next) => {
		let loggedIn = LocalStorage.getItem('loggedIn')
		//未登入，且路徑不是停留在auth，則跳到auth。 加此條件避免重複迴圈  
		if (!loggedIn && to.path !== '/auth') {
			next('/auth')
		}
		else {
			next()
		}
	})
}