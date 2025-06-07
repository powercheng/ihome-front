<template>
  <el-dialog :model-value="visible" title="拆单标签预览" width="90%" @close="onClose">

    <el-button type="primary" @click="printLabels" style="margin-bottom: 10px;">打印标签</el-button>

    <div class="label-print-area" ref="printArea">
      <div class="label-grid">
        <div class="label-cell" v-for="cell in flatCells" :key="cell.code">
          <div class="label-content">
            <div class="label-left">
              <div class="label-head">
                {{ invoice }} - {{ cell.number }} <br>
                {{ cell.code }}
              </div>
              <div class="label-body">
                {{ cell.width }} x {{ cell.height }} x {{ cell.depth }} <br>
                {{ cell.material }}
              </div>
            </div>
            <div class="label-right">
              <canvas :ref="el => registerCanvas(cell, el)" :width="500" :height="500"
                style="border: 1px solid #ccc;"></canvas>
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
  row: [Object, Array],
  invoice: {
    type: String,
    default: '0001'
  }
});

const emit = defineEmits(['update:visible']);

const onClose = () => {
  emit('update:visible', false);
};

const normalizedRows = computed(() => {
  return Array.isArray(props.row) ? props.row : [props.row];
});

function getPanelCell(panel, spec, number) {
  const cell = {};
  cell.specification = spec;
  cell.code = panel.code;
  cell.width = panel.width;
  cell.height = panel.height;
  cell.depth = panel.depth;
  cell.material = panel.material;
  cell.number = number;
  if (cell.code === "top panel") {
    cell.points = [
      { x: 0, y: 0 },
      { x: spec.width, y: 0 },
      { x: spec.width + spec.depth / 2, y: -spec.depth / 2 },
      { x: spec.depth / 2, y: -spec.depth / 2 }
    ];
  } else if (cell.code === "bottom panel") {
    cell.points = [
      { x: 0, y: spec.height },
      { x: spec.width, y: spec.height },
      { x: spec.width + spec.depth / 2, y: spec.height - spec.depth / 2 },
      { x: spec.depth / 2, y: spec.height - spec.depth / 2 }
    ];
  } else if (cell.code === "left panel") {
    cell.points = [
      { x: 0, y: 0 },
      { x: 0, y: spec.height },
      { x: spec.depth / 2, y: spec.height - spec.depth / 2 },
      { x: spec.depth / 2, y: -spec.depth / 2 }
    ];
  } else if (cell.code === "right panel") {
    cell.points = [
      { x: spec.width, y: 0 },
      { x: spec.width, y: spec.height },
      { x: spec.width + spec.depth / 2, y: spec.height - spec.depth / 2 },
      { x: spec.width + spec.depth / 2, y: -spec.depth / 2 }
    ];
  } else if (cell.code === "back panel") {
    cell.points = [
      { x: spec.depth / 2, y: -spec.depth / 2 },
      { x: spec.width + spec.depth / 2, y: -spec.depth / 2 },
      { x: spec.width + spec.depth / 2, y: -spec.depth / 2 + spec.height },
      { x: spec.depth / 2, y: -spec.depth / 2 + spec.height },
    ];
  }
  return cell;
}

function getFaceCell(face, spec, number) {
  console.log(face, spec, number);
  const cell = {};
  cell.specification = spec;
  cell.code = face.code;
  cell.width = face.width;
  cell.height = face.height;
  cell.depth = face.depth;
  cell.material = face.material;
  cell.number = number;
  if (face.code === "single left door") {
    cell.points = [
      { x: 0, y: 0 },
      { x: face.width, y: 0 },
      { x: face.width, y: face.height },
      { x: 0, y: face.height }
    ];
  } else if (face.code === "single right door") {
    cell.points = [
      { x: spec.width - face.width, y: 0 },
      { x: spec.width, y: 0 },
      { x: spec.width, y: face.height },
      { x: spec.width - face.width, y: face.height }
    ];
  } else if (face.code === "double door") {
    const halfWidth = face.width / 2;
    cell.points = [
      { x: spec.width / 2 - halfWidth, y: 0 },
      { x: spec.width / 2 + halfWidth, y: 0 },
      { x: spec.width / 2 + halfWidth, y: face.height },
      { x: spec.width / 2 - halfWidth, y: face.height }
    ];
  } else if (face.code === "drawer") {
    cell.points = [
      { x: (spec.width - face.width) / 2, y: 0 },
      { x: (spec.width + face.width) / 2, y: 0 },
      { x: (spec.width + face.width) / 2, y: face.height },
      { x: (spec.width - face.width) / 2, y: face.height }
    ];
  }
  return cell;
}

