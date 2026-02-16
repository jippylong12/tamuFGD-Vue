<script setup>
import {FilterMatchMode} from "primevue/api";
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";

const props = defineProps(['tableData', 'dataLoading', 'tableHeaders',])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Professor': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
const selectedRow = ref(null);
const transformedData = computed(() => transformData());
const highestGPA = computed(() => getHighestGPA(transformedData.value));
const lowestGPA = computed(() => getLowestGPA(transformedData.value));
const avgGPA = computed(() => getAverageGPA(transformedData.value));
const gradeColumns = [
  {key: 'A', label: 'A', field: "% of A's", color: '#1b5e20'},
  {key: 'B', label: 'B', field: "% of B's", color: '#2e7d32'},
  {key: 'C', label: 'C', field: "% of C's", color: '#9e9d24'},
  {key: 'D', label: 'D', field: "% of D's", color: '#ef6c00'},
  {key: 'F', label: 'F', field: "% of F's", color: '#b71c1c'},
  {key: 'Q', label: 'Q', field: "% of Q Drop's", color: '#424242'},
];
const selectedGradeBuckets = computed(() => {
  const row = selectedRow.value || {};

  return gradeColumns.map((nextBucket) => {
    const normalizedValue = parsePercent(row[nextBucket.field]);
    return {
      ...nextBucket,
      value: normalizedValue,
    };
  });
});

const panelStorageKey = 'fgd-results-details-panel-state-v1';
const defaultPanelState = {
  width: 420,
  height: 390,
  x: 0,
  y: 120,
};
const minimumPanelWidth = 320;
const minimumPanelHeight = 280;
const panelState = ref({...defaultPanelState});
const panelPointerState = ref({
  activeMode: '',
  pointerId: null,
  originX: 0,
  originY: 0,
  panelX: 0,
  panelY: 0,
  panelW: 0,
  panelH: 0,
});
const panelStyle = computed(() => ({
  position: 'fixed',
  left: `${panelState.value.x}px`,
  top: `${panelState.value.y}px`,
  width: `${panelState.value.width}px`,
  height: `${panelState.value.height}px`,
}));

function getDefaultPanelState() {
  return {
    width: defaultPanelState.width,
    height: defaultPanelState.height,
    x: Math.max(16, window.innerWidth - defaultPanelState.width - 24),
    y: 120,
  };
}

function clampPanelState(nextState) {
  const maxX = Math.max(16, window.innerWidth - minimumPanelWidth - 16);
  const maxY = Math.max(16, window.innerHeight - minimumPanelHeight - 16);
  const nextWidth = Math.min(Math.max(minimumPanelWidth, nextState.width), window.innerWidth - 16);
  const nextHeight = Math.min(Math.max(minimumPanelHeight, nextState.height), window.innerHeight - 16);
  const nextX = Math.min(Math.max(16, nextState.x), Math.max(16, window.innerWidth - nextWidth - 16));
  const nextY = Math.min(Math.max(16, nextState.y), Math.max(16, window.innerHeight - nextHeight - 16));

  return {
    width: nextWidth,
    height: nextHeight,
    x: nextX,
    y: nextY,
  };
}

function readPanelState() {
  try {
    const storedState = window.localStorage.getItem(panelStorageKey);
    if (!storedState) {
      return getDefaultPanelState();
    }

    const parsedState = JSON.parse(storedState);
    if (!parsedState || typeof parsedState !== 'object') {
      return getDefaultPanelState();
    }

    const numericState = {
      width: Number(parsedState.width),
      height: Number(parsedState.height),
      x: Number(parsedState.x),
      y: Number(parsedState.y),
    };

    if (![numericState.width, numericState.height, numericState.x, numericState.y].every((value) => Number.isFinite(value))) {
      return getDefaultPanelState();
    }

    return clampPanelState(numericState);
  } catch {
    return getDefaultPanelState();
  }
}

function savePanelState() {
  try {
    window.localStorage.setItem(panelStorageKey, JSON.stringify(panelState.value));
  } catch {
    // localStorage may be unavailable (private mode / permissions)
  }
}

function onPanelMove(event) {
  const activeMode = panelPointerState.value.activeMode;
  if (!activeMode || panelPointerState.value.pointerId === null || event.pointerId !== panelPointerState.value.pointerId) {
    return;
  }

  if (activeMode === 'drag') {
    const deltaX = event.clientX - panelPointerState.value.originX;
    const deltaY = event.clientY - panelPointerState.value.originY;
    panelState.value = clampPanelState({
      width: panelState.value.width,
      height: panelState.value.height,
      x: panelPointerState.value.panelX + deltaX,
      y: panelPointerState.value.panelY + deltaY,
    });
    return;
  }

  if (activeMode !== 'resize' || selectedRow.value === null) {
    return;
  }

  const deltaW = event.clientX - panelPointerState.value.originX;
  const deltaH = event.clientY - panelPointerState.value.originY;
  panelState.value = clampPanelState({
    width: panelPointerState.value.panelW + deltaW,
    height: panelPointerState.value.panelH + deltaH,
    x: panelState.value.x,
    y: panelState.value.y,
  });
}

