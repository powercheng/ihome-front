<template>
  <div class="app-container">
    <el-form :model="quoteForm" label-width="120px" ref="quoteRef">
      <el-form-item label="Customer PO">
        <el-input v-model="quoteForm.customerPo" placeholder="input customer info" />
      </el-form-item>

      <h3>Product List</h3>
<el-table :data="quoteForm.products" style="width: 100%" border>
  <el-table-column label="type" prop="type" align="center" min-width="80"/>
  <el-table-column label="code" prop="code" align="center" min-width="80"/>
  <el-table-column label="width" prop="width" align="center" min-width="50"/>
  <el-table-column label="height" prop="height" align="center" min-width="50"/>
  <el-table-column label="depth" prop="depth" align="center" min-width="50"/>
  <el-table-column label="description" prop="description" align="center" :show-overflow-tooltip="true" min-width="200"/>
  <el-table-column label="material" prop="material" align="center" min-width="80"/>
     <el-table-column label="specification" align="center" prop="specification" min-width="80">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditor(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
  <el-table-column label="price" prop="unit_price" align="center" min-width="50">
    <template #default="scope">
      ${{ scope.row.unit_price.toFixed(2) }}
    </template>
  </el-table-column>
  <el-table-column label="数量" prop="quantity" align="center" />
  <el-table-column label="总价" prop="total" align="center">
    <template #default="scope">
      ${{ (scope.row.unit_price * scope.row.quantity).toFixed(2) }}
    </template>
  </el-table-column>
  <el-table-column label="操作" align="center" width="100">
    <template #default="scope">
      <el-button type="danger" icon="Delete" @click="removeProduct(scope.$index)" circle />
    </template>
  </el-table-column>
</el-table>

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
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { addQuote } from '@/api/order/quote';

const router = useRouter();

const quoteForm = reactive({
  customerPo: '',
  products: [],
  subtotal: 0,
  tax: 0,
  total: 0
});

const calculateTotal = () => {
  quoteForm.subtotal = quoteForm.products.reduce(
    (sum, item) => sum + (item.unit_price * item.quantity),
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
    type: 'cabinet',
    code: 'B24',
    width: 24,
    height: 30,
    depth: 24,
    description: '示例描述',
    material: '示例材料',
    specification: null,
    unit_price: 100,
    quantity: 1,
    total: 100
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
  addQuote(payload).then(() => {
    ElMessage.success('报价提交成功');
    router.push('/order/quote');
  });
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.my-2 {
  margin: 16px 0;
}
</style>