const flatCells = computed(() => {
  const cells = [];
  normalizedRows.value.forEach((row, index) => {
    const spec = typeof row.specification === 'string' ? JSON.parse(row.specification) : row.specification;
    cells.push({ specification: spec, code: row.code, width: row.width, height: row.height, depth: row.depth, material: row.materialId, number: index + 1 });
    spec.box?.forEach((panel) => {
      if (panel.material != '' && panel.material != 'plywood') {
        cells.push(getPanelCell(panel, spec, index + 1));
      }
    });
 /** 
    spec.shelves?.forEach((shelf, index) => {
      if (shelf.material != '' && shelf.material != 'plywood') {
        cells.push({ ...spec, type: 'shelf', idx: index, data: shelf });
      }
    });
    */
    spec.face?.forEach((face, index) => {
      cells.push(getFaceCell(face, spec, index + 1));
    });
 
  });
  return cells;
});

function registerCanvas(cell, el) {
  if (!(el instanceof HTMLCanvasElement)) return;
  nextTick(() => {
    drawBox(el, cell);
  });
}



const drawBox = (el, cell) => {
  const ctx = el.getContext('2d');
  if (!ctx) return;
  const { width, height, depth } = cell.specification;


  // 清空
  ctx.clearRect(0, 0, el.width, el.height);
  const canvasWidth = el.width;
  const canvasHeight = el.height;


  const padding = 40; // 留白空间

  // 考虑到 oblique depth 是 depth * 0.5（斜角）
  const projectedWidth = (width + depth * 0.5);
  const projectedHeight = (height + depth * 0.5);

  // 自动计算缩放比例，留出 padding
  const scaleX = (canvasWidth - padding * 2) / projectedWidth;
  const scaleY = (canvasHeight - padding * 2) / projectedHeight;
  const scale = Math.min(scaleX, scaleY);  // 取较小的，防止超出


  const drawDepth = depth * scale * 0.5;
  const offsetX = (canvasWidth - projectedWidth * scale) / 2;
  const offsetY = (canvasHeight - projectedHeight * scale) / 2 + drawDepth;



  ctx.strokeStyle = '#000';

  ctx.lineWidth = 0.75 * scale;

  const x = offsetX;
  const y = offsetY;

  const w = width * scale;
  const h = height * scale;
  const d = depth * scale * 0.5; // 斜角表示深度


  const panels = cell.specification.box || [];
  panels.forEach(panel => {
    if (panel.code === 'top panel') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + d, y - d);
      ctx.lineTo(x + w + d, y - d);
      ctx.lineTo(x + w, y);
      ctx.closePath();
      ctx.fillStyle = '#fff'; // 使用白色填充
      ctx.fill();             // 填充白色背景，遮住下面线条
      ctx.stroke();
    } else if (panel.code === 'bottom panel') {
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + d, y - d + h);
      ctx.lineTo(x + w + d, y - d + h);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fillStyle = '#fff'; // 使用白色填充
      ctx.fill();             // 填充白色背景，遮住下面线条
      ctx.stroke();
    } else if (panel.code === 'left panel') {
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y);
      ctx.lineTo(x + d, y - d);
      ctx.lineTo(x + d, y - d + h);
      ctx.closePath();
      ctx.fillStyle = '#fff'; // 使用白色填充
      ctx.fill();             // 填充白色背景，遮住下面线条
      ctx.stroke();
    } else if (panel.code === 'right panel') {
      ctx.beginPath();
      ctx.moveTo(x + w, y);
      ctx.lineTo(x + w + d, y - d);
      ctx.lineTo(x + w + d, y - d + h);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fillStyle = '#fff'; // 使用白色填充
      ctx.fill();             // 填充白色背景，遮住下面线条
      ctx.stroke();
    } else if (panel.code === 'back panel') {
      ctx.beginPath();
      ctx.moveTo(x + d, y - d);
      ctx.lineTo(x + d + w, y - d);
      ctx.lineTo(x + d + w, y + h - d);
      ctx.lineTo(x + d, y + h - d);
      ctx.closePath();
      ctx.fillStyle = '#fff'; // 使用白色填充
      ctx.fill();             // 填充白色背景，遮住下面线条
      ctx.stroke();
    }
  });

  /** ✅ 尺寸标注（可选） */
  ctx.font = "18px sans-serif";
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
  ctx.moveTo(x + w, y + h);
  ctx.lineTo(x + w + d, y + h - d);
  ctx.fillText(`${depth}"`, x + w + d / 2 + 30, y + h - d / 2 + 10);


  // 层板分布
  const shelfCount = cell.specification.shelves.length;
  if (shelfCount > 0) {
    const shelfThickness = 0.75 * scale;
    const availableHeight = h - 2 * shelfThickness;
    const gap = availableHeight / (shelfCount + 1);
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
  const faces = cell.specification.face;

  faces.forEach((face) => {
    const sectionHeight = face.height * scale; // 使用 face 的高度作为区块高度

    // 背景颜色
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, currentY, w, sectionHeight);
    ctx.strokeRect(x, currentY, w, sectionHeight);

    // 把手位置
    ctx.beginPath();
    if (face.code === 'drawer') {
      // 抽屉把手在中间
      ctx.moveTo(x + w / 2 - 10, currentY + sectionHeight / 2);
      ctx.lineTo(x + w / 2 + 10, currentY + sectionHeight / 2);
    } else if (face.code === 'single left door') {
      // 把手在右边中间
      ctx.moveTo(x + w - 10, currentY + sectionHeight / 2 - 10);
      ctx.lineTo(x + w - 10, currentY + sectionHeight / 2 + 10);
    } else if (face.code === 'single right door') {
      // 把手在左边中间
      ctx.moveTo(x + 10, currentY + sectionHeight / 2 - 10);
      ctx.lineTo(x + 10, currentY + sectionHeight / 2 + 10);
    } else if (face.code === 'double door') {
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

  if (cell.points?.length === 4) {
    ctx.beginPath();
    ctx.moveTo(x + cell.points[0].x * scale, y + cell.points[0].y * scale);
    ctx.lineTo(x + cell.points[1].x * scale, y + cell.points[1].y * scale);
    ctx.lineTo(x + cell.points[2].x * scale, y + cell.points[2].y * scale);
    ctx.lineTo(x + cell.points[3].x * scale, y + cell.points[3].y * scale);
    ctx.closePath();

    ctx.fillStyle = "rgba(210, 210, 210, 0.6)"; // 面板颜色
    ctx.fill();             // 用来遮挡下面的线条
    ctx.stroke();
  }

};

const printLabels = () => {
  const printWindow = window.open('', '', 'width=800,height=600');
  const cells = document.querySelectorAll('.label-cell');

  let html = `
    <html>
      <head>
        <title>打印标签</title>
        <style>
          @page { size: A4; margin: 0mm; }
          body { font-family: sans-serif; }

          .label-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8mm;
            page-break-inside: avoid;
          }

          .label-cell {
            border: 1px solid #999;
            padding: 4mm;
            background-color: #fff;
            box-sizing: border-box;
            page-break-inside: avoid;
          }

          .label-content {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            gap: 6mm;
          }

          .label-left {
            flex: 1;
            font-size: 10pt;
            line-height: 1.4;
          }

          .label-head {
            font-weight: bold;
            margin-bottom: 2mm;
            font-size: 11pt;
          }

          .label-body {
            font-size: 10pt;
          }

          .label-right img {
            max-width: 20mm;
            height: auto;
            border: 1px solid #ccc;
          }
        </style>
      </head>
      <body>
        <div class="label-grid">
  `;

  cells.forEach(cell => {
    const leftContent = cell.querySelector('.label-left')?.outerHTML || '';
    const canvas = cell.querySelector('canvas');
    const dataUrl = canvas?.toDataURL('image/png') || '';
    const image = `<div class="label-right"><img src="${dataUrl}" /></div>`;

    html += `
      <div class="label-cell">
        <div class="label-content">
          ${leftContent}
          ${image}
        </div>
      </div>
    `;
  });

  html += `
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  setTimeout(() => {
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 1000);
};




</script>

<style scoped>
.label-print-area {
  padding: 10mm;
}

.label-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10mm;
  page-break-inside: avoid;
}

.label-cell {
  border: 1px solid #999;
  padding: 5mm;
  background-color: #fff;
  box-sizing: border-box;
  height: auto;
}

.label-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.label-left {
  flex: 1;
  font-size: 12pt;
  padding-right: 4mm;
}

.label-right canvas {
  width: 50mm !important;
  height: 50mm !important;
  border: 1px solid #ccc;
}
</style>