function endPanelInteraction(event = null) {
  if (
    !panelPointerState.value.activeMode ||
    (panelPointerState.value.pointerId !== null &&
      event &&
      event.pointerId !== panelPointerState.value.pointerId)
  ) {
    return;
  }

  panelPointerState.value.activeMode = '';
  panelPointerState.value.pointerId = null;
  savePanelState();
}

function beginPanelDrag(event) {
  if (selectedRow.value === null) {
    return;
  }

  if (typeof event.button === 'number' && event.button !== 0) {
    return;
  }

  if (event.target && typeof event.target.closest === 'function' && event.target.closest('.result-details-close')) {
    return;
  }

  panelPointerState.value = {
    ...panelPointerState.value,
    activeMode: 'drag',
    pointerId: event.pointerId,
    originX: event.clientX,
    originY: event.clientY,
    panelX: panelState.value.x,
    panelY: panelState.value.y,
    panelW: panelState.value.width,
    panelH: panelState.value.height,
  };
  event.preventDefault();
  event.stopPropagation();
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
  }
}

function beginPanelResize(event) {
  if (selectedRow.value === null) {
    return;
  }

  if (typeof event.button === 'number' && event.button !== 0) {
    return;
  }

  panelPointerState.value = {
    ...panelPointerState.value,
    activeMode: 'resize',
    pointerId: event.pointerId,
    originX: event.clientX,
    originY: event.clientY,
    panelX: panelState.value.x,
    panelY: panelState.value.y,
    panelW: panelState.value.width,
    panelH: panelState.value.height,
  };
  event.preventDefault();
  event.stopPropagation();
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
  }
}

function closeDetailsPanel() {
  selectedRow.value = null;
}

function handleViewportResize() {
  panelState.value = clampPanelState(panelState.value);
  savePanelState();
}

function determineRowClass(row) {
  if (row.honors) {
    return 'honors'
  } else {
    return null;
  }
}

function getHighestGPA(data) {
  return data.reduce((currentMax, student) => {
    const currentGPA = student.GPA;
    if (currentGPA > currentMax.GPA) {
      return student;
    }

    return currentMax;
  }, data[0]) || {};
}

function getLowestGPA(data) {
  return data.reduce((currentMax, student) => {
    const currentGPA = student.GPA;
    if (currentGPA < currentMax.GPA) {
      return student;
    }

    return currentMax;
  }, data[0]) || {};
}

function getAverageGPA(data) {
  const nonHonorResults = data.filter(prof => !prof.honors);
  if (nonHonorResults.length === 0) {
    return '0.00';
  }

  const averageGPA = nonHonorResults
      .map((professor) => parseFloat(professor.GPA))
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0) / nonHonorResults.length;

  return averageGPA.toFixed(2);
}

// turn from array to Objects with headers matching key
function transformData() {
  const headers = props.tableHeaders || [];
  return (props.tableData || []).map((row) => {
    const obj = {};
    const rowValues = Array.isArray(row) ? [...row] : [];
    for (let i = 0; i < headers.length; i++) {
      const originalValue = rowValues[i] || '';
      let value = originalValue;

      if (i === 0) {
        if (typeof value === 'string' && value.includes("*")) {
          value = value.replace("*", "");
          obj['honors'] = true;
        } else {
          obj['honors'] = false;
        }
        value = titleCase(value);
      }
      obj[headers[i]] = value;
    }
    return obj;
  });

  function titleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
  }

}

function parsePercent(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, value));
  }

  const numericValue = parseFloat(String(value || '').replace('%', '').trim());
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
}

watch(() => props.tableData, () => {
  selectedRow.value = null;
}, {deep: true});

onMounted(() => {
  panelState.value = readPanelState();
  window.addEventListener('pointermove', onPanelMove);
  window.addEventListener('pointerup', endPanelInteraction);
  window.addEventListener('pointercancel', endPanelInteraction);
  window.addEventListener('resize', handleViewportResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPanelMove);
  window.removeEventListener('pointerup', endPanelInteraction);
  window.removeEventListener('pointercancel', endPanelInteraction);
  window.removeEventListener('resize', handleViewportResize);
});

