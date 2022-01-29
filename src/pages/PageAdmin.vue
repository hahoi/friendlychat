<template>
  <q-page style="max-width: 600px; margin: auto">
    <div class="q-ma-md">
      <!-- List選項 -->
      <q-list bordered separator>
        <template v-for="item in RepairCases">
          <q-item clickable v-ripple @click="gotoPageMessage(item.id)">
            <q-item-section>
              <q-item-label
                >報修日期：{{ item.CallRepairDateStr }}</q-item-label
              >
              <!-- <q-item-label caption>{{ item.timestamp.toMillis() }}</q-item-label> -->
              <q-item-label>報修人：{{ item.customerName }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
      <!-- 新增報修案件 -->
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
  getDocs,
  query,
  where,
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
      maintain: computed(() => {
        return store.state.auth.maintain;
      }),
    });

    //---------- data ----------
    const data = reactive({
      RepairCases: [],
      repairId: "",
    });

    //用誰就觀察誰，觀察值變化
    watchEffect(() => {
      console.log("vuex.uid", vuex.uid);
      //reload時，vuex.uid會延遲取不到值，等watch變化時，再呼叫
      if (vuex.uid) {
        // read_customer(vuex.uid);
      }
    });

    onMounted(() => {
      get_repairCase();
    });

    //檢查是否有 報修案件 repairCase 資料
    async function get_repairCase() {
      // Loading.show();
      try {
        const q = query(
          collection(getFirestore(), "repairCases"),
          orderBy("timestamp", "asc")
        );
        const qSnap = await getDocs(q);

        //有報修案件
        data.RepairCases = qSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          CallRepairDateStr: date.formatDate(
            d.data().timestamp.toDate(),
            "YYYY-MM-DD"
          ),
        }));

        // const arr = [];
        // querySnapshot.forEach((doc) => {
        //   // doc.data() is never undefined for query doc snapshots
        //   // console.log(doc.id, " => ", doc.data());
        //   data.RepairCases = [doc.data()];
        //   arr.push({
        //     id: doc.id,
        //     ...doc.data(),
        //     CallRepairDateStr: date.formatDate(
        //       doc.data().timestamp.toDate(),
        //       "YYYY-MM-DD"
        //     ),
        //   });
        // });
        // data.RepairCases = arr;
        //列出歷史報修List選項，
        // 選擇 跳到 message 畫面
        // 後續要完成，結案後，可新增報修案件
        // }
      } catch (error) {
        console.error("Firebase Database 錯誤", error);
      }
    }

    function gotoPageMessage(cid) {
      // 保存報修案件DocID，供PageMessage使用
      store.commit("repaircase/setRepairCaseId", cid);
      router.push("/message");
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
      gotoPageMessage,
    };
  },
});
</script>
