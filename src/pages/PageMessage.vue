<template>
  <!-- <div class="q-pa-md row justify-center">
    <div
      style="width: 100%; max-width: 400px; height: calc(100% - 100px)"
      class="relative-position"
    > -->

  <q-page class="" style="width: 100%; max-width: 400px; margin: 0 auto">
    <q-card flat>
      <q-card-section style="padding-bottom: 100px">
        <template v-for="item in chats">
          <template v-if="item.text">
            <div class="text-h6">
              <q-chat-message
                :label="item.label"
                :name="item.name"
                :text="item.text"
                :stamp="item.stamp"
                :sent="item.sent"
              />
            </div>
          </template>
          <template v-else>
            <div>
              <q-chat-message
                :label="item.label"
                :name="item.name"
                :text="item.text"
                :stamp="item.stamp"
                :sent="item.sent"
              />
            </div>
          </template>
        </template>

        <!-- <q-chat-message label="Sunday, 19th" />

        <q-chat-message
          label=""
          name="工程師"
          :text="['嗨，您好', '請將設備問題描述或是拍照']"
          sent=""
        />

        <q-chat-message name="工程師">
          <div>嗨，您好</div>
          <div>請將設備問題描述或是拍照</div>
        </q-chat-message>

        <q-chat-message
          label="Sunday, 19th"
          name="我"
          :text="['無法開機']"
          sent="sent"
        />

        <q-chat-message name="我" bg-color="white" sent>
          <div>
            <img
              src="https://cdn.quasar.dev/img/discord-qeart.png"
              class="my-emoji"
            />
          </div>
        </q-chat-message>

        <q-chat-message name="我" bg-color="amber" sent>
          <div>無法開機</div>
        </q-chat-message>

        <form id="message-form" action="#">
          <div
            class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"
          >
            <input
              class="mdl-textfield__input"
              type="text"
              id="message"
              autocomplete="off"
            />
            <label class="mdl-textfield__label" for="message">Message...</label>
          </div>
          <button
            id="submit"
            disabled
            type="submit"
            class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
          >
            Send
          </button>
        </form>
        <form id="image-form" action="#">
          <input
            id="mediaCapture"
            type="file"
            accept="image/*"
            capture="camera"
          />
          <button
            id="submitImage"
            title="Add an image"
            class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color--amber-400 mdl-color-text--white"
          >
            <i class="material-icons">image</i>
          </button>
        </form>

        <template>
          <q-input filled v-model="message" label="dfadfas" />
        </template> -->
        <div ref="cardBottomRef"></div>
      </q-card-section>
    </q-card>
    <q-page-sticky expand position="bottom" class="z-top bg-white">
      <!-- <div class="absolute-bottom"> -->
      <div class="row">
        <q-input
          outlined
          v-model="message"
          label="訊息..."
          class="text-h6"
          clearable
          style="width: 220px"
        />
        <div style="width: 80px">
          <q-btn
            push
            color="cyan-6"
            label="送出"
            class="text-white text-h6"
            :disable="!message"
            @click="sendMessage"
          />
        </div>
        <q-icon
          name="photo_camera"
          class="col-1 text-teal"
          style="font-size: 4.4em; width: 50px"
        />
      </div>
      <!-- </div> -->
    </q-page-sticky>
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
import { uid, date, Notify, extend, useQuasar, scroll } from "quasar";

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
  name: "message",

  setup(props, context) {
    const router = useRouter();
    const $q = useQuasar();
    //---------- Vuex ----------
    const store = useStore();
    let vuex = reactive({
      repaircaseId: computed(() => {
        return store.state.repaircase.repaircaseId;
      }),
      username: computed(() => {
        return store.state.auth.userName;
      }),
    });

    //---------- data ----------
    let cardBottomRef = ref(null);
    const data = reactive({
      chats: {},
      message: "",
    });
    onMounted(() => {
      read_message();
      scrollToElement(cardBottomRef.value);
    });

    async function read_message() {
      try {
        console.log("vuex.repaircaseId", vuex.repaircaseId);
        const subColRef = collection(
          getFirestore(),
          "repairCases",
          vuex.repaircaseId,
          "messages"
        );
        const q = query(subColRef, orderBy("timestamp", "asc"), limit(50));
        // 監聽資料庫
        onSnapshot(q, function (snapshot) {
          snapshot.docChanges().forEach(function (change) {
            if (change.type === "removed") {
              // 刪除訊息
              delete data.chats[change.doc.id];
            } else {
              // 訊息更動時，包含新增

              let tp = change.doc.data().timestamp;
              let date1 = tp ? tp.toMillis() : Date.now();

              let date2 = Date.now();

              let label = date.formatDate(date1, "YYYY-MM-DD HH:mm");
              let diff = date.getDateDiff(date2, date1);
              let stamp = diff > 0 ? `... ${diff} 天以前 ` : "";
              let sent = change.doc.data().name == vuex.username; // 本人送出，sent = true
              const messageData = {
                // label,
                stamp: label,
                sent,
                ...change.doc.data(),
              };
              console.log(messageData);
              data.chats[change.doc.id] = messageData;
            }
          });
        });
      } catch (error) {
        console.error("Firebase Database 錯誤", error);
      }
    }
    async function sendMessage() {
      $q.notify("送出訊息中...");
      const payload = {
        name: vuex.username,
        text: [data.message],
        timestamp: serverTimestamp(),
      };
      console.log(payload);
      //寫入 messages資料庫
      try {
        const subCollectionRef = collection(
          getFirestore(),
          "repairCases",
          vuex.repaircaseId,
          "messages"
        );
        await addDoc(subCollectionRef, payload);
        scrollToElement(cardBottomRef.value);
      } catch (error) {
        console.error("Firestore 錯誤", error);
      }
      data.message = null;
    }

    // 采用元素对象(element object)
    function scrollToElement(el) {
      const { getScrollTarget, setVerticalScrollPosition } = scroll;
      let target = getScrollTarget(el);
      let offset = el.offsetTop - el.scrollHeight;
      let duration = 1000;
      setVerticalScrollPosition(target, offset, duration);
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
      cardBottomRef,
      sendMessage,
      scrollToElement,
    };
  },
});
</script>

<style lang="sass">
.my-emoji
  vertical-align: middle
  height: 20em
  width: 20em
</style>
