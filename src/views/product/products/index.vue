<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择商品类型" clearable>
          <el-option v-for="dict in product_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="商品代码" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入商品代码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-select v-model="queryParams.supplierId" placeholder="请选择供应商" clearable>
          <el-option v-for="dict in supplier" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['product:products:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['product:products:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['product:products:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['product:products:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品类型" align="center" prop="type">
        <template #default="scope">
          <dict-tag :options="product_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="商品代码" align="center" prop="code" min-width="80" />
      <el-table-column label="宽" align="center" prop="width" min-width="50" />
      <el-table-column label="高" align="center" prop="height" min-width="50" />
      <el-table-column label="深" align="center" prop="depth" min-width="50" />
      <el-table-column label="描述" align="center" prop="description" min-width="200" />
      <el-table-column label="原材料" align="center" prop="materialId" min-width="80" />
      <el-table-column label="价格" align="center" prop="price" min-width="80" />
      <el-table-column label="参数" align="center" prop="specification" min-width="80">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditor(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
      <el-table-column label="供应商" align="center" prop="supplierId"  min-width="80">
        <template #default="scope">
          <dict-tag :options="supplier" :value="scope.row.supplierId" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="80">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['product:products:edit']">修改</el-button>
          <el-button link type="success" @click="openSplitDialog(scope.row)">拆单</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['product:products:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <ProductSpecEditor v-model="editorVisible" :row="currentRow" @save="handleSave" />

    <PanelSizeDialog v-model="splitDialogVisible" :row="currentRow" />






    <!-- 添加或修改products对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择商品类型">
            <el-option v-for="dict in product_type" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入商品代码" />
        </el-form-item>
        <el-form-item label="宽" prop="width">
          <el-input v-model="form.width" placeholder="请输入宽" />
        </el-form-item>
        <el-form-item label="高" prop="height">
          <el-input v-model="form.height" placeholder="请输入高" />
        </el-form-item>
        <el-form-item label="深" prop="depth">
          <el-input v-model="form.depth" placeholder="请输入深" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="面板" prop="materialId">
          <el-input v-model="form.materialId" placeholder="请输入原材料" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select  v-model="form.supplierId" placeholder="请选择供应商">
            <el-option v-for="dict in supplier" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Products">
import { listProducts, getProducts, delProducts, addProducts, updateProducts } from "@/api/product/products";
import { ref } from 'vue';

import PanelSizeDialog from "@/components/PanelSizeDialog.vue";
import ProductSpecEditor from '@/components/SpecEditorDialog.vue';
const editorVisible = ref(false);
const currentRow = ref(null);

const splitDialogVisible = ref(false);
const openSplitDialog = (row) => {
  currentRow.value = row;
  splitDialogVisible.value = true;
};

const openEditor = (row) => {
  currentRow.value = row;
  editorVisible.value = true;
};

const handleSave = (updatedRow) => {
  // 提交到后端
  console.log("Updated Row:", updatedRow);
  updateProducts(updatedRow).then(() => {
    proxy.$modal.msgSuccess("参数已保存");
    editorVisible.value = false;
    getList();
  });
};

// 拆单close标签预览
const onClose = () => {
  dialogVisible.value = false;
  splitDialogVisible.value = false;
  currentRow.value = null;
};


const { proxy } = getCurrentInstance();
const { product_type, supplier } = proxy.useDict('product_type', 'supplier');

const productsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    type: null,
    code: null,
    supplierId: null,
  },
  rules: {
    type: [
      { required: true, message: "商品类型不能为空", trigger: "change" }
    ],
    code: [
      { required: true, message: "商品代码不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询products列表 */
function getList() {
  loading.value = true;
  listProducts(queryParams.value).then(response => {
    productsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    type: null,
    code: null,
    width: null,
    height: null,
    depth: null,
    description: null,
    materialId: null,
    price: null,
    specification: null,
    supplierId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("productsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加products";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getProducts(_id).then(response => {
    form.value = response.data;
    console.log("form.value", form.value);
    open.value = true;
    title.value = "修改products";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateProducts(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProducts(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除products编号为"' + _ids + '"的数据项？').then(function () {
    return delProducts(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/products/export', {
    ...queryParams.value
  }, `products_${new Date().getTime()}.xlsx`)
}



getList();
</script>
<style scoped>
.label-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-height: 80vh;
  overflow: auto;
}

.label-cell {
  border: 1px solid #ccc;
  padding: 10px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 180px;
}

.label-head {
  font-weight: bold;
  margin-bottom: 5px;
}

.label-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.label-info {
  flex: 1;
  line-height: 1.4;
}

.mini-canvas {
  margin-left: 10px;
  border: 1px solid #000;
}
</style>