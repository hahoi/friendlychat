<template>
  <div class="" ref="elmRefs">
    <h5>維修記錄</h5>
    <div class="q-ma-md q-gutter-md">
      <q-input
        label="使用者"
        v-model="RepairCase.customerName"
        class="text-body1"
      />
      <div>{{ Customer.bureau }}{{ Customer.department }}</div>
      <div>連絡電話： {{ Customer.mobilePhone }}</div>

      <q-select
        class="text-body1"
        v-model="Customer.bureau"
        :options="bureausArr"
        label="選擇局處"
        outlined
        ref="bureaus"
        popup-content-class="text-h6"
      />
      <q-select
        class="text-body1"
        v-model="Customer.department"
        :options="subDepartments"
        label="選擇科室"
        outlined
        clearable
        ref="department"
        popup-content-class="text-h6"
      />

      <div>
        叫修日期：
        {{ RepairCase.CallRepairDateStr }}
      </div>

      <q-input
        label="故障類別"
        v-model="RepairCase.FailureCategory"
        class="text-body1"
      />
      <q-input
        label="更換零件"
        v-model="RepairCase.ReplacementParts"
        class="text-body1"
      />
      <q-input
        label="故障描述"
        v-model="RepairCase.FaultDescription"
        class="text-body1"
      />
      <q-input
        label="故障原因"
        v-model="RepairCase.CauseOfIssue"
        class="text-body1"
      />
      <q-input
        label="處理狀況"
        v-model="RepairCase.ProcessingStatus"
        class="text-body1"
      />
      <q-input
        label="工程師"
        v-model="RepairCase.Engineer"
        class="text-body1"
      />
      <div>處理進度</div>
      <div>完修日期</div>
      <!-- customerName: vuex.username,
        customerId: vuex.uid,
        CallRepairDate: serverTimestamp(), //叫修日期
        DateOfCompletion: serverTimestamp(), //  完修日期
        FailureCategory: "", //故障類別
        ReplacementParts: "", //更換零件
        FaultDescription: "", //故障描述
        CauseOfIssue: "", //故障原因
        ProcessingStatus: "", //處理狀況
        Engineer: "", //工程師
        timestamp: serverTimestamp(), //更新日期 -->
    </div>
    <q-btn label="客戶對話框" @click="$emit('listenEquipment', true)" />

    <q-btn label="存檔" @click="saveToDb()" />
  </div>
</template>

<script>
import agency from "src/utils/agency";
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
import { uid, date, Notify, extend } from "quasar";
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
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default defineComponent({
  name: "",
  props: {
    RepairCase: {
      type: Object,
      required: true,
    },
    Customer: {
      type: Object,
      required: true,
    },
  },
  components: {
    //UsersListItem: require('components/Users/UsersListItem.vue').default
  },
  emits: ["listenEquipment"],
  setup(props, context) {
    //---------- Vuex ----------
    const store = useStore();
    let vuex = reactive({
      uid: computed(() => {
        return store.state.auth.uid;
      }),
      phoneNumber: computed(() => {
        return store.state.auth.phoneNumber;
      }),
    });

    //---------- data ----------
    const data = reactive({
      bureausArr: [],
      departmentsObj: {},
    });
    readFirestore();

    //const a = computed(() => state.name)

    onMounted(() => {});

    //=====找出已選局處的科室陣列=============
    // let thisIndex = vuex.bureaus.indexOf(props.Customer.bureau) || -1; //記住局處陣列索引
    // let subDepartments = computed(() => {
    //   // console.log(departmentsObj[props.Customer.bureau]);

    //   let index = vuex.bureaus.indexOf(props.Customer.bureau);
    //   if (thisIndex !== index) {
    //     // 局處選擇改變時，科室的值要隨著清空
    //     props.Customer.department = "";
    //   }
    //   thisIndex = index;

    //   return vuex.departments[index] || []; //科室是二維陣列，第一維索引是局處索引值
    // });
    let oldB = props.Customer.bureau;
    let subDepartments = computed(() => {
      if (oldB !== props.Customer.bureau) {
        // 局處選擇改變時，科室的值要隨著清空
        props.Customer.department = "";
      }
      return data.departmentsObj[props.Customer.bureau] || [];
    });

    //將import的資料，寫入資料庫
    // saveToFirestore();
    async function saveToFirestore() {
      const bureaus = agency.bureau;
      const departments = agency.department;
      console.log(bureaus, departments);

      // 寫入資料庫
      let order = 0;
      for (let key in bureaus) {
        // console.log(key, bureaus[key], departments[key] || "");
        try {
          const Ref = doc(getFirestore(), "agency", bureaus[key]);
          let data = {
            order: order++,
            departments: departments[key] || "",
          };
          console.log(data);
          await setDoc(Ref, data);
        } catch (error) {
          console.error("Firestore 錯誤", error);
        }
      }
    }

    // 讀出資料
    async function readFirestore() {
      try {
        const q = query(
          collection(getFirestore(), "agency"),
          orderBy("order", "asc")
        );
        const qSnap = await getDocs(q);
        qSnap.docs.forEach((d) => {
          let dbData = d.data();
          // console.log(dbData);
          data.bureausArr.push(d.id);
          data.departmentsObj[d.id] = dbData.departments || "";
        });
        data.departments = data.departmentsObj;
      } catch (error) {
        console.error("Firestore 錯誤", error);
      }
    }

    function handleClick() {
      //state.count ++
      //// 呼叫父元件的方法
      //context.emit('listenChild', false);
    }
    async function saveToDb() {
      console.log(props.Customer);
      console.log(props.RepairCase);
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
      subDepartments,
      saveToDb,
    };
  },
});
</script>
