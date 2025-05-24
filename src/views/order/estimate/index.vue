<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
            <el-form-item label="customer_name" prop="customerName">
                <el-input v-model="queryParams.customerName" placeholder="请输入customer_name" clearable
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="customer_phone" prop="customerPhone">
                <el-input v-model="queryParams.customerPhone" placeholder="请输入customer_phone" clearable
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Create_date" prop="createDate">
                <el-date-picker clearable v-model="queryParams.createDate" type="date" value-format="YYYY-MM-DD"
                    placeholder="请选择Create_date">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd"
                    v-hasPermi="['order:estimate:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                    v-hasPermi="['order:estimate:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                    v-hasPermi="['order:estimate:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasPermi="['order:estimate:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="estimateList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="id" align="center" prop="id" />
            <el-table-column label="customer_name" align="center" prop="customerName" />
            <el-table-column label="customer_phone" align="center" prop="customerPhone" />
            <el-table-column label="subTotal" align="center" prop="subTotal" />
            <el-table-column label="tax" align="center" prop="tax" />
            <el-table-column label="discount" align="center" prop="discount" />
            <el-table-column label="total" align="center" prop="total" />
            <el-table-column label="Create_date" align="center" prop="createDate" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" @click="navOrder(scope.row)"
                        v-hasPermi="['order:order:add']">order</el-button>
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['order:estimate:edit']">修改</el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['order:estimate:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改estimate对话框 -->
        <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
            <el-form ref="estimateRef" :model="form" :rules="rules" label-width="150px">
                <el-form-item label="customer_name" prop="customerName">
                    <el-input v-model="form.customerName" placeholder="请输入customer_name" />
                </el-form-item>
                <el-form-item label="customer_phone" prop="customerPhone">
                    <el-input v-model="form.customerPhone" placeholder="请输入customer_phone" />
                </el-form-item>

                <el-form-item label="Create_date" prop="createDate">
                    <el-date-picker clearable v-model="form.createDate" type="date" value-format="YYYY-MM-DD"
                        placeholder="请选择Create_date">
                    </el-date-picker>
                </el-form-item>
                <el-divider content-position="center">products</el-divider>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="manufacturer_id" prop="manufacturerId">
                            <el-select v-model="form.manufacturerId" placeholder="请选择manufacturer_id" clearable
                                @change="fetchColors">
                                <el-option v-for="dict in supplier" :key="dict.value" :label="dict.label"
                                    :value="parseInt(dict.value)" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="color" prop="color">
                            <el-select v-model="form.color" placeholder="请选择color" clearable>
                                <el-option v-for="color in supplierColor" :key="color.id" :label="color.color"
                                    :value="color.color" clearable />
                            </el-select>
                        </el-form-item>
                    </el-col>

                </el-row>


                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button type="primary" icon="Plus" @click="handleAddEstimateProducts">添加</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button type="danger" icon="Delete" @click="handleDeleteEstimateProducts">删除</el-button>
                    </el-col>
                    <el-col :span="17">
                        <el-input v-model="inputValue" placeholder="请输入内容" style="width: 100%"></el-input>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button type="info" plain icon="Upload" @click="handleImport"
                            v-hasPermi="['product:cabinet:import']">导入</el-button>
                    </el-col>
                </el-row>






                <el-table :data="estimateProductsList" :row-class-name="rowEstimateProductsIndex"
                    @selection-change="handleEstimateProductsSelectionChange" ref="estimateProducts">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column label="序号" align="center" prop="index" width="50" />
                    <el-table-column label="code2020" prop="2020code" width="150">
                        <template #default="scope">
                            {{ scope.row.code2020 }}
                        </template>
                    </el-table-column>
                    <el-table-column label="code" prop="productCode" width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.productCode" placeholder="" @input="handleInput(scope.row)" />
                            <el-dialog v-model="dialogVisible" title="搜索结果">
                                <ul>
                                    <li v-for="item in searchResults" :key="item.id"
                                        @click="addProductToEstimate(item, scope.row)">
                                        {{ item.code }} {{ item.description }}
                                    </li>
                                </ul>
                            </el-dialog>
                        </template>
                    </el-table-column>
                    <el-table-column label="description" prop="productDescription" width="200">
                        <template #default="scope">
                            <el-input v-model="scope.row.productDescription" placeholder="" />
                        </template>
                    </el-table-column>

                    <el-table-column label="unit price" prop="productPrice" width="100">
                        <template #default="scope">
                            <el-input v-model="scope.row.productPrice" placeholder="" />
                        </template>
                    </el-table-column>
                    <el-table-column label="QTY" prop="productCount" width="100">
                        <template #default="scope">
                            <el-input v-model="scope.row.productCount" placeholder="" />
                        </template>
                    </el-table-column>

                    <el-table-column label="amount" prop="productTotal" width="100">
                        <template #default="scope">
                            {{ calculateProductTotal(scope.row) }}
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100">
                        <template #default="scope">
                            <el-button type="danger" size="small"
                                @click="handleDeleteEstimateProductsRow(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>


                <el-form-item label="subTotal" prop="subTotal">
                    <el-input v-model="form.subTotal" placeholder="subTotal" />
                </el-form-item>
                <el-form-item label="discount" prop="discount">
                    <el-input v-model="form.discount" placeholder="请输入discount" />
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

<script setup name="Estimate">
import { listEstimate, getEstimate, delEstimate, addEstimate, updateEstimate } from "@/api/order/estimate";
import { listCabinet, queryByManuAndCode } from "@/api/product/cabinet";
import { listColor } from "@/api/product/color";
import { watch } from 'vue';
import { useRouter } from 'vue-router';

const { proxy } = getCurrentInstance();
const { supplier } = proxy.useDict('supplier');
const { xlnt_match } = proxy.useDict('xlnt_match');

const estimateList = ref([]);
const estimateProductsList = ref([]);
const open = ref(false);
const dialogVisible = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedEstimateProducts = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const supplierColor = ref([]);




const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerName: null,
        customerPhone: null,
        createDate: null,
    },
    rules: {
    },
});

