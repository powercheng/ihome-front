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
