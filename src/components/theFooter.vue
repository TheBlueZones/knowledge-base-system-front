 <template>
  <a-layout-footer style="text-align: center">
    <span v-show="user.id">你好哇：{{user.name}}</span>
  </a-layout-footer>
</template>

<script lang="ts">

import {computed, defineComponent} from "vue";
import store from "@/store";

export default defineComponent({
  name: "theFooter",
  setup() {
    const user = computed(() => store.state.user);

    return {
      user
    }
  }
});
</script>

<style scoped>

</style>