const { queryParams, form, rules } = toRefs(data);


const searchCode = ref('');
// 搜索结果
const searchResults = ref([]);
const inputValue = ref('');
let timeoutId = null;



function navOrder(row) {
  proxy.$router.push({
    path: '/order/orders',
    query: {
      estimateId: row.id,
      customerName: row.customerName,
      customerPhone: row.customerPhone
    }
  })
}


watch(() => proxy.$route, (newVal, oldVal) => {
    console.log(newVal);
    if (newVal.path === '/order/estimate' && !open.value) {
        console.log('从其他页面跳转到了目标页面');
        if (Object.keys(newVal.query).length > 0) {
            console.log('路由参数：', newVal.query);

            form.value.customerId = newVal.query.customId;
            form.value.customerName = newVal.query.customerName;
            form.value.customerPhone = newVal.query.customerPhone;
            open.value = true;
            title.value = "修改estimate";
        }
    }
}, { immediate: true });



const handleInput = (row) => {
    if (timeoutId !== null) {
        clearTimeout(timeoutId); // 清除之前的定时器
    }
    timeoutId = setTimeout(() => {
        performSearch(row); // 延迟1秒后执行搜索
    }, 1000);
};




// 执行搜索的函数
const performSearch = async (row) => {
    try {
        dialogVisible.value = true;
        const cabinet = {
            pageNum: 1,
            pageSize: 25,
            code: row.productCode,
            manufacturerId: form.value.manufacturerId
        };
        const response = await listCabinet(cabinet);
        searchResults.value = response.rows; // 假设返回的数据格式为 { data: [ ... ] }
    } catch (error) {
        console.error('搜索失败:', error);
    }
};

const addProductToEstimate = (item, row) => {
    row.productCode = item.code;
    row.productDescription = item.description;
    if (item.price) {
        row.productPrice = item.price;
    } else {
        const selectedColor = supplierColor.value.find(color => form.value.color == color.color);
        const priceProperty = `price${selectedColor.priceGroup}`;
        row.productPrice = item[priceProperty];
    }

    row.productCount = 1;
    row.productTotal = row.productPrice * row.productCount;
    form.value.subTotal = estimateProductsList.value.reduce((acc, cur) => acc + cur.productTotal, 0);
    form.value.total = form.value.subTotal + form.value.tax;

    searchResults.value = [];
    searchCode.value = "";
    dialogVisible.value = false;
};

const calculateProductTotal = (row) => {
    row.productTotal = row.productPrice * row.productCount;
    form.value.subTotal = estimateProductsList.value.reduce((acc, cur) => acc + cur.productTotal, 0);
    return row.productTotal;
};




const fetchColors = async () => {
    if (form.value.manufacturerId) {
        try {
            const color = {
                pageNum: 1,
                pageSize: 25,
                manufacturerId: form.value.manufacturerId
            };
            const response = await listColor(color);
            supplierColor.value = response.rows;

        } catch (error) {
            console.error('Error fetching colors:', error);
            supplierColor.value = [];
        }
    } else {
        supplierColor.value = [];
    }
};


function findFirstDigitIndex(str) {
    for (let i = 0; i < str.length; i++) {
        if (!isNaN(str[i]) && str[i] !== ' ') {
            return i;
        }
    }
    return -1; // 如果没有找到数字，则返回 -1
}
function findMappedValue(prefix) {
    for (const entry of xlnt_match.value) {
        if (entry.label === prefix) {
            return entry.value;
        }
    }
    return null; // 如果没有找到映射值，则返回 null
}
function removeLeadingDigitsAndTrailingLetters(str) {
    // 去掉字符串前面所有连续的数字字符
    const regexLeadingDigits = /^\d+/;
    str = str.replace(regexLeadingDigits, '');

    // 去掉字符串后面所有非数字字符
    const regexNonDigitsAtEnd = /\D+$/;
    str = str.replace(regexNonDigitsAtEnd, '');
    return str;
}

