import { LocalStorage, Loading, extend } from 'quasar'

import { initializeApp } from 'firebase/app';
import {
	getAuth,
	onAuthStateChanged,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
} from 'firebase/auth';
import { getFirebaseConfig } from '../utils/firebase-config.js';
import {
	getMessaging,
	getToken,
	onMessage
} from 'firebase/messaging';
import {
	getFirestore,
	collection,
	addDoc,
	query,
	orderBy,
	limit,
	onSnapshot,
	setDoc,
	updateDoc,
	doc,
	getDoc,
	serverTimestamp,
} from 'firebase/firestore';


const firebaseApp = initializeApp(getFirebaseConfig());

// Saves the messaging device token to Cloud Firestore.
async function saveMessagingDeviceToken () {
	try {
		const currentToken = await getToken(getMessaging());
		console.log("currentToken", currentToken)
		if (currentToken) {
			console.log('Got FCM device token:', currentToken);
			// Saving the Device Token to Cloud Firestore.
			const tokenRef = doc(getFirestore(), 'fcmTokens', currentToken);
			await setDoc(tokenRef, { uid: getAuth().currentUser.uid });

			// This will fire when a message is received while the app is in the foreground.
			// When the app is in the background, firebase-messaging-sw.js will receive the message instead.
			onMessage(getMessaging(), (message) => {
				console.log(
					'New foreground notification from Firebase Messaging!',
					message.notification
				);
			});
		} else {
			// Need to request permissions to show notifications.
			requestNotificationsPermissions();
		}
	} catch (error) {
		console.error('Unable to get messaging token.', error);
	};
}

const state = {
	phoneNumber: "",
	uid: "",
	userName: "",
	maintain: "",
	// loggedIn: false,
}

const mutations = {
	// setLoggedIn (state, value) {
	// 	state.loggedIn = value
	// },
	setUID (state, value) {
		state.uid = value
	},
	setPhoneNumber (state, value) {
		state.phoneNumber = value
	},
	setUserName (state, value) {
		state.userName = value
	},
	setMaintain (state, value) {
		state.maintain = value
	},
}

const actions = {
	logout ({ state, commit, dispatch }) {
		// commit('setUID', null)
		signOut(getAuth())
	},


	ListenAuthStateChange ({ state, commit, dispatch }) {
		// signOut(getAuth())
		// 監聽 Listen to auth state changes.
		onAuthStateChanged(getAuth(), user => {
			// console.log(user.uid)
			if (user) {
				// console.log(JSON.stringify(user, null, '  '))
				// console.log(user.providerData)
				// console.log(user.providerData[0].providerId)
				// metadata:{
				//   createdAt: "1642142013574"
				//   creationTime: "Fri, 14 Jan 2022 06:33:33 GMT"
				//   lastLoginAt: "1642576219995"
				//   lastSignInTime: "Wed, 19 Jan 2022 07:10:19 GMT"
				// }
				// 判斷是否是工程師登入

				// 若是用電話號碼登入，將國際電話改為國內電話
				if (user.providerData[0].providerId == 'phone') {
					commit('setPhoneNumber', "0" + user.phoneNumber.slice(4, 14))
				}

				commit('setUID', user.uid)
				LocalStorage.set('loggedIn', true)
				//從這裡進到 首頁
				dispatch('getCustomerById', user.uid)


				// saveMessagingDeviceToken();				

			} else {
				console.log("使用者沒有登入")
				commit('setUID', null)
				LocalStorage.set('loggedIn', false)
				//到認證登陸頁面
				this.$router.replace('/auth').catch(err => { })
			}
		})
	},
	// ------------ 讀取 ---------------
	//#region 
	// id查詢
	async firestoreGetbyId ({ state, commit, dispatch }, docUid) {
		const docRef = doc(firestore, "MDBUsers", docUid);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
		} else {
		}
	},
	//讀出customer資料
	async getCustomerById ({ state, commit, dispatch }, docUid) {
		try {
			// console.log("docUid", docUid);
			const docRef = doc(getFirestore(), "customers", docUid);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				// 讀出customer資料，設定username
				let name = docSnap.data().name
				let maintain = docSnap.data().maintain
				commit('setUserName', name)
				commit('setMaintain', maintain)

				if (state.maintain == "engineer") {
					this.$router.replace('/engineer').catch(err => { })
				} else if (maintain == "admin") {
					this.$router.replace('/admin').catch(err => { })
				}
				else {
					this.$router.replace('/').catch(err => { })
				}
			} else {
				console.log("還沒建立使用者資料！");
				this.$router.replace('/').catch(err => { })
			}
		} catch (error) {
			console.error("Firestore 錯誤", error);
		}
	}

}

const getters = {

}

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
}