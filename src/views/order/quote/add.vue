<template>
  <div class="app-container">
    <el-form :model="quoteForm" label-width="120px" ref="quoteRef">
      <el-form-item label="Customer PO">
        <el-input v-model="quoteForm.customerPo" placeholder="input customer info" />
      </el-form-item>



      <el-form-item label="Material">
        <el-autocomplete v-model="selectedMaterialId" :fetch-suggestions="querySearch(3)"
          placeholder="Search material" @select="onMaterialSelect" style="width: 100%" />
      </el-form-item>
      <h3>Product List</h3>
      <el-table :data="quoteForm.products" style="width: 100%" border>
        <el-table-column label="type" prop="type" align="center" min-width="100">
          <template #default="scope">
            <el-select v-model="scope.row.type" placeholder="选择类型" @change="onTypeChange(scope.$index)"
              style="width: 100%">
              <el-option v-for="item in product_type" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="code" prop="code" align="center" min-width="80">
          <template #default="scope">
            <el-autocomplete v-model="scope.row.code" :fetch-suggestions="querySearch(scope.row.type)"
              placeholder="input product code" @select="(item) => handleSelect(scope.$index, item)"
              style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="width" prop="width" align="center" min-width="50" />
        <el-table-column label="height" prop="height" align="center" min-width="50" />
        <el-table-column label="depth" prop="depth" align="center" min-width="50" />
        <el-table-column label="description" prop="description" align="center" :show-overflow-tooltip="true"
          min-width="200" />
        <el-table-column label="material" prop="materialId" align="center" min-width="80">
          <template #default="scope">
            <el-autocomplete v-model="scope.row.materialId" :fetch-suggestions="querySearch(3)"
              placeholder="input product code" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="specification" align="center" prop="specification" min-width="80">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openEditor(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
        <el-table-column label="price" prop="unit_price" align="center" min-width="50">
          <template #default="scope">
            ${{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="quantity" align="center" />
        <el-table-column label="总价" prop="total" align="center">
          <template #default="scope">
            ${{ (scope.row.price * scope.row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template #default="scope">
            <el-button type="danger" icon="Delete" @click="removeProduct(scope.$index)" circle />
          </template>
        </el-table-column>
      </el-table>

      <ProductSpecEditor v-model="editorVisible" :row="currentRow" @save="handleSave" />

      <div class="my-2">
        <el-button type="success" icon="Plus" @click="openProductSelector">添加商品</el-button>
      </div>

      <h3>报价汇总</h3>
      <el-form-item label="Subtotal">
        <span>{{ quoteForm.subtotal.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item label="Tax (9.25%)">
        <span>{{ quoteForm.tax.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item label="Total">
        <span>{{ quoteForm.total.toFixed(2) }}</span>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitQuote">提交报价</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { addQuote, getQuote, updateQuote } from '@/api/order/quote';
import { listProducts } from '@/api/product/products';
import { onMounted, ref } from 'vue';

import ProductSpecEditor from '@/components/SpecEditorDialog.vue';

const editorVisible = ref(false);
const currentRow = ref(null);
const selectedMaterialId = ref('');

const openEditor = (row) => {
  currentRow.value = row;
  editorVisible.value = true;
};

const handleSave = (updatedRow) => {
  updateProducts(updatedRow).then(() => {
    ElMessage.success('保存成功');
    getList();
  });
};

const route = useRouter();
const isEdit = ref(false);
const quoteForm = reactive({
  id: null,
  customerPo: '',
  products: [],
  subtotal: 0,
  tax: 0,
  total: 0
});

const { proxy } = getCurrentInstance();
const { product_type } = proxy.useDict('product_type');

const fetchQuoteById = async (id) => {
  try {
    const response = await getQuote(id);
    console.log('response', response);
    quoteForm.id = response.data.id;
    quoteForm.customerPo = response.data.customerPo;
    quoteForm.subtotal = response.data.subtotal;
    quoteForm.tax = response.data.tax;
    quoteForm.total = response.data.total;
    quoteForm.products = response.data.products ? JSON.parse(response.data.products) : [];
  } catch (error) {
    ElMessage.error('获取报价信息失败');
  }
};

const onTypeChange = (index) => {
  const row = quoteForm.products[index];
  row.code = '';
  row.width = '';
  row.height = '';
  row.depth = '';
  row.material = '';
  row.unit_price = 0;
  row.description = '';
  row.specification = '';
};

onMounted(() => {
  const id = route.currentRoute.value.query.id;

  if (id) {
    isEdit.value = 'edit';
    fetchQuoteById(id);
  } else {
    isEdit.value = 'add';
    quoteForm.value = {
      customerPo: '',
      products: [],
      subtotal: 0,
      tax: 0,
      total: 0
    }
  }
});

// 搜索函数（根据type和code前缀匹配）
const querySearch = (currentType) => async (queryString, cb) => {
  try {
    const response = await listProducts({
      type: currentType,
      code: queryString,
    });
    console.log('querySearch response', response);
    cb(response.rows.map(item => ({
      ...item,
      value: item.code
    })));
  } catch (e) {
    cb([]); // 防止失败时卡住
  }
};

const handleSelect = (rowIndex, selectedProduct) => {
  console.log('selectedProduct', selectedProduct);
  const row = quoteForm.products[rowIndex];
  Object.assign(row, {
    width: selectedProduct.width || '',
    height: selectedProduct.height || '',
    depth: selectedProduct.depth || '',
    description: selectedProduct.description || '',
    specification: selectedProduct.specification || '', 
    quantity: row.quantity || 1,
    total: selectedProduct.unit_price * (row.quantity || 1),
    description: selectedProduct.description || '',
    specification: selectedProduct.specification || ''
  });
  console.log('row', row);
  calculateTotal();
};


const calculateTotal = () => {
  quoteForm.subtotal = quoteForm.products.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  quoteForm.tax = parseFloat((quoteForm.subtotal * 0.0925).toFixed(2));
  quoteForm.total = parseFloat((quoteForm.subtotal + quoteForm.tax).toFixed(2));
};

const removeProduct = (index) => {
  quoteForm.products.splice(index, 1);
  calculateTotal();
};

const openProductSelector = () => {
  // 模拟添加一个商品，可替换为弹窗选择器逻辑
  quoteForm.products.push({
    type: '1',
    price: 0,
    materialId: selectedMaterialId.value,
    quantity: 1,
  });
  calculateTotal();
};

const submitQuote = () => {
  if (!quoteForm.customerPo) {
    ElMessage.error('客户订单号不能为空');
    return;
  }
  if (quoteForm.products.length === 0) {
    ElMessage.error('请至少添加一个商品');
    return;
  }
  const payload = {
    ...quoteForm,
    products: JSON.stringify(quoteForm.products) // ✅ 手动变成字符串
  };
  if (isEdit.value === 'edit') {
    updateQuote(payload).then(() => ElMessage.success('修改成功'));
  } else {
    addQuote(payload).then(() => ElMessage.success('创建成功'));
  }
  route.push('/order/quote');
};

const goBack = () => {
  route.back();
};
</script>

<style scoped>
.my-2 {
  margin: 16px 0;
}
</style>