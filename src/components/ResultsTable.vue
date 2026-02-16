<script setup>
import {FilterMatchMode, FilterOperator} from "primevue/api";
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";

const props = defineProps({
  tableData: {
    required: true,
    type: Array,
  },
  dataLoading: {
    required: true,
    type: Boolean,
  },
  tableHeaders: {
    required: true,
    type: Array,
  },
  initialFilterState: {
    type: Object,
    default: () => ({
      globalFilter: null,
      professorFilter: null,
      gpaMinFilter: null,
      gpaMaxFilter: null,
      honorsOnlyFilter: false,
    }),
  },
});

const emit = defineEmits(['filter-state-changed'])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Professor': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'GPA': {
    operator: FilterOperator.AND,
    constraints: [
      {value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO},
      {value: null, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO},
    ],
  },
  honors: {value: null, matchMode: FilterMatchMode.EQUALS},
});
const selectedRow = ref(null);
const transformedData = computed(() => transformData());
const filteredRows = ref([]);
const totalRows = computed(() => transformedData.value.length);
const highestGPA = computed(() => getHighestGPA(filteredRows.value));
const lowestGPA = computed(() => getLowestGPA(filteredRows.value));
const avgGPA = computed(() => getAverageGPA(filteredRows.value));
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
const globalFilterText = computed({
  get() {
    return filters.value.global.value;
  },
  set(nextValue) {
    filters.value.global.value = normalizeFilterText(nextValue);
  },
});
const professorFilterText = computed({
  get() {
    return filters.value['Professor'].value;
  },
  set(nextValue) {
    filters.value['Professor'].value = normalizeFilterText(nextValue);
  },
});
const gpaMinFilter = computed({
  get() {
    return filters.value['GPA'].constraints[0].value;
  },
  set(nextValue) {
    filters.value['GPA'].constraints[0].value = normalizeNumericFilter(nextValue);
  },
});
const gpaMaxFilter = computed({
  get() {
    return filters.value['GPA'].constraints[1].value;
  },
  set(nextValue) {
    filters.value['GPA'].constraints[1].value = normalizeNumericFilter(nextValue);
  },
});
const honorsOnlyFilter = computed({
  get() {
    return filters.value.honors.value === true;
  },
  set(nextValue) {
    filters.value.honors.value = nextValue ? true : null;
  },
});
const filterState = computed(() => ({
  globalFilter: normalizeFilterText(filters.value.global.value),
  professorFilter: normalizeFilterText(filters.value['Professor'].value),
  gpaMinFilter: normalizeNumericFilter(filters.value['GPA'].constraints[0].value),
  gpaMaxFilter: normalizeNumericFilter(filters.value['GPA'].constraints[1].value),
  honorsOnlyFilter: filters.value.honors.value === true,
}));
const hasActiveFilters = computed(() => {
  return activeFiltersCount.value > 0;
});
const activeFiltersCount = computed(() => {
  let nextCount = 0;
  if (normalizeFilterText(filters.value.global.value) !== null) {
    nextCount += 1;
  }
  if (normalizeFilterText(filters.value['Professor'].value) !== null) {
    nextCount += 1;
  }
  if (filters.value['GPA'].constraints[0].value !== null && filters.value['GPA'].constraints[0].value !== '') {
    nextCount += 1;
  }
  if (filters.value['GPA'].constraints[1].value !== null && filters.value['GPA'].constraints[1].value !== '') {
    nextCount += 1;
  }
  if (filters.value.honors.value === true) {
    nextCount += 1;
  }
  return nextCount;
});
const canExportFilteredRows = computed(() => filteredRows.value.length > 0 && !props.dataLoading);

function normalizeFilterText(value) {
  if (typeof value !== 'string') {
    return value || null;
  }

  const nextValue = value.trim();
  return nextValue || null;
}

function normalizeFilterState(nextFilterState) {
  return {
    globalFilter: normalizeFilterText(nextFilterState?.globalFilter),
    professorFilter: normalizeFilterText(nextFilterState?.professorFilter),
    gpaMinFilter: normalizeNumericFilter(nextFilterState?.gpaMinFilter),
    gpaMaxFilter: normalizeNumericFilter(nextFilterState?.gpaMaxFilter),
    honorsOnlyFilter: nextFilterState?.honorsOnlyFilter === true,
  };
}

function applyInitialFilterState(nextFilterState) {
  const nextFilters = normalizeFilterState(nextFilterState);
  filters.value.global.value = nextFilters.globalFilter;
  filters.value['Professor'].value = nextFilters.professorFilter;
  filters.value['GPA'].constraints[0].value = nextFilters.gpaMinFilter;
  filters.value['GPA'].constraints[1].value = nextFilters.gpaMaxFilter;
  filters.value.honors.value = nextFilters.honorsOnlyFilter ? true : null;
}

