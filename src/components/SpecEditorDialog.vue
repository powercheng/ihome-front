<template>
    <div>
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

                <el-table :data="localJsonData.box.panels" style="width: 100%" size="small"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column prop="panelName" label="position" width="100" align="center" />
                    <el-table-column label="width" align="center">
                        <template #default="scope">
                            {{ scope.row.width }}
                        </template>
                    </el-table-column>
                    <el-table-column label="height" align="center">
                        <template #default="scope">
                            {{ scope.row.height }}
                        </template>
                    </el-table-column>
                    <el-table-column label="depth" align="center">
                        <template #default="scope">
                            {{ scope.row.depth }}
                        </template>
                    </el-table-column>
                    <el-table-column label="material" align="center">
                        <template #default="scope">
                            <el-input v-model="scope.row.material" />
                        </template>
                    </el-table-column>
                    <el-table-column label="price" align="center">
                        <template #default="scope">
                            <el-input-number v-model="scope.row.price" :min="0" />
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
                    <el-table-column label="type" width="150">
                        <template #default="scope">
                            <el-select v-model="scope.row.type" placeholder="请选择">
                                <el-option label="single left door" value="single left door" />
                                <el-option label="single right door" value="single right door" />
                                <el-option label="double door" value="double door" />
                                <el-option label="drawer" value="drawer" />
                            </el-select>
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

            <canvas ref="canvas" :width="500" :height="400" style="border: 1px solid #ccc;"></canvas>

            <template #footer>
                <el-button @click="onClose">取消</el-button>
                <el-button type="primary" @click="onSave">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
const props = defineProps({
    modelValue: Boolean,
    row: Object
});
const emits = defineEmits(['update:modelValue', 'save']);

const dialogVisible = ref(false);
const currentRow = ref(null);
const localJsonData = ref({});

watch(() => props.modelValue, (val) => {
    dialogVisible.value = val;
    if (val && props.row) {
        currentRow.value = props.row;
        try {
            const spec = typeof props.row.specification === 'string'
                ? JSON.parse(props.row.specification)
                : props.row.specification;
            localJsonData.value = JSON.parse(JSON.stringify(spec || defaultSpec(props.row)));
            console.log('Loaded spec:', localJsonData.value);
        } catch (e) {
            localJsonData.value = defaultSpec(props.row);
        }
    }
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

    updatePanel('left', { width: depth, height: height, depth: 0.75 });
    updatePanel('right', { width: depth, height: height, depth: 0.75 });
    updatePanel('bottom', { width: width, height: depth, depth: 0.75 });
    updatePanel('top', { width: width, height: depth, depth: 0.75 });
    updatePanel('back', { width: width, height: height, depth: 0.75 });
};

const defaultSpec = (row) => ({
    box: {
        width: row.width || 0,
        height: row.height || 0,
        depth: row.depth || 0,
        panels: [],
        shelves: []
    },
    face: [],
    Accessories: []
});

// === 核心逻辑略 ===
const addShelf = () => {
    const box = localJsonData.value.box;
    const shelfCount = box.shelves.length + 1;
    const shelfThickness = 0.75;
    const totalGap = box.height - shelfThickness * (2 + shelfCount);
    const gap = totalGap / (shelfCount + 1);

    // 重新计算已有层板的 position
    for (let i = 0; i < shelfCount - 1; i++) {
        box.shelves[i].position = (shelfThickness + gap) * (i + 1);
    }

    // 新增的层板
    const newShelf = {
        type: 'adjustable',
        width: box.width || 0,
        height: shelfThickness,
        depth: box.depth || 0,
        position: box.height - gap - 1.5,
        material: 'plywood',
        price: 0
    };

    box.shelves.push(newShelf);
};

const removeShelf = (index) => {
    localJsonData.value.box.shelves.splice(index, 1);
};

const addFace = () => {
    localJsonData.value.face.push({
        type: '',
        width: localJsonData.value.box.width,
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



const onClose = () => {
    emits('update:modelValue', false);
};

const onSave = () => {
    const updated = {
        ...currentRow.value,
        specification: JSON.stringify(localJsonData.value),
        width: localJsonData.value.box.width,
        height: localJsonData.value.box.height,
        depth: localJsonData.value.box.depth
    };
    emits('save', updated);
    emits('update:modelValue', false);
};
</script>