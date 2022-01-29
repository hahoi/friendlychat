<template>
  <div class="q-ma-md">
    <!-- List選項 -->
    <q-list bordered separator>
      <template v-for="item in RepairCases">
        <q-item clickable v-ripple @click="gotoPageMessage(item.id)">
          <q-item-section>
            <q-item-label>報修日期：{{ item.CallRepairDateStr }}</q-item-label>
            <!-- <q-item-label caption>{{ item.timestamp.toMillis() }}</q-item-label> -->
            <q-item-label caption>{{ item.dateStr }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
    <!-- 新增報修案件 -->
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
import { uid, date, Notify, extend, useQuasar } from "quasar";
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

export default defineComponent({
  name: "RepairCase",

  setup(props, context) {
    const router = useRouter();
    const $q = useQuasar();
    //---------- Vuex ----------
    const store = useStore();
    let vuex = reactive({
      uid: computed(() => {
        return store.state.auth.uid;
      }),
      username: computed(() => {
        return store.state.auth.userName;
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

    onMounted(() => {
      if (vuex.uid) {
        // reload時，要確定vuex資料以正確讀入
        if_repairCase();
      }
    });

    //檢查是否有 報修案件 repairCase 資料
    async function if_repairCase() {
      if (vuex.maintain == "engineer") {
        router.push("/engineer");
        return;
      }
      try {
        const q = query(
          collection(getFirestore(), "repairCases"),
          where("customerId", "==", vuex.uid)
        );
        const querySnapshot = await getDocs(q);
        //此使用者沒有報修案件
        console.log("報修案件", !querySnapshot.empty);
        if (querySnapshot.empty) {
          // 新增報修案件
          await addRepairCase();

          //跳到首頁重新讀取資料，會讀到有報修案件
          router.push("/");
        } else {
          //有報修案件
          const arr = [];
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            data.RepairCases = [doc.data()];
            arr.push({
              id: doc.id,
              ...doc.data(),
              CallRepairDateStr: date.formatDate(
                doc.data().timestamp.toDate(),
                "YYYY-MM-DD"
              ),
            });
          });
          data.RepairCases = arr;
          //列出歷史報修List選項，
          // 選擇 跳到 message 畫面
          // 後續要完成，結案後，可新增報修案件
        }
      } catch (error) {
        console.error("Firebase Database 錯誤", error);
      }
    }
    //新增報修案件，新增message對話訊息
    async function addRepairCase() {
      $q.notify("存檔中...");
      const payload = {
        customerName: vuex.username,
        customerId: vuex.uid,
        CallRepairDate: serverTimestamp(), //叫修日期
        DateOfCompletion: serverTimestamp(), //  完修日期
        FailureCategory: "", //故障類別
        ReplacementParts: "", //更換零件
        FaultDescription: "", //故障描述
        CauseOfIssue: "", //故障原因
        ProcessingStatus: "", //處理狀況
        Engineer: "", //工程師
        timestamp: serverTimestamp(), //更新日期
      };
      // console.log("payload", payload);
      try {
        const collectionRef = collection(getFirestore(), "repairCases");
        const docRef = await addDoc(collectionRef, payload);

        //新增對話起始資料message，寫入資料庫
        //讀取多層的collection
        const subCollectionRef = collection(
          getFirestore(),
          "repairCases",
          docRef.id,
          "messages"
        );

        // 先插入一筆資料，工程師問候及提醒
        await addDoc(subCollectionRef, {
          label: date.formatDate(Date.now(), "YYYY年MM月DD日 HH:mm"),
          name: "工程師",
          text: ["嗨，您好", "請將設備問題描述或是拍照"],
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("寫入資料庫失敗！", error);
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
