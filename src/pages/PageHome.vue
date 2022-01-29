<template>
  <q-page style="max-width: 600px; margin: auto">
    <div class="q-ma-md text-h6 flex justify-center">
      <q-spinner-cube size="xl" color="primary" />
    </div>
  </q-page>
</template>

<script>
import { useRouter } from "vue-router";

import {
  defineComponent,
  onMounted,
  computed,
  reactive,
  ref,
  toRefs,
  watchEffect,
} from "vue";
import { useStore } from "vuex";
import { uid, date, Notify, extend, Loading, useQuasar } from "quasar";
import { showErrorMessage } from "src/utils/function-show-error-message";

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
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default defineComponent({
  name: "",
  props: {},
  components: {},
  emits: [""],
  setup(props, context) {
    const router = useRouter();
    const $q = useQuasar();
    //---------- Vuex ----------
    const store = useStore();
    let vuex = reactive({
      uid: computed(() => {
        return store.state.auth.uid;
      }),
    });

    //---------- data ----------
    const data = reactive({
      addCustomer: false,
      hasCustomer: false,
      errorMag: "",
    });

    //用誰就觀察誰，觀察值變化
    watchEffect(() => {
      console.log("vuex.uid", vuex.uid);
      //reload時，vuex.uid會延遲取不到值，等watch變化時，再呼叫
      if (vuex.uid) {
        read_customer(vuex.uid);
      }
    });

    onMounted(() => {});

    //檢查是否有customer資料
    async function read_customer(uid) {
      // Loading.show();
      try {
        const docRef = doc(getFirestore(), "customers", uid);
        const docSnap = await getDoc(docRef);
        // customers存在
        if (docSnap.exists()) {
          // console.log("檢查是否有報修資料");
          router.push("/repair");
        } else {
          //customers不存在，
          // console.log("跳到新增畫面，新增customer");
          router.push("/customer");
        }
      } catch (error) {}
      // Loading.hide();
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
    };
  },
});
</script>