</script>
<template>
  <v-row v-if="transformedData.length > 0 || dataLoading" class="px-4">
    <v-col cols="12">
      <DataTable :loading="dataLoading" :rowClass="determineRowClass"
                 v-model:selection="selectedRow"
                 selectionMode="single"
                 :value="transformedData"
                 paginator :rows="12" :rowsPerPageOptions="[12, 25, 50]"
                 tableStyle="min-width: 50rem"
                 filterDisplay="row" v-model:filters="filters"
                 :globalFilterFields="['Professor']">
        <template #header>
          <v-row no-gutters>
            <v-col cols="12" sm="8" lg="10" align-self="center">
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="green"
                  text-color="white"
                  :label="true"
              >
                Highest GPA 🎓😁🏅 {{ highestGPA['Professor'] }} -
                {{ highestGPA['GPA'] }}
              </v-chip>
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="red"
                  text-color="white"
                  :label="true"

              >
                Lowest GPA 😔🙏 {{ lowestGPA['Professor'] }} -
                {{ lowestGPA['GPA'] }}
              </v-chip>
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="blue"
                  :label="true"
              >
                Avg. GPA 🧮 (Non Hon) {{ avgGPA }}
              </v-chip>

              <v-chip
                  class="ma-2 font-weight-bold"
                  color="blue-grey"
                  :label="true"
              >
                Total 🔢 {{ transformedData.length }}
              </v-chip>
            </v-col>
            <v-col cols="12" sm="4" lg="2">
              <v-text-field v-model="filters['global'].value" placeholder="Search" color="white" variant="solo-filled"/>
            </v-col>
          </v-row>


        </template>
        <template #empty> No records found.</template>
        <Column :sortable=true v-for="header of tableHeaders"
                :field="header" :header="header" :showFilterMenu="false"
                :style="header === 'Professor' ? 'min-width: 14rem' : ''">
          <template v-if="header === 'Professor'" #body="{ field, data }">
            <div :class="data['honors'] === true ? 'shimmer' : null">
              {{ data[field] }}
            </div>
          </template>

        </Column>

      </DataTable>
    </v-col>
    <div v-if="selectedRow" class="result-details-panel" :style="panelStyle" @mousedown.stop>
      <div class="result-details-panel-header" @pointerdown="beginPanelDrag">
        <span class="result-details-panel-title">
          {{ selectedRow['Professor'] }} details
        </span>
        <button type="button" class="result-details-close" @pointerdown.stop.prevent @click.stop="closeDetailsPanel"
                aria-label="Close details">
          ×
        </button>
      </div>

      <div class="result-details-panel-content">
        <p class="mb-0">
          GPA <b>{{ selectedRow['GPA'] }}</b> &nbsp;&nbsp;|&nbsp;&nbsp;
          Semesters: <b>{{ selectedRow['% of Semesters'] || 'N/A' }}</b>
        </p>
        <p class="text-body-2 mt-2 mb-2">Grade distribution:</p>
        <div class="grade-bars">
          <div class="grade-bar-row" v-for="bucket in selectedGradeBuckets" :key="bucket.key">
            <div class="grade-bar-label">{{ bucket.label }}</div>
            <div class="grade-bar-track">
              <div class="grade-bar-fill" :style="{width: `${bucket.value}%`, backgroundColor: bucket.color}">
                {{ bucket.value.toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>
        <div
            class="details-resize-handle"
            @pointerdown="beginPanelResize"
        ></div>
      </div>
    </div>
  </v-row>

</template>

<style scoped>

.search-box {
  color: black;
  background-color: white;
}

.search-box::placeholder {
  background-color: whitesmoke;
  color: black;
}

.result-details-panel {
  position: fixed;
  z-index: 1250;
  border: 2px solid #cfcfcf;
  border-radius: 10px;
  padding: 12px 14px;
  background: white;
  box-shadow: 0 16px 30px rgb(0 0 0 / 18%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-details-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 10px;
  cursor: move;
  user-select: none;
  touch-action: none;
}

.result-details-panel-title {
  font-weight: 600;
  color: #2a3b47;
  flex: 1;
  line-height: 1.2;
}

.result-details-close {
  border: none;
  background: #ececec;
  color: #334155;
  width: 24px;
  height: 24px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.result-details-close:hover {
  background: #d8dbe0;
}

.result-details-panel-content {
  position: relative;
  overflow: auto;
  flex: 1;
}

.details-resize-handle {
  width: 18px;
  height: 18px;
  border-right: 2px solid #4b5563;
  border-bottom: 2px solid #4b5563;
  position: absolute;
  right: 4px;
  bottom: 4px;
  cursor: nwse-resize;
  opacity: 0.65;
  transform-origin: center;
  transform: rotate(0);
  touch-action: none;
}

.details-resize-handle:hover {
  opacity: 1;
}

.grade-bars {
  height: calc(100% - 60px);
  overflow: auto;
  display: grid;
  gap: 8px;
  padding-bottom: 14px;
}

.grade-bar-row {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
  align-items: center;
}

.grade-bar-label {
  font-weight: 700;
  color: #37474f;
  text-transform: uppercase;
}

.grade-bar-track {
  min-height: 28px;
  border: 1px solid #ddd;
  background: #f7f7f7;
  overflow: hidden;
}

.grade-bar-fill {
  height: 100%;
  min-width: 4%;
  color: white;
  font-size: 12px;
  line-height: 26px;
  padding-left: 8px;
  transition: width 220ms ease;
}

</style>
