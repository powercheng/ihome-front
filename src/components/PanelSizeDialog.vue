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
              {{ cell.data.code }} {{ cell.data.width }}x{{ cell.data.height }}x{{ cell.data.depth }}
            <canvas
            :ref="el => registerCanvas(index, el)"
            :width="((cell.data.width || 60) + (cell.data.depth)) * 5"
            :height="((cell.data.height || 90) + (cell.data.depth || 30)) * 5"
            class="mini-canvas"
          />
            </div>
            
            <div v-else>
              {{ cell.data.type }} {{ cell.data.width }} x {{ cell.data.height }}
              <br />material: {{ cell.face.material }}
                        <canvas
            :ref="el => registerCanvas(index, el)"
            :width="(cell.data.width || 60) * 5"
            :height="(cell.data.height || 90) * 5"
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
    cells.push({ ...spec, type: 'box' , data: {code:row.code, width: row.width, height: row.height, depth: row.depth}});
    spec.box.panels?.forEach((panel,index) => {
        if (panel.material != '' && panel.material != 'plywood') {
            cells.push({ ...spec, type: 'panel', idx: index, data: panel});
        }});
    spec.box.shelves?.forEach((shelf, index) => {
        if (shelf.material != '' && shelf.material != 'plywood') {
            cells.push({ ...spec, type: 'shelf', idx: index, data: shelf });
        }
    });
    spec.face?.forEach((face,index) => {
        if (face.material != '' && face.material != 'plywood') {
            cells.push({ ...spec, type: 'face', idx: index, data: face });
        } 
    });
  });
  return cells;
});

function registerCanvas(index, el) {
  if (!(el instanceof HTMLCanvasElement)) return;
  nextTick(() => {
    const cell = flatCells.value[index];
    drawBox(el, cell);
  });
}



const drawBox = (el, cell) => {
    console.log('Drawing box for cell:', cell);
    
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const { width, height, depth } = cell.box;

    // 清空
    ctx.clearRect(0, 0, el.width, el.height);
    ctx.strokeStyle = '#000';
    const scale = 5;
    ctx.lineWidth = 0.75 * scale;

    const x = 0;
    const y = depth*scale;

    const w = width * scale;
    const h = height * scale;
    const d = depth * scale * 0.5; // 斜角表示深度
    

    const panels = cell.box.panels || [];
    panels.forEach(panel => {
        if (panel.panelName === 'top') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + d, y - d);
            ctx.lineTo(x + w + d, y - d);
            ctx.lineTo(x + w, y);
            ctx.closePath();
            ctx.stroke(); 
        } else if (panel.panelName === 'bottom1') {
            ctx.setLineDash([5, 5]); // 虚线
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + d, y + h - d);
            ctx.lineTo(x + w + d, y + h - d);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]); // 清除虚线
        } else if (panel.panelName === 'left1') {
            ctx.setLineDash([5, 5]); // 虚线
            ctx.beginPath();
            ctx.moveTo(x, y+h);
            ctx.lineTo(x, y);
            ctx.lineTo(x + d, y - d);
            ctx.lineTo(x + d, y - d + h);
            ctx.stroke();
            ctx.setLineDash([]); // 清除虚线
        } else if (panel.panelName === 'right') {
            ctx.beginPath();
            ctx.moveTo(x + w, y);
            ctx.lineTo(x + w + d, y - d);
            ctx.lineTo(x + w + d, y - d + h);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.stroke();
        } else if (panel.panelName === 'back1') {
            ctx.setLineDash([5, 5]); // 虚线
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x, y + h);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]); // 清除虚线
        }
    });


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
    const shelfCount = cell.box.shelves.length;
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
    const faces = cell.face;
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
