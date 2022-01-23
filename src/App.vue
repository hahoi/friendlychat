<template>
  <router-view />
</template>
<script>
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "App",
  setup() {
    const store = useStore();
    store.dispatch("auth/ListenAuthStateChange");
  },
});
</script>
