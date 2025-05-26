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
      <el-table-column label="供应商" align="center" prop="supplierId" :formatter="formatSupplierName" min-width="80">
        <template #default="scope">
          <dict-tag :options="supplier" :value="scope.row.supplierId" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="80">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['product:products:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['product:products:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

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
        <el-form-item label="原材料" prop="materialId">
          <el-input v-model="form.materialId" placeholder="请输入原材料" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select v-model="form.supplierId" placeholder="请选择供应商">
            <el-option v-for="dict in supplier" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
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

    <div>
      <el-button type="primary" @click="() => openEditor(specification.value, 'Cabinet')">编辑参数</el-button>
      <el-dialog title="编辑参数" :model-value="dialogVisible" @update:modelValue="onClose" width="60%" @close="onClose">
        <div>
          <h3>Box</h3>
          <el-form label-width="80px" inline style="margin-bottom: 10px;">
            <el-form-item label="Width">
              <el-input-number v-model="localJsonData.box.width" :min="0" @change="recalculatePanels" />
            </el-form-item>
            <el-form-item label="Height">
              <el-input-number v-model="localJsonData.box.height" :min="0" @change="recalculatePanels" />
            </el-form-item>
            <el-form-item label="Depth">
              <el-input-number v-model="localJsonData.box.depth" :min="0" @change="recalculatePanels" />
            </el-form-item>
          </el-form>

          <el-table :data="panelRows"
            style="width: 100%" size="small" :header-cell-style="{ textAlign: 'center' }">
            <el-table-column prop="name" label="position" width="100" align="center" />
            <el-table-column label="width" align="center">
              <template #default="scope">
                {{ scope.row.ref.width }}
              </template>
            </el-table-column>
            <el-table-column label="height" align="center">
              <template #default="scope">
                {{ scope.row.ref.height }}
              </template>
            </el-table-column>
            <el-table-column label="depth" align="center">
              <template #default="scope">
                {{ scope.row.ref.depth }}
              </template>
            </el-table-column>
            <el-table-column label="material" align="center">
              <template #default="scope">
                <el-input v-model="scope.row.ref.material" />
              </template>
            </el-table-column>
            <el-table-column label="price" align="center">
              <template #default="scope">
                <el-input-number v-model="scope.row.ref.price" :min="0" />
              </template>
            </el-table-column>
          </el-table>

          <el-button type="success" icon="Plus" @click="addShelf">ADD shelves</el-button>
          <el-table :data="localJsonData.box.shelves" style="width: 100%" size="small"
            :header-cell-style="{ textAlign: 'center' }">
            <el-table-column label="type">
              <template #default="scope">
                <el-select v-model="scope.row.type" placeholder="请选择">
                  <el-option label="fixed" value="fixed" />
                  <el-option label="adjustable" value="adjustable" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="width">
              <template #default="scope">
                <el-input v-model="scope.row.width" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="height">
              <template #default="scope">
                <el-input v-model="scope.row.height" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="depth">
              <template #default="scope">
                <el-input v-model="scope.row.depth" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="position">
              <template #default="scope">
                <el-input v-model="scope.row.position" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="material">
              <template #default="scope">
                <el-input v-model="scope.row.material" />
              </template>
            </el-table-column>

            <el-table-column label="price">
              <template #default="scope">
                <el-input v-model="scope.row.price" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="action" width="60">
              <template #default="scope">
                <el-button type="danger" icon="Delete" @click="removeShelf(scope.$index)" circle />
              </template>
            </el-table-column>
          </el-table>




          <h3>Face</h3>
          <el-button type="success" icon="Plus" @click="addFace">add face section</el-button>
          <el-table :data="localJsonData.face" style="width: 100%" size="small"
            :header-cell-style="{ textAlign: 'center' }">
            <el-table-column label="type">
              <template #default="scope">
                <el-input v-model="scope.row.type" />
              </template>
            </el-table-column>
            <el-table-column label="width">
              <template #default="scope">
                <el-input-number v-model="scope.row.width" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="height">
              <template #default="scope">
                <el-input-number v-model="scope.row.height" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="depth">
              <template #default="scope">
                <el-input-number v-model="scope.row.depth" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="material">
              <template #default="scope">
                <el-input v-model="scope.row.material" />
              </template>
            </el-table-column>
            <el-table-column label="price">
              <template #default="scope">
                <el-input-number v-model="scope.row.price" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="action">
              <template #default="scope">
                <el-button type="danger" icon="Delete" @click="removeFace(scope.$index)" circle />
              </template>
            </el-table-column>
          </el-table>

          <h3>Accessories</h3>
          <pre>{{ localJsonData.Accessories }}</pre>
        </div>

        <template #footer>
          <el-button @click="onClose">取消</el-button>
          <el-button type="primary" @click="onSave">保存</el-button>
        </template>
      </el-dialog>
    </div>


  </div>




</template>

<script setup name="Products">
import { listProducts, getProducts, delProducts, addProducts, updateProducts } from "@/api/product/products";

import { ref } from 'vue';





const dialogVisible = ref(false);
const currentRow = ref(null);

const specification = ref({
  id: 0,
  box: {
    width: 0,
    height: 0,
    depth: 0,
    panels: {
      left: { width: 0, height: 0, depth: 0, material: 'plywood', price: 0 },
      right: { width: 0, height: 0, depth: 0, material: 'plywood', price: 0 },
      bottom: { width: 0, height: 0, depth: 0, material: 'plywood', price: 0 },
      back: { width: 0, height: 0, depth: 0, material: 'plywood', price: 0 },
      top: { width: 0, height: 0, depth: 0, material: 'plywood', price: 0 }
    },
    shelves: []
  },
  face: [],
  Accessories: []
});

const localJsonData = ref(JSON.parse(JSON.stringify(specification.value)));

const openEditor = (row) => {
  currentRow.value = row;

  const parsedSpec = typeof row.specification === 'string'
    ? JSON.parse(row.specification || '{}')
    : row.specification;


  localJsonData.value = parsedSpec || {
    box: {
      width: row.width || 0,
      height: row.height || 0,
      depth: row.depth || 0,
      panels: {
        left: { width: 0, height: 0, depth: 0.75, material: 'plywood', price: 0 },
        right: { width: 0, height: 0, depth: 0.75, material: 'plywood', price: 0 },
        bottom: { width: 0, height: 0, depth: 0.75, material: 'plywood', price: 0 },
        top: { width: 0, height: 0, depth: 0.75, material: 'plywood', price: 0 },
        back: { width: 0, height: 0, depth: 0.25, material: 'plywood', price: 0 }
      },
      shelves: []
    },
    face: [],
    Accessories: []
  };

  recalculatePanels(); // 同步面板尺寸
  dialogVisible.value = true;
};

const panelRows = computed(() => {
  return Object.entries(localJsonData.value.box.panels).map(([name, ref]) => ({
    name,
    ref
  }));
});

const recalculatePanels = () => {
  const box = localJsonData.value.box;
  const { width, height, depth } = box;

  if (!box.panels) box.panels = {};

  // 更新尺寸，保留原有 material 和 price
  const updatePanel = (name, newDims) => {
    const panel = box.panels[name] || {};
    box.panels[name] = {
      ...panel,  // 保留已有 material / price 等字段
      ...newDims  // 覆盖尺寸字段
    };
  };

  updatePanel('left',   { width: depth, height: height, depth: 0.75 });
  updatePanel('right',  { width: depth, height: height, depth: 0.75 });
  updatePanel('bottom', { width: width, height: depth, depth: 0.75 });
  updatePanel('top',    { width: width, height: depth, depth: 0.75 });
  updatePanel('back',   { width: width, height: height, depth: 0.25 });
};

const addShelf = () => {
  localJsonData.value.box.shelves.push({
    type: 'adjustable',
    width: 0,
    height: 0.75,
    length: 0,
    position: 0,
    material: 'plywood',
    price: 0
  });
};

const removeShelf = (index) => {
  localJsonData.value.box.shelves.splice(index, 1);
};

const addFace = () => {
  localJsonData.value.face.push({
    type: '',
    width: 0,
    height: 0,
    depth: 0,
    material: '',
    price: 0
  });
};

const removeFace = (index) => {
  localJsonData.value.face.splice(index, 1);
};

const handleJsonChange = (value) => {
  localJsonData.value = value;
};

const onSave = () => {
  if (!currentRow.value) return;

  // 更新 row.specification
  currentRow.value.specification = JSON.stringify(localJsonData.value);
  currentRow.value.width = localJsonData.value.box.width;
  currentRow.value.height = localJsonData.value.box.height;
  currentRow.value.depth = localJsonData.value.box.depth;

  // 提交到后端
  updateProducts(currentRow.value).then(() => {
    proxy.$modal.msgSuccess("参数已保存");
    dialogVisible.value = false;
    getList();
  });
 
};

const onClose = () => {
  dialogVisible.value = false;
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

function formatSupplierName(row) {
  const sp = this.supplier.find(item => item.id === row.supplierId);
  return sp ? sp.name : '';
}

getList();
</script>
