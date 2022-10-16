<template>

  <a-layout>
    <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
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
      <!--每一行要给一个key-->
      <a-table
          :columns="columns"
          :row-key="record => record.id"
          :data-source="categorys"
          :loading="loading"
          :pagination="false"
      >
        <template #cover="{ text: cover }">
          <img v-if="cover" :src="cover" alt="avatar"/>
        </template>
        <!--        <template v-slot:category="-->
        <!--{/* eslint-disable-next-line vue/no-unused-vars */},-->
        <!--{ text , record }">-->
        <!--          <span>{{ getCategoryName(record.category1Id) }} / {{ getCategoryName(record.category2Id) }}</span>-->
        <!--        </template>-->

        <template v-slot:action="{  record }">
          <a-space size="small">
            <a-button type="primary" @click="edit(record)">
              编辑
            </a-button>
            <a-popconfirm
                title="删除后不可恢复，确认删除?"
                ok-text="是"
                cancel-text="否"
                @confirm="handleDelete(record.id)"
            >
              <a-button type="danger">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>

    </a-layout-content>
  </a-layout>
  <a-modal
      title="分类表单"
      v-model:visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
  >
    <!--表单-->
    <a-form :model="category" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="名称">
        <a-input v-model:value="category.name"/>
      </a-form-item>
      <a-form-item label="父分类">
        <a-input v-model:value="category.parent"/>
      </a-form-item>
      <a-form-item label="顺序">
        <a-input v-model:value="category.sort"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";
import axios from "axios";
import {message} from "ant-design-vue";
import { Tool } from "@/util/tool";

export default defineComponent({
  name: "AdminCategory",
  setup() {
    const param=ref();
    param.value={};
    const categorys = ref();
    const loading = ref(false);
    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '父分类',
        key: 'parent',
        dataIndex: 'parent'
      }, {
        title: '顺序',
        dataIndex: 'sort',
      },
      {
        title: 'Action',
        key: 'action',
        slots: {customRender: 'action'}
      }
    ];
    /**
     * 数据查询
     **/
    const handleQuery = () => {
      loading.value = true;
      /*这是get的方式*/
      axios.get("/category/all").then((response) => {
        loading.value = false;
        const data = response.data;
        if (data.success) {
          categorys.value = data.content;

        }else {
          message.error(data.message);
        }

      });

    };

    // -------- 表单 ---------
    /**
     * 数组，[100, 101]对应：前端开发 / Vue
     */
    const category = ref();
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const handleModalOk = () => {
      modalLoading.value = true;/*显示一个loading的效果*/
      /*     setTimeout(() => {

           }, 2000);*/

      axios.post("/category/save", category.value).then((response) => {
        modalLoading.value=false;
        const data = response.data;
        if (data.success) {
          /*这个是modalVisible哪个框*/
          modalVisible.value = false;
          /*拿到之后就把loading去掉*/
          // modalLoading.value = false;
          //重新加载列表
          handleQuery();
        }else {
          message.error(data.message);
        }
      });
    };

    /**
     * 编辑
     * */
    const edit = (record: any) => {
      modalVisible.value = true;
      category.value = Tool.copy(record);/*数据双向绑定，所以在这复制了一份*/
      console.log(record,category.value);
    }
    /**
     * 新增
     * */
    const add = () => {
      modalVisible.value = true;
      category.value = {};
    }
    /**
     * 删除
     * */
    const handleDelete = (id: number) => {
      /*这里直接拼接字符串*/
      axios.delete("/category/delete/" + id).then((response) => {
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


    onMounted(() => {
      handleQuery();
    });

    return {
      param,
      categorys,
      columns,
      loading,
      /*方法*/
      edit,
      handleDelete,
      add,

      handleQuery,

      modalVisible,
      modalLoading,
      handleModalOk,
      category

    }
  }
});
</script>

<style scoped>

</style>
