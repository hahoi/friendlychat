<template>
  <div style="max-width: 600px; margin: auto">
    <!-- 列出所有未結案件，點擊，設備維修紀錄 -->
    <template v-if="ListRepairCasePage">
      <div class="q-ma-md">
        <!-- List選項 -->
        <q-list bordered separator>
          <div v-for="item in RepairCases">
            <q-item clickable v-ripple @click="gotoEquipmentPage(item)">
              <q-item-section>
                <q-item-label
                  >報修日期：{{ item.CallRepairDateStr }}</q-item-label
                >
                <q-item-label>報修人：{{ item.customerName }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon color="primary" name="forward"
              /></q-item-section>
            </q-item>
            <q-separator />
          </div>
        </q-list>
      </div>
    </template>
    <!-- 設備報修資料畫面，按鈕，顯示客戶對話框 -->
    <template v-if="EquipmentPage">
      <q-card flat class="">
        <q-bar class="bg-white q-mt-md">
          <q-btn
            round
            icon="reply"
            class="bg-grey-8 text-white text-h6 fixed z-top"
            @click="
              EquipmentPage = false;
              ListRepairCasePage = true;
            "
            transparent
          >
          </q-btn>
        </q-bar>
        <q-card-section>
          <equipment
            :RepairCase="RepairCase"
            :Customer="Customer"
            @listenEquipment="listenEquipment"
          ></equipment>
        </q-card-section>
      </q-card>
    </template>
    <!-- 顯示客戶對話框 -->
    <template v-if="MessagePage">
      <q-card flat class="">
        <q-bar class="bg-white q-mt-md">
          <q-btn
            round
            icon="reply"
            class="bg-grey-8 text-white text-h6 fixed z-top"
            @click="
              EquipmentPage = true;
              MessagePage = false;
            "
          >
          </q-btn>
        </q-bar>
        <q-card-section>
          <message-chat @listenMessageChat="listenMessageChat"></message-chat>
        </q-card-section>
      </q-card>
    </template>
  </div>
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
  name: "engineer",
  props: {},
  components: {
    Equipment: require("components/Equipment.vue").default,
    MessageChat: require("components/MessageChat.vue").default,
  },
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
      ListRepairCasePage: true,
      EquipmentPage: false,
      MessagePage: false,
      RepairCases: [],
      RepairCase: {},
      Customer: {},
      repairId: "",
    });

    //用誰就觀察誰，觀察值變化
    watchEffect(() => {});

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

        //列出歷史報修List選項，
        // 選擇 跳到 message 畫面
        // 後續要完成，結案後，可新增報修案件
        // }
      } catch (error) {
        console.error("Firebase Database 錯誤", error);
      }
    }
    async function gotoEquipmentPage(item) {
      // 保存報修案件DocID，供PageMessage使用

      // const blankData = extend(true, {}, item);
      // console.log(item);
      store.commit("repaircase/setRepairCaseId", item.id);
      // store.commit("repaircase/setRepairCase", item);

      // 讀取使用者資料
      try {
        const docRef = doc(getFirestore(), "customers", item.customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          data.Customer = docSnap.data();
        } else {
          console.log("找不到使用者");
        }
      } catch (error) {
        console.error("Firestore 錯誤", error);
      }

      data.RepairCase = item;
      data.ListRepairCasePage = false;
      data.EquipmentPage = true;
    }

    function gotoMessagePage(cid) {
      // 保存報修案件DocID，供PageMessage使用
      store.commit("repaircase/setRepairCaseId", cid);
      // router.push("/message");
    }
    function listenEquipment(val) {
      console.log(val);
      data.EquipmentPage = false;
      data.MessagePage = true;
    }
    function listenMessageChat(val) {
      console.log(val);
      data.EquipmentPage = true;
      data.MessagePage = false;
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
      gotoEquipmentPage,
      gotoMessagePage,
      listenEquipment,
      listenMessageChat,
    };
  },
});
</script>
