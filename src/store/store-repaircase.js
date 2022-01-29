import {
  getFirestore, collection, query, getDocs, doc, getDoc, setDoc, orderBy, limit,
  deleteDoc, updateDoc, where, serverTimestamp, onSnapshot
} from "firebase/firestore";


const state = {
  repaircaseId: "",
  RepairCase: {},
}

const mutations = {
  setRepairCaseId (state, value) {
    state.repaircaseId = value
  },
  setRepairCase (state, value) {
    state.RepairCase = value
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