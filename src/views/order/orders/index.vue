<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="customer_name" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入customer_name"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="customer_phone" prop="customerPhone">
        <el-input
          v-model="queryParams.customerPhone"
          placeholder="请输入customer_phone"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="current_status" prop="currentStatus" >
        <el-select v-model="queryParams.currentStatus" placeholder="请选择current_status" clearable style="width: 150px">
          <el-option
            v-for="dict in order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="is_delivery" prop="isDelivery">
        <el-select v-model="queryParams.isDelivery" placeholder="请选择is_delivery" clearable style="width: 100px">
          <el-option
            v-for="dict in is_delivery"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="is_install" prop="isInstall">
        <el-select v-model="queryParams.isInstall" placeholder="请选择is_install" clearable style="width: 100px">
          <el-option
            v-for="dict in is_install"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="create_date" prop="createDate">
        <el-date-picker clearable
          v-model="queryParams.createDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择create_date">
        </el-date-picker>
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
          v-hasPermi="['order:order:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:order:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:order:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:order:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="customer_name" align="center" prop="customerName" />
      <el-table-column label="customer_phone" align="center" prop="customerPhone" />
      <el-table-column label="customer_address" align="center" prop="customerAddress" />
      <el-table-column label="order_amount" align="center" prop="orderAmount" />
      <el-table-column label="delivery_date" align="center" prop="deliveryDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deliveryDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="current_status" align="center" prop="currentStatus">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.currentStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="is_delivery" align="center" prop="isDelivery">
        <template #default="scope">
          <dict-tag :options="is_delivery" :value="scope.row.isDelivery"/>
        </template>
      </el-table-column>
      <el-table-column label="is_install" align="center" prop="isInstall">
        <template #default="scope">
          <dict-tag :options="is_install" :value="scope.row.isInstall"/>
        </template>
      </el-table-column>
      <el-table-column label="create_date" align="center" prop="createDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:order:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:order:remove']">删除</el-button>
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

    <!-- 添加或修改order对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="estimate_id" prop="estimateId">
          <el-input v-model="form.estimateId" placeholder="请输入estimate_id" />
        </el-form-item>
        <el-form-item label="customer_name" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入customer_name" />
        </el-form-item>
        <el-form-item label="customer_phone" prop="customerPhone">
          <el-input v-model="form.customerPhone" placeholder="请输入customer_phone" />
        </el-form-item>
        <el-form-item label="customer_address" prop="customerAddress">
          <el-input v-model="form.customerAddress" placeholder="请输入customer_address" />
        </el-form-item>
        <el-form-item label="order_amount" prop="orderAmount">
          <el-input v-model="form.orderAmount" placeholder="请输入order_amount" />
        </el-form-item>
        <el-form-item label="delivery_date" prop="deliveryDate">
          <el-date-picker clearable
            v-model="form.deliveryDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择delivery_date">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="current_status" prop="currentStatus">
          <el-select v-model="form.currentStatus" placeholder="请选择current_status">
            <el-option
              v-for="dict in order_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="is_delivery" prop="isDelivery">
          <el-select v-model="form.isDelivery" placeholder="请选择is_delivery">
            <el-option
              v-for="dict in is_delivery"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="is_install" prop="isInstall">
          <el-select v-model="form.isInstall" placeholder="请选择is_install">
            <el-option
              v-for="dict in is_install"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="create_date" prop="createDate">
          <el-date-picker clearable
            v-model="form.createDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择create_date">
          </el-date-picker>
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

<script setup name="Order">
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/order/order";

const { proxy } = getCurrentInstance();
const { order_status, is_delivery, is_install } = proxy.useDict('order_status', 'is_delivery', 'is_install');

const orderList = ref([]);
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
    customerName: null,
    customerPhone: null,
    currentStatus: null,
    isDelivery: null,
    isInstall: null,
    createDate: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询order列表 */
function getList() {
  loading.value = true;
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows;
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
    estimateId: null,
    customerName: null,
    customerPhone: null,
    customerAddress: null,
    orderAmount: null,
    deliveryDate: null,
    currentStatus: null,
    isDelivery: null,
    isInstall: null,
    createDate: null
  };
  proxy.resetForm("orderRef");
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
  title.value = "添加order";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOrder(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改order";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOrder(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除order编号为"' + _ids + '"的数据项？').then(function() {
    return delOrder(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList();




watch(() => proxy.$route, (newVal, oldVal) => {
    console.log(newVal);
    if (newVal.path === '/order/orders' && !open.value) {
        console.log('从其他页面跳转到了目标页面');
        if (Object.keys(newVal.query).length > 0) {
            console.log('路由参数：', newVal.query);

            form.value.estimateId = newVal.query.estimateId;
            form.value.customerName = newVal.query.customerName;
            form.value.customerPhone = newVal.query.customerPhone;
            open.value = true;
            title.value = "修改estimate";
        }
    }
}, { immediate: true });
</script>
