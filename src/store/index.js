import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

import auth from './store-auth'
import phrase from './store-phrase'
import repaircase from './store-repaircase'


export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      auth,
      phrase,
      repaircase
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
})
