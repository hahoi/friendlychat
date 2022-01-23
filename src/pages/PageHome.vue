<template>
  <q-page style="max-width: 600px; margin: auto">
    <template v-if="addCustomer">
      <h5 class="text-center">客戶聯絡資料</h5>
      <!-- 新增客戶 -->
      <add-customer />
    </template>
    <template v-else-if="hasCustomer">
      <div class="q-ma-md text-h6 text-center">已報修的案件</div>
      <repair-case />
    </template>
    <template v-else>
      <div class="q-ma-md text-h6">
        <q-spinner-cube size="xl" color="primary" />
        {{ errorMag }}
      </div>
    </template>
  </q-page>
</template>

<script>
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
  components: {
    AddCustomer: require("components/AddCustomer.vue").default,
    RepairCase: require("components/RepairCase.vue").default,
  },
  emits: [""],
  setup(props, context) {
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
        if (docSnap.exists()) {
          console.log("customers存在，檢查是否有報修資料");
          data.hasCustomer = true;
        } else {
          console.log("customers不存在，跳到新增畫面，新增customer");
          data.addCustomer = true;
        }
      } catch (error) {
        console.error("Firebase Database 錯誤", error);
        data.errorMag = "查不到客戶資料，請登出，重新驗證登入。";
      }
      // Loading.hide();
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
    };
  },
});
</script>
