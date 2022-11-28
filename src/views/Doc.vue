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
              :field-names="{title: 'name', key: 'id', value: 'id' }"
              :defaultExpandAll="true"
              :default-expand-all="true"
              :defaultSelectedKeys="defaultSelectedKeys"
          >
          </a-tree>
        </a-col>
        <a-col :span="18">
          <div>
            <h2>{{ doc.name }}</h2>
            <div>
              <span>阅读数：{{ doc.viewCount }}</span>&nbsp;&nbsp;
              <span>点赞数：{{ doc.voteCount }}</span>
            </div>
            <a-divider/>
          </div>
          <div style="border: 1px solid #ccc">
            <Editor
                style="height: 500px; overflow-y: hidden;"
                v-model="html"
                :mode="mode"
                @onCreated="handleCreated"
            />
          </div>
          <div class="vote-div">
            <a-button type="primary" shape="round" :size="'large'" @click="vote">
              <like-two-tone/>&nbsp;点赞：{{ doc.voteCount }}
            </a-button>
          </div>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref, shallowRef} from "vue";
import axios from "axios";
import {Tool} from "@/util/tool";
import {message} from "ant-design-vue";
import {useRoute} from "vue-router";
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor } from '@wangeditor/editor-for-vue'
export default defineComponent({
  name: 'Doc',
  components: { Editor},
  setup() {
    const route = useRoute();
    const docs = ref();

    const defaultSelectedKeys = ref();
    defaultSelectedKeys.value = [];

    const level1 = ref();
    level1.value = [];
//当前选中的文本
    const doc = ref();
    doc.value = {};


    /*富文本*/
    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()
    const html = ref()
    const handleCreated = (editor: any) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }
    /**
     * 内容查询
     **/
    const handleQueryContent = (id: number) => {
      axios.get("/doc/findContent/" + id).then((response) => {
        const data = response.data;
        if (data.success) {
          html.value = data.content;
          console.log(html.value);
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
      axios.get("/doc/all/" + route.query.ebookId).then((response) => {
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
    };

    //点赞
    const vote = () => {
      axios.get('/doc/vote/' + doc.value.id).then((response) => {
        const data = response.data;
        if (data.success) {
          doc.value.voteCount++;
        } else {
          message.error(data.message);
        }
      });
    };
    onMounted(() => {
      handleQuery();
    })
    return {
      level1,
      html,
      onSelect,
      defaultSelectedKeys,
      doc,
      vote,
      mode: 'default',
      handleCreated
    }
  }
})
;

</script>

<style scoped>

.show table {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
}
.show table td,
.show table th {
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
  padding: 3px 5px;
}
.show table th {
  border-bottom: 2px solid #ccc;
  text-align: center;
}

/* blockquote 样式 */
.show blockquote {
  display: block;
  border-left: 8px solid #d0e5f2;
  padding: 5px 10px;
  margin: 10px 0;
  line-height: 1.4;
  font-size: 100%;
  background-color: #f1f1f1;
}

/* code 样式 */
.show code {
  display: inline-block;
  *display: inline;
  *zoom: 1;
  background-color: #f1f1f1;
  border-radius: 3px;
  padding: 3px 5px;
  margin: 0 3px;
}
.show pre code {
  display: block;
}

/* ul ol 样式 */
.show ul, ol {
  margin: 10px 0 10px 20px;
}

/* 和antdv p冲突，覆盖掉 */
.show blockquote p {
  font-family:"YouYuan";
  margin: 20px 10px !important;
  font-size: 16px !important;
  font-weight:600;
}

/* 点赞 */
.vote-div {
  padding: 15px;
  text-align: center;
}

/* 图片自适应 */
.show img {
  max-width: 100%;
  height: auto;
}

/* 视频自适应 */
.show iframe {
  width: 100%;
  height: 400px;
}

</style>
