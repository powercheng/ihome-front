<template>
  <el-dialog
    :model-value="visible"
    title="拆单标签预览"
    width="90%"
    @close="onClose"
  >
    <div class="label-grid">
      <div
        class="label-cell"
        v-for="(cell, index) in flatCells"
        :key="index"
      >
        <div class="label-head">{{ cell.code }}</div>
        <div class="label-body">
          <div class="label-info">
            <div v-if="cell.type === 'box'">
              {{ cell.code }} {{ cell.width }}x{{ cell.height }}x{{ cell.depth }}
            <canvas
            :ref="el => registerCanvas(index, el)"
            :width="(cell.width || 60) * 3"
            :height="(cell.height || 90) * 3"
            class="mini-canvas"
          />
            </div>
            
            <div v-else>
              {{ cell.face.type }} {{ cell.face.width }} x {{ cell.face.height }}
              <br />material: {{ cell.face.material }}
                        <canvas
            :ref="el => registerCanvas(index, el)"
            :width="(cell.width || 60) * 3"
            :height="(cell.height || 90) * 3"
            class="mini-canvas"
          />
            </div>
          </div>

        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick } from 'vue';

const props = defineProps({
  visible: Boolean,
  row: [Object, Array]
});

const emit = defineEmits(['update:visible']);

const onClose = () => {
  emit('update:visible', false);
};

const normalizedRows = computed(() => {
  return Array.isArray(props.row) ? props.row : [props.row];
});

const flatCells = computed(() => {
  const cells = [];
  normalizedRows.value.forEach(row => {
    const spec = typeof row.specification === 'string' ? JSON.parse(row.specification) : row.specification;
    cells.push({ ...row, type: 'box' });
    spec.face?.forEach(face => {
      cells.push({ ...row, type: 'face', face });
    });
  });
  return cells;
});

function registerCanvas(index, el) {
  if (!(el instanceof HTMLCanvasElement)) return;
  nextTick(() => {
    const cell = flatCells.value[index];
    drawFacePreview(el, cell);
  });
}

const drawBox = (el, cell) => {
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const { width, height, depth } = localJsonData.value.box;

    // 清空
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.strokeStyle = '#333';
    const scale = 5;
    ctx.lineWidth = 0.75 * scale;

    const x = 100;
    const y = 100;

    const w = width * scale;
    const h = height * scale;
    const d = depth * scale * 0.5; // 斜角表示深度

    // 正面矩形
    ctx.strokeRect(x, y, w, h);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";

    // 标记宽度
    ctx.beginPath();
    ctx.moveTo(x, y + h + 10);
    ctx.lineTo(x + w, y + h + 10);

    ctx.fillText(width, x + w / 2, y + h + 24);

    // 标记高度
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 10, y + h);

    ctx.fillText(height, x - 24, y + h / 2 + 4);

    // 深度线条
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + d, y - d);
    ctx.lineTo(x + d + w, y - d);
    ctx.lineTo(x + w, y);
    ctx.moveTo(x + w, y + h);
    ctx.lineTo(x + w + d, y + h - d);
    ctx.lineTo(x + w + d, y + h - d - h);
    ctx.lineTo(x + w, y);
    ctx.stroke();

    // 标记深度
    ctx.beginPath();
    ctx.moveTo(x + w + 10, y + h);
    ctx.lineTo(x + w + d + 10, y + h - d);
    ctx.fillText(depth, x + w + d / 2 + 10, y + h - d / 2 + 4);

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
        ctx.strokeStyle = '#4caf50';
        ctx.fillStyle = face.type.includes('drawer') ? '#ffe0b2' : '#bbdefb';
        ctx.fillRect(x, currentY, w, sectionHeight);
        ctx.strokeRect(x, currentY, w, sectionHeight);

        // 把手位置
        ctx.beginPath();
        ctx.strokeStyle = '#000';
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

function drawFacePreview(el, cell) {
  const ctx = el.getContext('2d');
  if (!ctx) return;
  const w = (cell.width || 60) * 3;
  const h = (cell.height || 90) * 3;
  ctx.clearRect(0, 0, el.width, el.height);
  ctx.strokeRect(0, 0, w, h);

  if (cell.type === 'face') {
    const sectionHeight = cell.face.height * 3;
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, w, sectionHeight);

    ctx.beginPath();
    ctx.strokeStyle = '#000';
    const type = cell.face.type;
    if (type === 'drawer') {
      ctx.moveTo(w / 2 - 5, sectionHeight / 2);
      ctx.lineTo(w / 2 + 5, sectionHeight / 2);
    } else if (type === 'single left door') {
      ctx.moveTo(w - 5, sectionHeight / 2 - 5);
      ctx.lineTo(w - 5, sectionHeight / 2 + 5);
    } else if (type === 'single right door') {
      ctx.moveTo(5, sectionHeight / 2 - 5);
      ctx.lineTo(5, sectionHeight / 2 + 5);
    } else if (type === 'double door') {
      ctx.moveTo(w / 2 - 5, sectionHeight / 2 - 5);
      ctx.lineTo(w / 2 - 5, sectionHeight / 2 + 5);
      ctx.moveTo(w / 2 + 5, sectionHeight / 2 - 5);
      ctx.lineTo(w / 2 + 5, sectionHeight / 2 + 5);
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, sectionHeight);
    }
    ctx.stroke();
  }
}
</script>

<style scoped>
.label-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-height: 80vh;
  overflow-y: auto;
}
.label-cell {
  border: 1px solid #ccc;
  padding: 10px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
}
.label-head {
  font-weight: bold;
  margin-bottom: 5px;
}
.label-body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}
.label-info {
  flex: 1;
  line-height: 1.4;
}
.mini-canvas {
  border: 1px solid #000;
  background: #fff;
}
</style>
