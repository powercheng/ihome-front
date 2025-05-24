<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="name" prop="name" label-width="68px">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入name"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="phone" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入phone"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="follower" prop="follower">
        <el-select v-model="queryParams.follower" placeholder="请选择follower" clearable>
          <el-option
            v-for="dict in employee"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="designer" prop="designer">
        <el-select v-model="queryParams.designer" placeholder="请选择designer" clearable>
          <el-option
            v-for="dict in designer"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="source" prop="source">
        <el-select v-model="queryParams.source" placeholder="请选择source" clearable>
          <el-option
            v-for="dict in customer_from"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="category" prop="category">
        <el-select v-model="queryParams.category" placeholder="请选择category"  clearable>
          <el-option
            v-for="dict in customer_category"
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
      <el-form-item label="current_status" prop="currentStatus">
        <el-select v-model="queryParams.currentStatus" placeholder="请选择current_status" clearable>
          <el-option
            v-for="dict in customer_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['customer:customer:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['customer:customer:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['customer:customer:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['customer:customer:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="name" align="center" prop="name" />
      <el-table-column label="phone" align="center" prop="phone" />
      <el-table-column label="follower" align="center" prop="follower">
        <template #default="scope">
          <dict-tag :options="employee" :value="scope.row.follower"/>
        </template>
      </el-table-column>
      <el-table-column label="designer" align="center" prop="designer">
        <template #default="scope">
          <dict-tag :options="designer" :value="scope.row.designer"/>
        </template>
      </el-table-column>
      <el-table-column label="source" align="center" prop="source">
        <template #default="scope">
          <dict-tag :options="customer_from" :value="scope.row.source"/>
        </template>
      </el-table-column>
      <el-table-column label="category" align="center" prop="category">
        <template #default="scope">
          <dict-tag :options="customer_category" :value="scope.row.category"/>
        </template>
      </el-table-column>
      <el-table-column label="create_date" align="center" prop="createDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="current_status" align="center" prop="currentStatus">
        <template #default="scope">
          <dict-tag :options="customer_status" :value="scope.row.currentStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" @click="navEstimate(scope.row)" v-hasPermi="['order:estimate:add']">estimate</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['customer:customer:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['customer:customer:remove']">删除</el-button>
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

    <!-- 添加或修改customer对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="first_name" prop="name">
          <el-input v-model="form.name" placeholder="请输入name" />
        </el-form-item>

        <el-form-item label="company" prop="company">
          <el-input v-model="form.company" placeholder="请输入company" />
        </el-form-item>
        <el-form-item label="phone" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入phone" />
        </el-form-item>
        <el-form-item label="note" prop="note">
          <el-input v-model="form.note" placeholder="请输入note" />
        </el-form-item>
        <el-form-item label="follower" prop="follower">
          <el-select v-model="form.follower" placeholder="请选择follower">
            <el-option
              v-for="dict in employee"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="designer" prop="designer">
          <el-select v-model="form.designer" placeholder="请选择designer">
            <el-option
              v-for="dict in designer"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="source" prop="source">
          <el-select v-model="form.source" placeholder="请选择source">
            <el-option
              v-for="dict in customer_from"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="category" prop="category">
          <el-select v-model="form.category" placeholder="请选择category">
            <el-option
              v-for="dict in customer_category"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
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
        <el-form-item label="current_status" prop="currentStatus">
          <el-select v-model="form.currentStatus" placeholder="请选择current_status">
            <el-option
              v-for="dict in customer_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
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

<script setup name="Customer">
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer } from "@/api/customer/customer";

const { proxy } = getCurrentInstance();
const { customer_category, employee, customer_from, customer_status, designer } = proxy.useDict('customer_category', 'employee', 'customer_from', 'customer_status', 'designer');

const customerList = ref([]);
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
    name: null,
    phone: null,
    follower: null,
    designer: null,
    source: null,
    category: null,
    createDate: null,
    currentStatus: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询customer列表 */
function getList() {
  loading.value = true;
  listCustomer(queryParams.value).then(response => {
    customerList.value = response.rows;
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
    name: null,
    company: null,
    phone: null,
    note: null,
    follower: null,
    designer: null,
    source: null,
    category: null,
    createDate: null,
    currentStatus: null
  };
  proxy.resetForm("customerRef");
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
  title.value = "添加customer";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCustomer(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改customer";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCustomer(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomer(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除customer编号为"' + _ids + '"的数据项？').then(function() {
    return delCustomer(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('customer/customer/export', {
    ...queryParams.value
  }, `customer_${new Date().getTime()}.xlsx`)
}

getList();

function navEstimate(row) {
  proxy.$router.push({
    path: '/order/estimate',
    query: {
      customId: row.id,
      customerName: row.name,
      customerPhone: row.phone
    }
  })
}



</script>

<style>
.el-select,
.el-input {
  width: 200px !important;
}
</style>


