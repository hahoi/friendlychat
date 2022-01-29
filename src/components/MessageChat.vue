<template>
  <div class="" style="width: 100%; max-width: 400px; margin: 0 auto">
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
          <template v-else-if="item.imageUrl">
            <div>
              <q-chat-message
                :name="item.name"
                :stamp="item.stamp"
                :sent="item.sent"
              >
                <div
                  class="flex justify-center"
                  @click="viewPhoto(item.imageUrl)"
                >
                  <img :src="item.imageUrl" style="max-width: 10rem" />
                </div>
              </q-chat-message>
            </div>
          </template>
        </template>
        <div ref="cardBottomRef"></div>
      </q-card-section>
    </q-card>
    <q-page-sticky expand position="bottom" class="z-top bg-white q-pt-md">
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
          @click="$refs.mediaCapture.click()"
        />
        <input
          id="mediaCapture"
          ref="mediaCapture"
          type="file"
          accept="image/*"
          capture="camera"
          style="display: none"
          @change="onMediaFileSelected"
        />
      </div>
    </q-page-sticky>

    <!-- 顯示照片 -->
    <q-dialog v-model="showPhoto" :maximized="true" class="z-max">
      <q-card>
        <q-bar class="bg-white q-mt-md fixed">
          <q-btn
            round
            icon="close"
            class="bg-grey-8 text-white text-h6"
            v-close-popup
          >
          </q-btn>
        </q-bar>
        <div class="flex column items-center" style="padding-top: 80px">
          <img :src="photoUrl" />
        </div>
      </q-card>
    </q-dialog>
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

import {
  getStorage,
  ref as StorageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export default defineComponent({
  name: "message",
  props: {
    repaircaseId: {
      type: String,
      required: true,
    },
  },

  setup(props, context) {
    const router = useRouter();
    const $q = useQuasar();
    //---------- Vuex ----------
    const store = useStore();
    let vuex = reactive({
      repaircaseId: computed(() => {
        return store.state.repaircase.repaircaseId;
      }),
      uid: computed(() => {
        return store.state.auth.uid;
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
      showPhoto: false,
      photoUrl: "",
    });

    onMounted(() => {
      if (vuex.repaircaseId) {
        // reload時，要確定vuex資料以正確讀入
        read_message();
      }
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
        // 監聽資料庫，有變動時，更新記憶體資料
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
              console.log("username", vuex.username);
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
      $q.notify({ message: "送出訊息中...", timeout: 1000 });
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

    // 選擇上傳圖片，回傳檔案 file
    function onMediaFileSelected(event) {
      event.preventDefault();
      var file = event.target.files[0];

      // Clear the selection in the file picker input.
      // imageFormElement.reset();

      // Check if the file is an image.
      if (!file.type.match("image.*")) {
        // var data = {
        //   message: 'You can only share images',
        //   timeout: 2000
        // };
        // signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
        return;
      }
      // Check if the user is signed-in
      // if (checkSignedInWithMessage()) {
      console.log(file);
      // 上傳圖片，儲存圖片
      saveImageMessage(file);
      scrollToElement(cardBottomRef.value);
      // }
    }

    // A loading image URL.
    const LOADING_IMAGE_URL = "https://www.google.com/images/spin-32.gif?a";

    async function saveImageMessage(file) {
      try {
        // 1 - We add a message with a loading icon that will get updated with the shared image.
        const messageRef = await addDoc(
          collection(
            getFirestore(),
            "repairCases",
            vuex.repaircaseId,
            "messages"
          ),
          {
            name: vuex.username,
            imageUrl: LOADING_IMAGE_URL,
            timestamp: serverTimestamp(),
          }
        );

        // 2 - Upload the image to Cloud Storage.
        const filePath = `${vuex.repaircaseId}/${messageRef.id}/${file.name}`;
        const newImageRef = StorageRef(getStorage(), filePath);
        const fileSnapshot = await uploadBytesResumable(newImageRef, file);

        // 3 - Generate a public URL for the file.
        const publicImageUrl = await getDownloadURL(newImageRef);

        // 4 - Update the chat message placeholder with the image’s URL.
        await updateDoc(messageRef, {
          imageUrl: publicImageUrl,
          storageUri: fileSnapshot.metadata.fullPath,
        });
      } catch (error) {
        console.error(
          "There was an error uploading a file to Cloud Storage:",
          error
        );
      }
    }

    function viewPhoto(url) {
      data.photoUrl = url;
      data.showPhoto = true;
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
      cardBottomRef,
      sendMessage,
      scrollToElement,
      onMediaFileSelected,
      viewPhoto,
    };
  },
});
</script>

<style></style>
