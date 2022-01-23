<template>
  <q-page class="">
    <div class="q-pa-md">
      <div style="max-width: 600px">
        <q-tabs v-model="tab" align="justify" narrow-indicator class="q-mb-lg">
          <q-tab class="text-purple" name="Repair" label="報修" />
          <q-tab class="text-teal" name="Inquire" label="查詢" />
        </q-tabs>

        <div class="q-gutter-y-sm">
          <q-tab-panels
            v-model="tab"
            animated
            transition-prev="scale"
            transition-next="scale"
            class="text-center"
          >
            <q-tab-panel name="Repair">
              <q-stepper v-model="step" vertical color="primary" animated>
                <q-step
                  :name="1"
                  title="報修基本資料"
                  icon="settings"
                  :done="step > 1"
                >
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
                        v-model="data.mobilePhone"
                        label="手機"
                        lazy-rules
                        :rules="[(val) => !!val || '* 這個欄位必須要輸入']"
                        outlined
                        class="col text-body1"
                      />

                      <q-input
                        v-model="data.name"
                        label="姓名"
                        lazy-rules
                        :rules="[(val) => !!val || '* 這個欄位必須要輸入']"
                        outlined
                        class="text-body1"
                      />

                      <q-input
                        v-model="data.companyPhone"
                        label="公司電話"
                        outlined
                        class="text-body1"
                      />
                      <!-- @blur="checkRep" // 比對姓名是否重複輸入-->

                      <!-- :rules="[(val) => isValidEmailAddress(val) || '不合格式的 e-mail.']" -->
                      <q-input
                        v-model="data.email"
                        label="Email"
                        lazy-rules
                        outlined
                      />
                      <q-select
                        class="text-body1"
                        v-model="data.bureau"
                        :options="bureaus"
                        label="選擇局處"
                        outlined
                        ref="bureaus"
                        popup-content-class="text-h6"
                      />
                      <q-select
                        class="text-body1"
                        v-model="data.department"
                        :options="subDepartments"
                        label="選擇科室"
                        outlined
                        clearable
                        ref="department"
                        popup-content-class="text-h6"
                        v-show="subDepartments.length > 0"
                      />
                    </div>
                  </q-form>

                  <q-stepper-navigation>
                    <q-btn @click="onSubmit()" color="primary" label="下一步" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="2"
                  title="拍照-故障設備"
                  caption=""
                  icon="create_new_folder"
                  :done="step > 2"
                >
                  請將故障設備，拍照上傳

                  <q-stepper-navigation>
                    <q-btn @click="step = 3" color="primary" label="下一步" />
                    <q-btn
                      flat
                      @click="step = 1"
                      color="primary"
                      label="上一步"
                      class="q-ml-sm"
                    />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="3"
                  title="上傳檔案"
                  caption=""
                  icon="create_new_folder"
                  :done="step > 3"
                >
                  An ad group contains one or more ads which target a shared set
                  of keywords.

                  <q-stepper-navigation>
                    <q-btn @click="step = 4" color="primary" label="下一步" />
                    <q-btn
                      flat
                      @click="step = 2"
                      color="primary"
                      label="放棄重來"
                      class="q-ml-sm"
                    />
                  </q-stepper-navigation>
                </q-step>

                <q-step :name="4" title="完成報修" icon="add_comment">
                  報修完成，請等候工程師聯絡。
                  <q-stepper-navigation>
                    <q-btn color="primary" label="完成" />
                    <q-btn
                      flat
                      @click="step = 2"
                      color="primary"
                      label="繼續拍照"
                      class="q-ml-sm"
                    />
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>
            </q-tab-panel>
          </q-tab-panels>

          <q-tab-panels
            v-model="tab"
            animated
            transition-prev="jump-up"
            transition-next="jump-down"
            class="text-center"
          >
            <q-tab-panel name="Inquire">
              <div class="text-h6">Movies</div>
              Nostrum necessitatibus expedita dolores? Voluptatem repudiandae
              magni ea.
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
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

import { uid, date, Notify, extend, useQuasar } from "quasar";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirebaseConfig } from "../utils/firebase-config";

export default defineComponent({
  name: "PageRepair",
  setup() {
    //---------- Vuex ----------
    const store = useStore();
    const vuex = reactive({
      bureaus: computed(() => {
        return store.state.phrase.bureaus;
      }),
      departments: computed(() => {
        return store.state.phrase.departments;
      }),
    });
    //---------- data ----------
    const data = reactive({
      dialogTab: true,
      tab: "information",
      dialogCassify: false,
      step: 1,

      data: {
        mobilePhone: "",
        name: "",
        companyPhone: "",
        email: "",
        bureau: "",
        department: "",
      },
    });
    const $q = useQuasar();
    const formRef = ref(null);

    //=====找出已選局處的科室陣列=============
    let thisIndex = -1; //記住局處陣列索引
    let subDepartments = computed(() => {
      let index = vuex.bureaus.indexOf(data.data.bureau);
      if (thisIndex !== index) {
        // 局處選擇改變時，科室的值要隨著清空
        data.data.department = "";
      }
      thisIndex = index;
      return vuex.departments[index] || []; //科室是二維陣列，第一維索引是局處索引值
    });

    const blankData = extend(true, {}, data.data);

    function onSubmit() {
      // console.log(formRef.value.validate());
      if (data.data.name.trim() === "" || data.data.mobilePhone.trim() === "") {
        $q.dialog({
          title: "錯誤",
          message: "必填欄位不能空白",
        });
        return false;
      }

      if (formRef.value.validate()) {
        //寫入資料庫格式
        let uuid = uid();
        console.log(uuid);
        data.data.id = uuid;
        const payload = {
          id: uuid,
          data: {
            ...data.data,
          },
        };
        // 寫入資料庫
        // $q.notify("存檔中...");
        // store.dispatch("contacts/firestoreAddContacts", payload);
        // 開啟上傳圖片視窗
        // data.dialogTab = false;

        // 跳下一步
        data.step = 2;
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
      tab: ref("Repair"),
      formRef,
      subDepartments,
      onSubmit,
      onReset,
    };
  },
});
</script>
<style lang="sass">
.q-tab__label
  font-size: 1.5rem
</style>
