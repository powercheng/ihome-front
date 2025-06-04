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
import { he } from 'element-plus/es/locales.mjs';
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
        } catch (e) {
            localJsonData.value = defaultSpec(props.row);
        }
    }
});

const recalculatePanels = () => {
    const box = localJsonData.value.box;
    localJsonData.value.box.panels = [
        {
            panelName: 'top',
            width: box.width,
            height: box.depth,
            depth: 0.75,
            material: getPanel('top').material,
            price: getPanel('top').price
        },
        {
            panelName: 'bottom',
            width: box.width,
            height: box.depth,
            depth: 0.75,
            material: getPanel('bottom').material,
            price: getPanel('bottom').price
        },
        {
            panelName: 'left',
            width: box.depth,
            height: box.height,
            depth: 0.75,
            material: getPanel('left').material,
            price: getPanel('left').price
        },
        {
            panelName: 'right',
            width: box.depth,
            height: box.height,
            depth: 0.75,
            material: getPanel('right').material,
            price: getPanel('right').price
        },
        {
            panelName: 'back',
            width: box.width,
            height: box.height,
            depth: 0.25,
            material: getPanel('back').material,
            price: getPanel('back').price
        }
    ];
};

const getPanel = (name) => {
    return localJsonData.value.box.panels?.find(p => p.panelName === name) || {};
};

const defaultSpec = (row) => ({
    box: {
        width: row.width || 0,
        height: row.height || 0,
        depth: row.depth || 0,
        material: 'plywood',
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
        depth: 0.75,
        material: '',
        price: 0
    });
};

const removeFace = (index) => {
    localJsonData.value.face.splice(index, 1);
};

const canvas = ref(null);
const drawBox = () => {
    const ctx = canvas.value?.getContext('2d');
    if (!ctx) return;
    const { width, height, depth } = localJsonData.value.box;

    // 清空
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.strokeStyle = '#000';
    const scale = 5;
    ctx.lineWidth = 0.75 * scale;

    const x = 100;
    const y = 100;

    const w = width * scale;
    const h = height * scale;
    const d = depth * scale * 0.5; // 斜角表示深度
    

    const panels = localJsonData.value.box.panels || [];
    panels.forEach(panel => {
        if (panel.panelName === 'top') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + d, y - d);
            ctx.lineTo(x + w + d, y - d);
            ctx.lineTo(x + w, y);
            ctx.closePath();
            ctx.stroke(); 
        } else if (panel.panelName === 'bottom') {
            /** 
            ctx.setLineDash([5, 5]); // 虚线
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + d, y + h - d);
            ctx.lineTo(x + w + d, y + h - d);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]); // 清除虚线
            */
        } else if (panel.panelName === 'left') {
            /** 
            ctx.setLineDash([5, 5]); // 虚线
            ctx.beginPath();
            ctx.moveTo(x, y+h);
            ctx.lineTo(x, y);
            ctx.lineTo(x + d, y - d);
            ctx.lineTo(x + d, y - d + h);
            ctx.stroke();
            ctx.setLineDash([]); // 清除虚线
            */
        } else if (panel.panelName === 'right') {
            ctx.beginPath();
            ctx.moveTo(x + w, y);
            ctx.lineTo(x + w + d, y - d);
            ctx.lineTo(x + w + d, y - d + h);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.stroke();
        } else if (panel.panelName === 'back') {
            /** 
            ctx.setLineDash([5, 5]); // 虚线
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x, y + h);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]); // 清除虚线
            */
        }
    });




    /** ✅ 尺寸标注（可选） */
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";

    // width 标注
    ctx.beginPath();
    ctx.moveTo(x, y + h + 10);
    ctx.lineTo(x + w, y + h + 10);
    ctx.fillText(`${width}"`, x + w / 2, y + h + 24);

    // height 标注
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 10, y + h);
    ctx.fillText(`${height}"`, x - 24, y + h / 2 + 4);

    // depth 标注
    ctx.beginPath();
    ctx.moveTo(x + w + 10, y + h);
    ctx.lineTo(x + w + d + 10, y + h - d);
    ctx.fillText(`${depth}"`, x + w + d / 2 + 10, y + h - d / 2 + 4);


    // 层板分布
    const shelfCount = localJsonData.value.box.shelves.length;
    if (shelfCount > 0) {
        const shelfThickness = 0.75 * scale;
        const availableHeight = h - 2 * shelfThickness;
        const gap = availableHeight / (shelfCount + 1);

        ctx.strokeStyle = '#1976d2';
        ctx.fillStyle = '#1976d2';
        ctx.font = '12px sans-serif';

        for (let i = 1; i <= shelfCount; i++) {
            const shelfY = y + shelfThickness + i * gap;
            ctx.beginPath();
            ctx.moveTo(x, shelfY);
            ctx.lineTo(x + w, shelfY);
            ctx.stroke();

            // 斜线表示厚度
            ctx.beginPath();
            ctx.moveTo(x + w, shelfY);
            ctx.lineTo(x + w + d, shelfY - d);
            ctx.stroke();

        }
    }
    // 画 face 区块（每一层门或抽屉）

    let currentY = y;
    const totalHeight = h;
    const faces = localJsonData.value.face;
    const totalUnitHeight = faces.reduce((sum, f) => sum + f.height, 0);

    faces.forEach((face, index) => {
        console.log('Drawing face section', index, face);
        const heightRatio = face.height / totalUnitHeight;
        const sectionHeight = heightRatio * totalHeight;

        // 背景颜色
        //ctx.fillStyle = '#b0b0b0';
        //ctx.fillRect(x, currentY, w, sectionHeight);
        ctx.strokeRect(x, currentY, w, sectionHeight);

        // 把手位置
        ctx.beginPath();
        if (face.type === 'drawer') {
            // 抽屉把手在中间
            ctx.moveTo(x + w / 2 - 10, currentY + sectionHeight / 2);
            ctx.lineTo(x + w / 2 + 10, currentY + sectionHeight / 2);
        } else if (face.type === 'single left door') {
            // 把手在右边中间
            ctx.moveTo(x + w - 10, currentY + sectionHeight / 2 - 10);
            ctx.lineTo(x + w - 10, currentY + sectionHeight / 2 + 10);
        } else if (face.type === 'single right door') {
            // 把手在左边中间
            ctx.moveTo(x + 10, currentY + sectionHeight / 2 - 10);
            ctx.lineTo(x + 10, currentY + sectionHeight / 2 + 10);
        } else if (face.type === 'double door') {
            // 左右门把手
            ctx.moveTo(x + w / 2 - 12, currentY + sectionHeight / 2 - 10);
            ctx.lineTo(x + w / 2 - 12, currentY + sectionHeight / 2 + 10);
            ctx.moveTo(x + w / 2 + 12, currentY + sectionHeight / 2 - 10);
            ctx.lineTo(x + w / 2 + 12, currentY + sectionHeight / 2 + 10);

            // 中间分隔线（门缝）
            ctx.moveTo(x + w / 2, currentY);
            ctx.lineTo(x + w / 2, currentY + sectionHeight);
        }
        ctx.stroke();
        currentY += sectionHeight;
    });
    
};


// 动态监听尺寸变化
watch(() => localJsonData.value, () => {
    nextTick(() => drawBox());
}, { deep: true });

onMounted(() => {
    nextTick(drawBox);
});

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

<style scoped>
.mini-canvas {
    margin-left: 10px;
    border: 1px solid #000;
}
</style>