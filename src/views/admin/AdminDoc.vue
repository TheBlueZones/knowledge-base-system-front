<template>

  <a-layout>
    <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
      <a-row :gutter="24">
        <a-col :span="8">
          <p>
            <a-form layout="inline" :model="param">
              <a-form-item>
                <a-button type="primary" @click="handleQuery()"><!--在里面用就不需要。value了-->
                  查询
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="add()">
                  新增
                </a-button>
              </a-form-item>
            </a-form>
          </p>
          <a-table
              :columns="columns"
              :data-source="level1"
              :loading="loading"
              :pagination="false"
              :row-key="record => record.id"
              size="small"
          >
            <template #name="{ text, record }">
              {{ record.sort }}{{ text }}
            </template>
            <!--        <template v-slot:doc="{ text, record }">
                      <span>{{ getDocName(record.doc1Id) }} / {{ getDocName(record.doc2Id) }}</span>
                    </template>-->
            <template v-slot:action="{  text,record }">
              <a-space size="small">
                <a-button type="primary" @click="edit(record)" size="small">
                  编辑
                </a-button>
                <a-popconfirm
                    title="删除后不可恢复，确认删除?"
                    ok-text="是"
                    cancel-text="否"
                    @confirm="showConfirm(record.id)"
                >
                  <a-button type="danger" size="small">
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table>
        </a-col>
        <a-col :span="16">
          <p>
            <a-form layout="inline" :model="param">
              <a-form-item>
                <a-button type="primary" @click="handleSave()">
                  保存
                </a-button>
              </a-form-item>
            </a-form>
          </p>
          <a-form :model="doc" layout="vertical">
            <a-form-item>
              <a-input v-model:value="doc.name" placeholder="名称"/>
            </a-form-item>
            <a-form-item>
              <a-tree-select
                  v-model:value="doc.parent"
                  show-search
                  style="width: 100%"
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                  placeholder="请选择父文档"
                  allow-clear
                  tree-default-expand-all
                  :tree-data="treeSelectData"
                  :field-names="{label: 'name',value: 'id', children: 'children'}"
              >
                <!--把组件的变量转换成自己的-->
              </a-tree-select>
            </a-form-item>
            <a-form-item>
              <a-input v-model:value="doc.parent" placeholder="父文档"/>
              <a-select
                  ref="select"
                  v-model:value="doc.parent"
              >
                <a-select-option value="0">无</a-select-option>
                <a-select-option v-for="c in level1" :key="c.id" :value="c.id" :disabled="doc.id==c.id">{{ c.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item >
              <a-input v-model:value="doc.sort" placeholder="顺序"/>
            </a-form-item>
            <a-form-item>
              <div style="border: 1px solid #ccc" id="webebnkuang">
                <Toolbar
                    style="border-bottom: 1px solid #ccc"
                    :editor="editorRef"
                    :defaultConfig="toolbarConfig"
                    :mode="mode"
                />
                <Editor
                    style="height: 500px; overflow-y: hidden;"
                    v-model="valueHtml"
                    :defaultConfig="editorConfig"
                    :mode="mode"
                    @onCreated="handleCreated"
                />
              </div>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>

      <!--每一行要给一个key-->


    </a-layout-content>
  </a-layout>
  <!--  <a-modal
        title="文档表单"
        v-model:visible="modalVisible"
        :confirm-loading="modalLoading"
        @ok="handleModalOk"
    >
      &lt;!&ndash;表单&ndash;&gt;
    </a-modal>-->
</template>

<script lang="ts">
import {createVNode, defineComponent, onMounted, ref} from "vue";
import axios from "axios";
import {message, Modal} from "ant-design-vue";
import {Tool} from "@/util/tool";
import {useRoute} from "vue-router";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import {onBeforeUnmount, shallowRef} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'

export default defineComponent({
  name: "AdminDoc",
  components: {Editor, Toolbar},
  setup() {
    /**
     * 富文本
     * */
        // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()

    // 内容 HTML
    const valueHtml = ref('<p>hello</p>')

    // 模拟 ajax 异步获取内容
    onMounted(() => {
      setTimeout(() => {
        valueHtml.value = '<p></p>'
      }, 1500)
    })

    const toolbarConfig = {}
    const editorConfig = {placeholder: '请输入内容...'}

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor: any) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }

    const route = useRoute();
    console.log("路由：", route);
    console.log("route.path：", route.path);
    console.log("route.query：", route.query);
    console.log("route.param：", route.params);
    console.log("route.fullPath：", route.fullPath);
    console.log("route.name：", route.name);
    console.log("route.meta：", route.meta);
    const param = ref();
    param.value = {};
    const docs = ref();
    const loading = ref(false);
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        slots: {customRender: 'name'}
        /*有dataIndex:，这个列对应的是name*/
      },
      {
        title: 'Action',
        key: 'action',
        slots: {customRender: 'action'}
        /*text，record都是整列的值*/
      }
    ];
    /**
     * 一级文档树，children属性就是二级文档
     * [{
     *   id: "",
     *   name: "",
     *   children: [{
     *     id: "",
     *     name: "",
     *   }]
     * }]
     */
    const level1 = ref(); // 一级文档树，children属性就是二级文档


    /**
     * 数据查询
     **/
    const handleQuery = () => {
      loading.value = true;
      /*这是get的方式*/
      // 如果不清空现有数据，则编辑保存重新加载数据后，再点编辑，则列表显示的还是编辑前的数据
      level1.value = [];
      axios.get("/doc/all").then((response) => {
        loading.value = false;
        const data = response.data;
        // console.log('response: ' + JSON.stringify(response))
        if (data.success) {
          console.log('data: ' + data)
          docs.value = data.content;

          level1.value = [];
          level1.value = Tool.array2Tree(docs.value, 0);
          // console.log('level1.value----------' + JSON.stringify(level1.value));
          console.log('level1.value----------', level1.value);
          // console.log('data.content--------'+data.content);
          console.log("树形结构：", level1);/*不能用逗号*/
        } else {
          message.error(data.message);
        }
      });

    };

    // -------- 表单 ---------
    /**
     * 数组，[100, 101]对应：前端开发 / Vue
     *
     */
        // 因为树选择组件的属性状态，会随当前编辑的节点而变化，所以单独声明一个响应式变量
    const treeSelectData = ref();
    treeSelectData.value = [];

    const doc = ref({});
    const modalVisible = ref(false);
    const modalLoading = ref(false);

    const handleSave = () => {
      modalLoading.value = true;/*显示一个loading的效果*/
      /*     setTimeout(() => {

           }, 2000);*/

      axios.post("/doc/save", doc.value).then((response) => {
        modalLoading.value = false;
        const data = response.data;
        if (data.success) {
          /*这个是modalVisible哪个框*/
          modalVisible.value = false;
          /*拿到之后就把loading去掉*/
          // modalLoading.value = false;
          //重新加载列表
          handleQuery();
        } else {
          message.error(data.message);
        }
      });
    };

    /**
     * 将某节点及其子孙节点全部置为disabled
     */
    const setDisable = (treeSelectData: any, id: any) => {
      // console.log(treeSelectData, id);
      // 遍历数组，即遍历某一层节点
      for (let i = 0; i < treeSelectData.length; i++) {
        const node = treeSelectData[i];
        if (node.id === id) {
          // 如果当前节点就是目标节点
          console.log("disabled", node);
          // 将目标节点设置为disabled
          node.disabled = true;

          // 遍历所有子节点，将所有子节点全部都加上disabled
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            for (let j = 0; j < children.length; j++) {
              setDisable(children, children[j].id)
            }
          }
        } else {
          // 如果当前节点不是目标节点，则到其子节点再找找看。
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            setDisable(children, id);
          }
        }
      }
    };
    /**
     * 编辑
     * */
    const edit = (record: any) => {
      modalVisible.value = true;
      doc.value = Tool.copy(record);/*数据双向绑定，所以在这复制了一份*/
      console.log(record, doc.value);

      // 不能选择当前节点及其所有子孙节点，作为父节点，会使树断开
      treeSelectData.value = Tool.copy(level1.value);
      setDisable(treeSelectData.value, record.id);

      // 为选择树添加一个"无"
      treeSelectData.value.unshift({id: 0, name: '无'});
    }
    /**
     * 新增
     * */
    const add = () => {
      modalVisible.value = true;
      doc.value = {
        ebookId: route.query.ebookId/*这里只要写成一样的，完了就可以自动识别出来*/
      };

      treeSelectData.value = Tool.copy(level1.value);

      // 为选择树添加一个"无"
      treeSelectData.value.unshift({id: 0, name: '无'});
    }

    const deleteIds: Array<string> = [];
    const deleteNames: Array<string> = [];

    const getDeleteIds = (treeSelectData: any, id: any) => {
      // console.log(treeSelectData, id);
      // 遍历数组，即遍历某一层节点
      for (let i = 0; i < treeSelectData.length; i++) {
        const node = treeSelectData[i];
        if (node.id === id) {
          // 如果当前节点就是目标节点
          console.log("delete", node);
          // 将目标ID放入结果集deleteIds
          // node.disabled = true;
          deleteIds.push(id);
          deleteNames.push(node.name);

          // 遍历所有子节点
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            for (let j = 0; j < children.length; j++) {
              getDeleteIds(children, children[j].id)
            }
          }
        } else {
          // 如果当前节点不是目标节点，则到其子节点再找找看。
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            getDeleteIds(children, id);
          }
        }
      }
    };

    /**
     * 删除
     * */
    const handleDelete = (id: number) => {
      /*这里直接拼接字符串*/
      axios.delete("/doc/delete/" + deleteIds.join(",")).then((response) => {
        const data = response.data; // data = commonResp
        if (data.success) {
          // 重新加载列表
          message.success(data.message);
          handleQuery();
        } else {
          message.error(data.message);
        }
      });
    };

    const showConfirm = (id: number) => {
      deleteIds.length = 0;
      deleteNames.length = 0;/*删除后清空数组，不然会有叠加*/
      getDeleteIds(level1.value, id);
      Modal.confirm({
        title: '你确定要删除以下文档吗？',
        icon: createVNode(ExclamationCircleOutlined),
        content: '将删除：【' + deleteNames.join("，") + "】删除后不可恢复，确认删除？",
        onOk() {
          handleDelete(id);
        },
      });
    }
    onMounted(() => {
      handleQuery();
    });

    return {
      param,
      level1,
      // docs,
      columns,
      loading,
      /*方法*/
      edit,
      handleDelete,
      add,
      treeSelectData,
      handleQuery,
      showConfirm,
      modalVisible,
      modalLoading,
      handleSave,
      doc,
      //富文本
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated
    }
  }
});
</script>

<style scoped>
/*#webebnkuang {
  z-index: 0;
}*/
</style>