const handleImport = async () => {
    if (!form.manufacturer_id || !form.color) {
        proxy.$modal.msgError('请选择 manufacturer_id 和 color');
        return;
    }
    if (inputValue.value) {
        const resultArr = inputValue.value.split(' ').filter(item => item.trim() !== '');
        for (let i = 0; i < resultArr.length; i++) {
            const item = resultArr[i];
            const obj = {};
            obj.code2020 = item;
            if (item.length > 0) {
                const newItem = removeLeadingDigitsAndTrailingLetters(item);
                console.log(newItem);
                const index = findFirstDigitIndex(newItem);
                if (index !== -1) {
                    const prefix = newItem.substring(0, index);
                    const suffix = newItem.substring(index);
                    // 根据字典映射表替换前缀
                    const mappedValue = findMappedValue(prefix);
                    if (mappedValue) {
                        obj.productCode = mappedValue + suffix;
                        try {
                            const cabinet = {
                                pageNum: 1,
                                pageSize: 25,
                                code: obj.productCode,
                                manufacturerId: form.value.manufacturerId
                            };
                            const response = await queryByManuAndCode(cabinet);
                            if (response.data) {
                                const cabinet = response.data;
                                obj.productDescription = cabinet.description;
                                if (cabinet.price) {
                                    obj.productPrice = cabinet.price;
                                } else {
                                    const selectedColor = supplierColor.value.find(color => form.value.color == color.color);
                                    console.log(selectedColor);
                                    const priceProperty = `price${selectedColor.priceGroup}`;
                                    obj.productPrice = cabinet[priceProperty];

                                }
                                obj.productCount = 1;
                                obj.productTotal = obj.productPrice * obj.productCount;
                            }
                            console.log(response);
                        } catch (error) {
                            console.error('Error input code:', error);
                        }
                    }
                }
            }
            estimateProductsList.value.push(obj);
        }
    } else {
        console.log('no input 2020 code');
    }
};




function chooseColor(color) {
    console.log(color);
}




/** 查询estimate列表 */
function getList() {
    loading.value = true;
    listEstimate(queryParams.value).then(response => {
        estimateList.value = response.rows;
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
        customerId: null,
        customerName: null,
        customerPhone: null,
        subTotal: 0,
        tax: null,
        taxRate: null,
        total: null,
        discount: null,
        createDate: null
    };
    estimateProductsList.value = [];
    proxy.resetForm("estimateRef");
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
    title.value = "添加estimate";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    const _id = row.id || ids.value
    getEstimate(_id).then(response => {
        form.value = response.data;
        estimateProductsList.value = response.data.estimateProductsList;
        open.value = true;
        title.value = "修改estimate";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["estimateRef"].validate(valid => {
        if (valid) {
            form.value.estimateProductsList = estimateProductsList.value;
            if (form.value.id != null) {
                updateEstimate(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addEstimate(form.value).then(response => {
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
    proxy.$modal.confirm('是否确认删除estimate编号为"' + _ids + '"的数据项？').then(function () {
        return delEstimate(_ids);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
}




/** ${subTable.functionName}序号 */
function rowEstimateProductsIndex({ row, rowIndex }) {
    row.index = rowIndex + 1;
}

/** ${subTable.functionName}添加按钮操作 */
function handleAddEstimateProducts() {
    let obj = {};
    obj.productCode = "";
    obj.productDescription = "";
    obj.productCount = "";
    obj.productPrice = "";
    obj.productTotal = "";
    estimateProductsList.value.push(obj);
}

/** ${subTable.functionName}删除按钮操作 */
function handleDeleteEstimateProducts() {
    if (checkedEstimateProducts.value.length == 0) {
        proxy.$modal.msgError("请先选择要删除的${subTable.functionName}数据");
    } else {
        const estimateProductss = estimateProductsList.value;
        const checkedEstimateProductss = checkedEstimateProducts.value;
        estimateProductsList.value = estimateProductss.filter(function (item) {
            return checkedEstimateProductss.indexOf(item.index) == -1
        });
        console.log(estimateProductsList);
    }
}

function handleDeleteEstimateProductsRow(row) {
    const estimateProductss = estimateProductsList.value;
    estimateProductsList.value = estimateProductss.filter(function (item) {
        return item.index != row.index;
    });
}

/** 复选框选中数据 */
function handleEstimateProductsSelectionChange(selection) {
    checkedEstimateProducts.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('order/estimate/export', {
        ...queryParams.value
    }, `estimate_${new Date().getTime()}.xlsx`)
}

getList();
</script>


<style>
input,
.el-input__inner {
    border-width: 5px;
    /* 边框宽度 */
    border-color: #007bff;
    /* 边框颜色 */
}
</style>