<template>
  <q-page style="max-width: 600px; margin: auto">
    <!-- <button id="button_1" ref="button_1" @click="send()">SEND</button> -->
    <h5 class="text-center">手機號碼驗證登錄</h5>

    <div class="row flex justify-around q-ma-md">
      <q-input
        v-model="mobilePhone"
        label="請輸入手機號碼"
        outlined
        clearable
        class="col-7 text-h6"
      />
      <q-btn
        @click="send()"
        color="cyan-6"
        label="發送簡訊"
        class="col-4 text-body1"
      />
    </div>

    <div id="recaptcha-container"></div>

    <div class="row flex justify-around q-ma-md" v-if="codeOK">
      <q-input v-model="code" label="驗證碼" outlined class="col-7 text-h6" />
      <q-btn
        @click="go()"
        color="info"
        label="驗 證"
        class="col-4 text-body1"
      />
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
import { showErrorMessage } from "src/utils/function-show-error-message";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export default defineComponent({
  name: "",
  props: {},
  components: {
    // UsersListItem: require("components/Users/UsersListItem.vue").default,
  },
  emits: [""],
  setup(props, context) {
    const $q = useQuasar();
    //---------- Vuex ----------
    const store = useStore();
    let vuex = reactive({
      // oUsers: computed(() => {
      //   // return store.state.users.oUsers;
      // }),
      // CombineUsers: computed(() => {
      //   // return store.getters["users/CombineUsers"];
      // }),
    });

    //---------- data ----------
    const data = reactive({
      code: "123456",
      codeOK: false,
      mobilePhone: "+886978637387",
    });

    // const a = computed(() => state.name);

    onMounted(() => {
      // auth.useDeviceLanguage();

      // window.recaptchaVerifier = new RecaptchaVerifier(
      //   "recaptcha-container",
      //   {},
      //   auth
      // );

      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // console.log("signInWithPhoneNumber");
            onSignInSubmit();
          },
        },
        getAuth()
      );
    });

    //用誰就觀察誰，觀察值變化，執行函數
    //watchEffect(()=>{
    //執行函數( 觀察值)
    //data.address = data.county + data.district;
    //})

    function send() {
      // const phoneNumber = "+886978637387";
      const phoneNumber = data.mobilePhone;
      const appVerifier = window.recaptchaVerifier;

      signInWithPhoneNumber(getAuth(), phoneNumber, appVerifier)
        .then((confirmationResult) => {
          console.log(confirmationResult);
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          /* 發送成功 */
          window.confirmationResult = confirmationResult;
          data.codeOK = true;
          // ...
        })
        .catch((error) => {
          /* 發送失敗 */
          showErrorMessage("發送失敗");
          console.log(error);
          /* 重置驗證 */
          grecaptcha.reset(window.recaptchaWidgetId);
        });
    }

    function go() {
      console.log(data.code);
      /* 檢查驗證碼 */
      confirmationResult
        .confirm(data.code)
        .then(async function (result) {
          /* 驗證成功 */
          var user = result.user;
          // const currentToken = await getToken(getMessaging());
          // console.log("currentToken", currentToken);
        })
        .catch(function (error) {
          /* 驗證失敗 */
          if (error.message == "TOO_MANY_ATTEMPTS_TRY_LATER") {
            showErrorMessage("發送太多次驗證碼，驗證失敗！");
          } else {
            showErrorMessage("驗證失敗");
          }
          console.log(error);
        });
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
      send,
      go,
    };
  },
});
</script>
