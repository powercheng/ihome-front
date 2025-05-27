<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="customer po" prop="customerPo">
        <el-input
          v-model="queryParams.customerPo"
          placeholder="请输入customer po"
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
          @click="handleAdd"
          v-hasPermi="['order:orders:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:orders:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:orders:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:orders:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ordersList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="order no" align="center" prop="id" />
      <el-table-column label="quote no" align="center" prop="quoteId" />
      <el-table-column label="customer po" align="center" prop="customerPo" />
      <el-table-column label="recipient" align="center" prop="deliveryName" />
      <el-table-column label="delivery address" align="center" prop="deliveryAddress" />
      <el-table-column label="estimated ship date" align="center" prop="estimatedShipDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.estimatedShipDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ship date" align="center" prop="shipDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.shipDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="status" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="note" align="center" prop="note" />
      <el-table-column label="created by" align="center" prop="createBy" />
      <el-table-column label="order date" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:orders:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:orders:remove']">删除</el-button>
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

    <!-- 添加或修改orders对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="ordersRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="quote_no" prop="quoteId">
          <el-input v-model="form.quoteId" placeholder="请输入quote_no" />
        </el-form-item>
        <el-form-item label="customer po" prop="customerPo">
          <el-input v-model="form.customerPo" placeholder="请输入customer po" />
        </el-form-item>
        <el-form-item label="recipient" prop="deliveryName">
          <el-input v-model="form.deliveryName" placeholder="请输入recipient" />
        </el-form-item>
        <el-form-item label="delivery address" prop="deliveryAddress">
          <el-input v-model="form.deliveryAddress" placeholder="请输入delivery address" />
        </el-form-item>
        <el-form-item label="estimated ship date" prop="estimatedShipDate">
          <el-date-picker clearable
            v-model="form.estimatedShipDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择estimated ship date">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="ship date" prop="shipDate">
          <el-date-picker clearable
            v-model="form.shipDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择ship date">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="status" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in order_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="note" prop="note">
          <el-input v-model="form.note" type="textarea" placeholder="请输入内容" />
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

<script setup name="Orders">
import { listOrders, getOrders, delOrders, addOrders, updateOrders } from "@/api/order/orders";

const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict('order_status');

const ordersList = ref([]);
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
    quoteId: null,
    customerPo: null,
    deliveryName: null,
    deliveryAddress: null,
    estimatedShipDate: null,
    shipDate: null,
    status: null,
    note: null,
  },
  rules: {
    customerPo: [
      { required: true, message: "customer po不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询orders列表 */
function getList() {
  loading.value = true;
  listOrders(queryParams.value).then(response => {
    ordersList.value = response.rows;
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
    quoteId: null,
    customerPo: null,
    deliveryName: null,
    deliveryAddress: null,
    estimatedShipDate: null,
    shipDate: null,
    status: null,
    note: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("ordersRef");
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
  title.value = "添加orders";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOrders(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改orders";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ordersRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOrders(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOrders(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除orders编号为"' + _ids + '"的数据项？').then(function() {
    return delOrders(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/orders/export', {
    ...queryParams.value
  }, `orders_${new Date().getTime()}.xlsx`)
}

getList();
</script>
