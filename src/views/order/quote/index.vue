<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="customer_po" prop="customerPo">
        <el-input
          v-model="queryParams.customerPo"
          placeholder="请输入customer_po"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="$router.push('/order/add')"
          v-hasPermi="['order:quote:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:quote:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:quote:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:quote:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="quoteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="customer_po" align="center" prop="customerPo" />
      <el-table-column label="subtotal" align="center" prop="subtotal" />
      <el-table-column label="tax" align="center" prop="tax" />
      <el-table-column label="total" align="center" prop="total" />
      <el-table-column label="update_time" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openConvertDialog(scope.row)">order</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:quote:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:quote:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />


    <el-dialog
  v-model="convertDialogVisible"
  title="make a order"
  width="600px"
>
  <el-form :model="orderForm" label-width="120px">
    <el-form-item label="customer po">
      <el-input v-model="orderForm.customerPo" disabled />
    </el-form-item>
    <el-form-item label="recipient">
      <el-input v-model="orderForm.deliveryName" placeholder="请输入收货人姓名" />
    </el-form-item>
    <el-form-item label="deliverry address">
      <el-input v-model="orderForm.deliveryAddress" placeholder="请输入收货地址" />
    </el-form-item>
    <el-form-item label="note">
      <el-input type="textarea" v-model="orderForm.note" placeholder="请输入备注（可选）" />
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button @click="convertDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="confirmConvert">确认转换</el-button>
  </template>
</el-dialog>

    <!-- 添加或修改报价对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="quoteRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="customer_po" prop="customerPo">
          <el-input v-model="form.customerPo" placeholder="请输入customer_po" />
        </el-form-item>
        <el-form-item label="subtotal" prop="subtotal">
          <el-input v-model="form.subtotal" placeholder="请输入subtotal" />
        </el-form-item>
        <el-form-item label="tax" prop="tax">
          <el-input v-model="form.tax" placeholder="请输入tax" />
        </el-form-item>
        <el-form-item label="total" prop="total">
          <el-input v-model="form.total" placeholder="请输入total" />
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

<script setup name="Quote">
import { listQuote, getQuote, delQuote, addQuote, updateQuote } from "@/api/order/quote";
import { addOrders } from '@/api/order/orders';



const { proxy } = getCurrentInstance();

const quoteList = ref([]);
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
    customerPo: null,
  },
  rules: {
    customerPo: [
      { required: true, message: "customer_po不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询报价列表 */
function getList() {
  loading.value = true;
  listQuote(queryParams.value).then(response => {
    quoteList.value = response.rows;
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
    customerPo: null,
    products: null,
    subtotal: null,
    tax: null,
    total: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("quoteRef");
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
  title.value = "添加报价";
}


const convertDialogVisible = ref(false);

const orderForm = reactive({
  quoteId: null,
  customerPo: '',
  deliveryName: '',
  deliveryAddress: '',
  note: ''
});

const openConvertDialog = (quote) => {
  console.log(quote);

  // 自动带入 customer_po
  orderForm.quoteId = quote.id;
  orderForm.customerPo = quote.customerPo;
  orderForm.deliveryName = '';
  orderForm.deliveryAddress = '';
  orderForm.note = '';
  convertDialogVisible.value = true;
};

/** quote转为order操作 */
const confirmConvert = () => {
  if (!orderForm.deliveryName || !orderForm.deliveryAddress) {
    ElMessage.error('please fill in the recipient and delivery address');
    return;
  }
  addOrders(orderForm).then(() => {
    convertDialogVisible.value = false;
  });
};


/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getQuote(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改报价";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["quoteRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateQuote(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addQuote(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除报价编号为"' + _ids + '"的数据项？').then(function() {
    return delQuote(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/quote/export', {
    ...queryParams.value
  }, `quote_${new Date().getTime()}.xlsx`)
}

getList();
</script>
