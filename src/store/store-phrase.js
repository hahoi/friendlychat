import {
    getFirestore, collection, query, getDocs, doc, getDoc, setDoc, orderBy, limit,
    deleteDoc, updateDoc, where, serverTimestamp, onSnapshot
} from "firebase/firestore";
import agency from 'src/utils/agency'


const state = {
    Cassify: [],
    bureaus: agency.bureau,
    departments: agency.department,
}

const mutations = {
    setCassify (state, payload) {
        state.Cassify = [...payload]
    },
    // setbureaus (state, payload) {
    //     state.bureaus = [...payload]
    // },
    // setdepartments (state, payload) {
    //     state.departments = [...payload]
    // },

}

const actions = {
    //更新
    async UpdateCassify ({ commit }, payload) {
        // console.log(payload)
        let data = {
            "分類": payload
        }
        commit('setCassify', payload)
        const dbRef = doc(firestore, "SettingData", "分類");
        await updateDoc(dbRef, data);
    },

    async ReadCassify ({ commit }) {
        const docRef = doc(firestore, "SettingData", "分類");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // console.log(docSnap.data().分類)
            commit('setCassify', docSnap.data().分類)
        } else {
            // console.log(err.message)
        }
    },


}

const getters = {

    rows: (state, getters, rootState) => {
        //將陣列資料轉成物件資料
        return state.Cassify.map((item, index) => {
            return { index: index, name: item, handle: "" };
        })

    },


}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}