function normalizeNumericFilter(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const nextValue = Number(value);
  if (Number.isNaN(nextValue) || !Number.isFinite(nextValue)) {
    return null;
  }

  return nextValue;
}

function buildExportCsvContent(rows, headers) {
  const safeHeaders = Array.isArray(headers) ? headers : [];
  const safeRows = Array.isArray(rows) ? rows : [];
  const csvHeader = safeHeaders.map((header) => formatCsvCell(header)).join(',');
  const csvRows = safeRows.map((nextRow) => {
    const rowMap = nextRow || {};
    return safeHeaders.map((header) => formatCsvCell(rowMap[header])).join(',');
  });

  return [csvHeader, ...csvRows].join('\r\n');
}

function formatCsvCell(value) {
  const normalizedValue = value == null ? '' : String(value);
  if (/["\n\r,]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
}

function getExportFilename() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `fgd-results-${datePart}-${timePart}-filtered.csv`;
}

function exportFilteredRowsCsv() {
  if (!canExportFilteredRows.value) {
    return;
  }

  const csvContent = buildExportCsvContent(filteredRows.value, props.tableHeaders);
  const blob = new Blob([`\uFEFF${csvContent}`], {type: 'text/csv;charset=utf-8;'});
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = getExportFilename();
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

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

function onFilter(event) {
  const nextRows = event && Array.isArray(event.filteredValue) ? event.filteredValue : transformedData.value;
  filteredRows.value = nextRows;
}

function emitFilterState() {
  emit('filter-state-changed', filterState.value);
}

function syncFilteredRowsFromTransformedData() {
  filteredRows.value = transformedData.value;
}

function clearAllTableFilters() {
  filters.value.global.value = null;
  filters.value['Professor'].value = null;
  filters.value['GPA'].constraints[0].value = null;
  filters.value['GPA'].constraints[1].value = null;
  filters.value.honors.value = null;
  filteredRows.value = transformedData.value;
}

watch(() => props.tableData, () => {
  selectedRow.value = null;
  syncFilteredRowsFromTransformedData();
}, {deep: true});
watch(
    () => props.initialFilterState,
    (nextFilterState) => {
      applyInitialFilterState(nextFilterState);
    }, {deep: true}
);
watch(transformedData, syncFilteredRowsFromTransformedData, {immediate: true});
watch(filters, emitFilterState, {deep: true});
applyInitialFilterState(props.initialFilterState);

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
  <v-row v-if="transformedData.length > 0 || dataLoading" class="results-shell px-3 px-sm-4 pb-4">
    <v-col cols="12" class="pt-3">
      <DataTable
        class="results-table"
        :loading="dataLoading"
        :rowClass="determineRowClass"
        v-model:selection="selectedRow"
        selectionMode="single"
        :value="transformedData"
        paginator
        :rows="12"
        :rowsPerPageOptions="[12, 25, 50]"
        tableStyle="min-width: 50rem"
        responsiveLayout="scroll"
        filterDisplay="row"
        v-model:filters="filters"
        :globalFilterFields="tableHeaders"
        @filter="onFilter"
      >
        <template #header>
          <div class="results-header-sheet pa-2 pa-sm-3">
            <div class="results-summary-grid">
              <article class="summary-card summary-positive">
                <p class="summary-label">Highest GPA</p>
                <p class="summary-value">{{ highestGPA['GPA'] || 'N/A' }}</p>
                <p class="summary-detail">{{ highestGPA['Professor'] || 'No professor loaded' }}</p>
              </article>
              <article class="summary-card summary-warning">
                <p class="summary-label">Lowest GPA</p>
                <p class="summary-value">{{ lowestGPA['GPA'] || 'N/A' }}</p>
                <p class="summary-detail">{{ lowestGPA['Professor'] || 'No professor loaded' }}</p>
              </article>
              <article class="summary-card summary-neutral">
                <p class="summary-label">Average GPA</p>
                <p class="summary-value">{{ avgGPA }}</p>
                <p class="summary-detail">Non-honors sections only</p>
              </article>
              <article class="summary-card summary-neutral">
                <p class="summary-label">Visible Results</p>
                <p class="summary-value">{{ filteredRows.length }} / {{ totalRows }}</p>
                <p class="summary-detail">Current filter output</p>
              </article>
            </div>

            <div class="results-toolbar">
              <div class="results-active-state text-caption">
                <span v-if="hasActiveFilters">
                  {{ activeFiltersCount }} active filters
                </span>
                <span v-else>
                  No filters applied
                </span>
              </div>
              <div class="results-filter-actions d-flex align-center">
                <v-btn
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  prepend-icon="pi pi-file-excel"
                  :disabled="!canExportFilteredRows"
                  class="results-export-btn"
                  @click="exportFilteredRowsCsv"
                  aria-label="Export filtered results as CSV"
                >
                  Export CSV
                </v-btn>
                <v-btn
                  v-if="hasActiveFilters"
                  variant="text"
                  density="comfortable"
                  class="results-clear-btn"
                  prepend-icon="pi pi-filter-slash"
                  @click="clearAllTableFilters"
                >
                  Clear filters
                </v-btn>
              </div>
            </div>
            <p class="results-row-hint">Tip: select a row to open professor details in a movable panel.</p>

            <v-row no-gutters class="mt-2">
              <v-col cols="12" sm="6" md="3" class="pr-sm-2 pb-2">
                <v-text-field
                  v-model="globalFilterText"
                  label="Search all rows"
                  placeholder="Professor, GPA, percentages"
                  color="primary"
                  variant="outlined"
                  hide-details="auto"
                  density="comfortable"
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6" md="3" class="pl-sm-0 pr-sm-2 pb-2">
                <v-text-field
                  v-model="professorFilterText"
                  label="Professor name"
                  placeholder="e.g., Smith"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="6" sm="3" md="2" class="pr-sm-2 pb-2">
                <v-text-field
                  v-model="gpaMinFilter"
                  label="GPA min"
                  placeholder="2.5"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  density="comfortable"
                  type="number"
                  step="0.01"
                  :min="0"
                  :max="4.5"
                />
              </v-col>
              <v-col cols="6" sm="3" md="2" class="pr-sm-2 pb-2">
                <v-text-field
                  v-model="gpaMaxFilter"
                  label="GPA max"
                  placeholder="4.0"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  density="comfortable"
                  type="number"
                  step="0.01"
                  :min="0"
                  :max="4.5"
                />
              </v-col>
              <v-col cols="12" sm="4" md="2" class="pb-2 d-flex align-center">
                <v-switch
                  v-model="honorsOnlyFilter"
                  label="Honors only"
                  color="amber"
                  hide-details
                  density="comfortable"
                  inset
                />
              </v-col>
            </v-row>
          </div>
        </template>

        <template #empty>
          <v-sheet class="text-center text-medium-emphasis py-8 px-4 empty-state">
            <p class="text-body-1 mb-1">No matching rows.</p>
            <p class="text-caption">Try clearing filters or broadening your search.</p>
          </v-sheet>
        </template>

        <Column
          :sortable=true
          v-for="header of tableHeaders"
          :field="header"
          :header="header"
          :showFilterMenu="false"
          :style="header === 'Professor' ? 'min-width: 14rem' : ''"
        >
          <template v-if="header === 'Professor'" #body="{ field, data }">
            <div class="professor-cell">
              <span class="professor-name">{{ data[field] }}</span>
              <span class="honors-pill"
                    :class="{ 'honors-pill-hidden': data['honors'] !== true }"
                    :aria-hidden="data['honors'] !== true">
                Honors
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
    </v-col>

    <div v-if="selectedRow" class="result-details-panel" :style="panelStyle" @mousedown.stop>
      <div class="result-details-panel-header" @pointerdown="beginPanelDrag">
        <div class="result-details-panel-headline">
          <p class="panel-kicker">Professor Profile</p>
          <span class="result-details-panel-title">{{ selectedRow['Professor'] }}</span>
        </div>
        <button
          type="button"
          class="result-details-close"
          @pointerdown.stop.prevent
          @click.stop="closeDetailsPanel"
          aria-label="Close details"
        >
          ×
        </button>
      </div>

      <div class="result-details-panel-content">
        <p class="panel-metrics mb-0">
          GPA <b>{{ selectedRow['GPA'] }}</b> &nbsp;&nbsp;|&nbsp;&nbsp;
          Semesters: <b>{{ selectedRow['% of Semesters'] || 'N/A' }}</b>
        </p>
        <p class="text-body-2 mt-2 mb-2">Grade distribution</p>

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

        <div class="details-resize-handle" @pointerdown="beginPanelResize"></div>
      </div>
    </div>
  </v-row>
</template>

<style scoped>
.results-shell {
  position: relative;
}

.results-table {
  border-radius: 14px;
  overflow: hidden;
}

.results-header-sheet {
  background: transparent;
  display: grid;
  gap: 10px;
}

.results-row-hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.83rem;
}

.results-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.summary-card {
  border: 1px solid rgb(80 0 0 / 24%);
  border-radius: 12px;
  padding: 8px 10px;
  background: linear-gradient(180deg, rgb(252 250 249 / 93%), rgb(244 240 238 / 88%));
}

.summary-label {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary);
}

