<template>
  <div>
    <the-header></the-header>
    <router-view></router-view>
    <the-footer></the-footer>
  </div>
</template>

<script lang="ts">

import theHeader from "@/components/theHeader.vue";
import { defineComponent } from "vue";
import TheFooter from "@/components/theFooter.vue";

export default defineComponent({
  name: 'app',
  components: {
    TheFooter,
    theHeader,
  },
});

</script>

<style>

</style>
