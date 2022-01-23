import {
  getFirestore, collection, query, getDocs, doc, getDoc, setDoc, orderBy, limit,
  deleteDoc, updateDoc, where, serverTimestamp, onSnapshot
} from "firebase/firestore";


const state = {
  repaircaseId: "",
}

const mutations = {
  setRepairCaseId (state, value) {
    state.repaircaseId = value
  },

}

const actions = {



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