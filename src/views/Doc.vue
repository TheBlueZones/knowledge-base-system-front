 <template>
  <a-layout>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
      <h3 v-if="level1.length === 0">对不起，找不到相关文档！</h3>
      <a-row>
        <a-col :span="6">
          <a-tree
              v-if="level1.length > 0"
              :tree-data="level1"
              @select="onSelect"
              :field-names="{label: 'name',value: 'id', children: 'children' }"
              :defaultExpandAll="true"
              :default-expand-all="true"
          >
          </a-tree>
        </a-col>
        <a-col :span="18">
          <div>
            <h2>{{doc.name}}</h2>
            <div>
              <span>阅读数：{{doc.viewCount}}</span>&nbsp;&nbsp;
              <span>点赞数：{{doc.voteCount}}</span>
            </div>
            <a-divider />
          </div>
          <div :innerHTML="html"></div>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import axios from "axios";
import {Tool} from "@/util/tool";
import {message} from "ant-design-vue";
import {useRoute} from "vue-router";

export default defineComponent({
  name: 'Doc',
  components: {},
  setup() {
    const route = useRoute();
    const docs = ref();
    const html = ref();
    const defaultSelectedKeys = ref();
    defaultSelectedKeys.value = [];

    const level1 = ref();
    level1.value = [];
//当前选中的文本
    const doc = ref();
    doc.value = {};

    /**
     * 内容查询
     **/
    const handleQueryContent = (id: number) => {
      axios.get("/doc/find-content/" + id).then((response) => {
        const data = response.data;
        if (data.success) {
          html.value = data.content;
        } else {
          message.error(data.message);
        }
      });
    };

    const onSelect = (selectedKeys: any, info: any) => {
      console.log('selected', selectedKeys, info);
      if (Tool.isNotEmpty(selectedKeys)) {
        // 选中某一节点时，加载该节点的文档信息
        doc.value = info.selectedNodes[0].props;
        // 加载内容
        handleQueryContent(selectedKeys[0]);
      }
    };
  const handleQuery = () => {
    axios.get("/doc/all" + route.query.ebookId).then((response) => {
      const data = response.data;
      if (data.success) {
        docs.value = data.content;

        level1.value = [];
        level1.value = Tool.array2Tree(docs.value, 0);

        if (Tool.isNotEmpty(level1)) {
          defaultSelectedKeys.value = [level1.value[0].id];
          handleQueryContent(level1.value[0].id);
          // 初始显示文档信息
          doc.value = level1.value[0];
        }
      } else {
        message.error(data.message);
      }
    });

    onMounted(() => {
      handleQuery();
    })

    return {
      level1,
      html,
      onSelect,
      defaultSelectedKeys,
      doc
    }
  };
}
})
;

</script>

<style scoped>

</style>
