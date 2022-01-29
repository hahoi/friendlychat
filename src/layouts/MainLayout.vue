<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->
        <div class="q-ma-xs">
          <img
            src="../assets/logo.png"
            style="border-radius: 50%"
            class="shadow-8"
          />
        </div>
        <q-toolbar-title class="text-h5 col-8">
          資訊設備報修系統
        </q-toolbar-title>
        <q-space />
        <div v-if="uid" class="">
          <q-btn round color="info" @click="singout()" label="登出" />
        </div>

        <!--  -->
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";

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

export default defineComponent({
  name: "MainLayout",

  components: {},

  setup() {
    //---------- Vuex ----------
    const store = useStore();
    const vuex = reactive({
      uid: computed(() => {
        return store.state.auth.uid;
      }),
    });
    //---------- data ----------
    const data = reactive({});
    function singout() {
      store.dispatch("auth/logout");
    }

    return {
      ...toRefs(vuex),
      ...toRefs(data),
      singout,
    };
  },
});
</script>
