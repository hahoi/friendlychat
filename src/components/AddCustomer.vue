<template>
  <div class="q-ma-md">
    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md q-mt-md"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
      ref="formRef"
    >
      <div class="q-gutter-md">
        <q-input
          v-model="customer.name"
          label="姓名"
          lazy-rules
          :rules="[(val) => !!val || '* 這個欄位必須要輸入']"
          outlined
          class="text-body1"
        />

        <q-input
          v-model="customer.companyPhone"
          label="公司電話"
          outlined
          class="text-body1"
        />

        <!-- :rules="[(val) => isValidEmailAddress(val) || '不合格式的 e-mail.']" -->
        <q-input v-model="customer.email" label="Email" lazy-rules outlined />
        <q-select
          class="text-body1"
          v-model="customer.bureau"
          :options="bureaus"
          label="選擇局處"
          outlined
          ref="bureaus"
          popup-content-class="text-h6"
        />
        <q-select
          class="text-body1"
          v-model="customer.department"
          :options="subDepartments"
          label="選擇科室"
          outlined
          clearable
          ref="department"
          popup-content-class="text-h6"
        />
        <!-- v-show="subDepartments.length > 0" -->
        <q-btn
          @click="onSubmit()"
          color="primary"
          label="下一步"
          class="float-right"
        />
      </div>
    </q-form>
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

export default defineComponent({
  name: "",
  props: {
    //Contact: {
    //  type: Object,
    //  required: true,
    //},
  },
  components: {
    //UsersListItem: require('components/Users/UsersListItem.vue').default
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
      phoneNumber: computed(() => {
        return store.state.auth.phoneNumber;
      }),
      bureaus: computed(() => {
        return store.state.phrase.bureaus;
      }),
      departments: computed(() => {
        return store.state.phrase.departments;
      }),
    });

    //---------- data ----------
    const data = reactive({
      addCustomer: false,

      customer: {
        // id: "",
        // mobilePhone: "",
        name: "",
        companyPhone: "",
        email: "",
        bureau: "",
        department: "",
      },
    });
    const formRef = ref(null);

    onMounted(() => {});

    //=====找出已選局處的科室陣列=============
    let thisIndex = -1; //記住局處陣列索引
    let subDepartments = computed(() => {
      let index = vuex.bureaus.indexOf(data.customer.bureau);
      if (thisIndex !== index) {
        // 局處選擇改變時，科室的值要隨著清空
        data.customer.department = "";
      }
      thisIndex = index;
      return vuex.departments[index] || []; //科室是二維陣列，第一維索引是局處索引值
    });

    const blankData = extend(true, {}, data.customer);

    async function onSubmit() {
      if (data.customer.name.trim() === "") {
        $q.dialog({
          title: "錯誤",
          message: "姓名不能空白",
        });
        return false;
      }

      if (formRef.value.validate()) {
        const payload = {
          id: vuex.uid,
          mobilePhone: vuex.phoneNumber,
          ...data.customer,
          timestamp: serverTimestamp(),
        };
        console.log(payload);
        // 寫入資料庫
        $q.notify("存檔中...");
        // console.log(getAuth().currentUser.uid);
        try {
          const costomerRef = doc(getFirestore(), "customers", vuex.uid);
          await setDoc(costomerRef, payload);
          // router.push("/repair");
        } catch (error) {
          console.error("寫入資料庫失敗！", error);
        }

        // 跳下一步
        // data.step = 2;
      } else {
        console.log("輸入資料有錯誤！");
      }
    }
    function onReset() {
      data.data = extend(true, {}, blankData);
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
      formRef,
      subDepartments,
      onSubmit,
      onReset,
    };
  },
});
</script>