.summary-value {
  margin: 4px 0 2px;
  font-size: 1.28rem;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-detail {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.summary-positive {
  border-top: 3px solid #2f7d5b;
}

.summary-warning {
  border-top: 3px solid #b1543e;
}

.summary-neutral {
  border-top: 3px solid #456883;
}

.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.results-active-state {
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
}

.results-filter-actions {
  gap: 8px;
  flex-wrap: wrap;
}

.results-export-btn {
  border-width: 2px;
  min-width: 126px;
}

.results-clear-btn {
  min-height: 36px;
}

.result-details-panel {
  position: fixed;
  z-index: 1250;
  border: 1px solid rgb(14 27 36 / 24%);
  border-radius: 14px;
  padding: 10px 12px;
  background: rgb(250 246 244 / 95%);
  box-shadow: 0 18px 36px rgb(10 13 16 / 25%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(3px);
}

.result-details-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 10px;
  cursor: move;
  user-select: none;
  touch-action: none;
}

.result-details-panel-headline {
  display: grid;
  gap: 1px;
  flex: 1;
}

.panel-kicker {
  margin: 0;
  font-size: 0.69rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.result-details-panel-title {
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.25;
}

.result-details-close {
  border: 1px solid rgb(80 0 0 / 20%);
  background: rgb(255 252 250 / 86%);
  color: #334155;
  width: 28px;
  height: 28px;
  line-height: 1;
  border-radius: 999px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.result-details-close:hover {
  background: rgb(224 228 232 / 90%);
}

.result-details-close:focus-visible {
  outline: 2px solid rgb(34 80 107 / 80%);
  outline-offset: 2px;
}

.result-details-panel-content {
  position: relative;
  overflow: auto;
  flex: 1;
}

.panel-metrics {
  color: var(--text-secondary);
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
  min-height: 30px;
  border: 1px solid rgb(80 0 0 / 18%);
  border-radius: 6px;
  background: rgb(250 246 245 / 92%);
  overflow: hidden;
}

.grade-bar-fill {
  height: 100%;
  min-width: 4%;
  color: white;
  font-size: 12px;
  line-height: 28px;
  padding-left: 8px;
  transition: width 220ms ease;
}

.empty-state {
  border: 1px dashed rgb(20 29 36 / 22%);
  border-radius: 12px;
  background: rgb(255 255 255 / 70%);
}

:deep(.p-datatable-wrapper) {
  border-radius: 14px;
}

:deep(.p-datatable-table) {
  border-collapse: separate;
  border-spacing: 0;
}

:deep(.p-datatable-thead > tr > th) {
  background: linear-gradient(120deg, #6a2332, #3c1a20);
  color: #fff;
  border: none;
  text-align: center;
  padding: 12px;
}

:deep(.p-column-header-content) {
  justify-content: center;
}

:deep(.p-datatable-tbody > tr > td) {
  border: none;
  border-bottom: 1px solid rgb(80 0 0 / 12%);
  text-align: center;
  padding: 11px 10px;
  background: rgb(252 250 249 / 93%);
}

:deep(.p-datatable-tbody > tr:hover > td) {
  background: rgb(246 238 235 / 95%);
}

:deep(.p-datatable-tbody > tr.honors > td) {
  background: linear-gradient(120deg, rgb(252 243 215 / 96%), rgb(243 227 179 / 95%));
  color: #3a2600;
}

:deep(.p-datatable-tbody > tr.honors:hover > td) {
  background: linear-gradient(120deg, rgb(247 233 191 / 96%), rgb(237 216 154 / 95%));
}

:deep(.p-paginator) {
  border: none;
  background: rgb(247 241 239 / 75%);
  padding-top: 10px;
}

:deep(.v-field) {
  border-radius: 12px;
  background: rgb(255 255 255 / 92%);
}

.professor-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.professor-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.honors-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: rgb(80 0 0 / 92%);
  color: #fff;
  line-height: 1.4;
  margin-left: auto;
  flex: 0 0 64px;
}

.honors-pill-hidden {
  visibility: hidden;
}

@media (max-width: 1090px) {
  .results-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .results-summary-grid {
    grid-template-columns: 1fr;
  }

  .results-toolbar {
    align-items: flex-start;
  }

  .results-filter-actions {
    width: 100%;
  }

  .results-export-btn,
  .results-clear-btn {
    flex: 1;
  }
}
</style>
