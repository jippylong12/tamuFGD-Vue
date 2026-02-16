<script>
import {computed, onMounted, ref, watch} from 'vue'
import axios from 'axios';
import MainForm from "@/components/MainForm.vue";
import GeneralInfo from "@/components/GeneralInfo.vue";
import ShareButton from "@/components/ShareButton.vue";
import FeedbackLink from "@/components/FeedbackLink.vue";
import ResultsTable from "@/components/ResultsTable.vue";
import {useResultsQuery} from '@/composables/useResultsQuery.js';
import 'primeicons/primeicons.css';

export default {
  components: {ResultsTable, ShareButton, FeedbackLink, GeneralInfo, MainForm},
  setup() {
    const DEFAULT_FILTER_STATE = {
      globalFilter: null,
      professorFilter: null,
      gpaMinFilter: null,
      gpaMaxFilter: null,
      honorsOnlyFilter: false,
    };

    const {
      course,
      courseNumber,
      sortByOptions,
      sortByValue,
      departmentSuggestions,
      courseNumberSuggestions,
      tableData,
      tableHeaders,
      dataLoading,
      hasSearched,
      validationErrors,
      serverMessage,
      datasetMetadata,
      lastUpdatedText,
      loadDatasetMetadata,
      loadCourseIndexMetadata,
      addSearchParams,
      clearValidationError,
      onSubmitButtonClick,
    } = useResultsQuery(axios);

    const tableFilterState = ref({...DEFAULT_FILTER_STATE});

    const hasRows = computed(() => tableData.value.length > 0);
    const hasValidationErrors = computed(() => Object.keys(validationErrors.value || {}).length > 0);
    const isDefaultView = computed(() => !hasSearched.value && !dataLoading.value);
    const isNoResultsView = computed(() => hasSearched.value
      && !dataLoading.value
      && tableData.value.length === 0
      && !hasValidationErrors.value);
    const hasResultsContext = computed(() => tableData.value.length > 0 || dataLoading.value);
    const termRangeText = computed(() => {
      const termRange = datasetMetadata.value?.coverage?.term_range || datasetMetadata.value?.term_range;
      if (termRange && termRange.start && termRange.end) {
        return `Coverage: ${termRange.start} - ${termRange.end}`;
      }
      return 'Coverage: Spring 2012 - Summer 2023';
    });
    const activeQueryLabel = computed(() => {
      const department = (course.value || '').trim().toUpperCase();
      const number = (courseNumber.value || '').trim();
      if (!department || !number) {
        return '';
      }
      return `${department} ${number}`;
    });

    watch(course, () => clearValidationError('course'))
    watch(courseNumber, () => clearValidationError('course_number'))
    watch(sortByValue, () => clearValidationError('sort_by'), {deep: true})

    function onCourseUpdate(nextValue) {
      course.value = nextValue || '';
    }

    function onCourseNumberUpdate(nextValue) {
      courseNumber.value = nextValue || '';
    }

    function onSortByUpdate(nextValue) {
      sortByValue.value = nextValue;
    }

    function normalizeFilterText(value) {
      if (typeof value !== 'string') {
        return null;
      }

      const trimmedValue = value.trim();
      return trimmedValue || null;
    }

    function normalizeFilterNumber(value) {
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        return null;
      }

      return numericValue;
    }

    function normalizeFilterBoolean(value) {
      if (value === null || value === undefined) {
        return false;
      }

      const normalizedValue = String(value).trim().toLowerCase();
      return normalizedValue === '1' || normalizedValue === 'true' || normalizedValue === 'yes';
    }

    function getTableFilterStateFromUrl() {
      const searchParams = new URLSearchParams(window.location.search);
      return {
        globalFilter: normalizeFilterText(searchParams.get('q')),
        professorFilter: normalizeFilterText(searchParams.get('prof')),
        gpaMinFilter: normalizeFilterNumber(searchParams.get('gpa_min')),
        gpaMaxFilter: normalizeFilterNumber(searchParams.get('gpa_max')),
        honorsOnlyFilter: normalizeFilterBoolean(searchParams.get('honors')),
      };
    }

    function applyFilterState(nextFilterState) {
      const nextState = nextFilterState || {};
      tableFilterState.value = {
        globalFilter: normalizeFilterText(nextState.globalFilter),
        professorFilter: normalizeFilterText(nextState.professorFilter),
        gpaMinFilter: normalizeFilterNumber(nextState.gpaMinFilter),
        gpaMaxFilter: normalizeFilterNumber(nextState.gpaMaxFilter),
        honorsOnlyFilter: !!nextState.honorsOnlyFilter,
      };
    }

    function onResultsTableFilterChange(nextFilterState) {
      applyFilterState(nextFilterState);
    }

    function onSubmit() {
      onSubmitButtonClick();
    }

    onMounted(async () => {
      await loadDatasetMetadata();
      await loadCourseIndexMetadata();
      applyFilterState({
        ...DEFAULT_FILTER_STATE,
        ...getTableFilterStateFromUrl(),
      });
      addSearchParams();
    })

    return {
      course,
      courseNumber,
      sortByOptions,
      sortByValue,
      departmentSuggestions,
      courseNumberSuggestions,
      tableData,
      tableHeaders,
      onSubmitButtonClick,
      onCourseUpdate,
      onCourseNumberUpdate,
      onSortByUpdate,
      onSubmit,
      dataLoading,
      validationErrors,
      serverMessage,
      datasetMetadata,
      lastUpdatedText,
      tableFilterState,
      onResultsTableFilterChange,
      isDefaultView,
      hasResultsContext,
      isNoResultsView,
      hasRows,
      termRangeText,
      activeQueryLabel,
      hasSearched,
    }
  },
}
</script>
<template>
  <v-app>
    <div class="app-shell">
      <div class="app-ambient app-ambient-a"></div>
      <div class="app-ambient app-ambient-b"></div>
      <v-container :fluid=true class="app-container pa-2 pa-sm-4">
        <header class="hero-card">
          <p class="hero-kicker">Texas A&amp;M Course Planner</p>
          <h1 class="hero-title">TAMU Free Grade Distribution</h1>
          <p class="hero-copy">
            Search historical professor outcomes fast, compare sections, and decide with signal instead of guesswork.
          </p>
          <div class="hero-meta">
            <span class="hero-pill">{{ termRangeText }}</span>
            <span class="hero-pill" v-if="lastUpdatedText">{{ lastUpdatedText }}</span>
            <span class="hero-pill" v-if="activeQueryLabel && hasRows">Viewing: {{ activeQueryLabel }}</span>
          </div>
        </header>

        <section class="surface-card form-surface">
          <MainForm :course="course"
                    :course-number="courseNumber"
                    :sort-by-value="sortByValue"
                    :sort-by-options="sortByOptions"
                    :department-suggestions="departmentSuggestions"
                    :course-number-suggestions="courseNumberSuggestions"
                    :validation-errors="validationErrors"
                    :data-loading="dataLoading"
                    @update:course="onCourseUpdate"
                    @update:courseNumber="onCourseNumberUpdate"
                    @update:sortByValue="onSortByUpdate"
                    @submit-btn-click="onSubmit"/>
        </section>

        <section v-if="isDefaultView" class="surface-card info-surface">
          <GeneralInfo :show="isDefaultView"
                       :dataset-metadata="datasetMetadata"/>
        </section>

        <section v-if="isNoResultsView" class="surface-card no-results-surface">
          <div class="no-results-inner">
            <p class="no-results-kicker">No matches found</p>
            <h2>Try a broader search for {{ activeQueryLabel || 'that course' }}.</h2>
            <p>
              {{ serverMessage || 'We could not find any rows for that exact combination. Try another department/course pair or adjust filters after results load.' }}
            </p>
            <ul>
              <li>Check department spelling (exactly 4 letters).</li>
              <li>Try another course number within the department.</li>
              <li>Switch sorting only after you confirm the course exists.</li>
            </ul>
          </div>
        </section>

        <section v-if="hasResultsContext" class="surface-card results-surface">
          <ResultsTable v-bind="{
            tableData,
            dataLoading,
            tableHeaders,
            initialFilterState: tableFilterState,
          }"
                        @filter-state-changed="onResultsTableFilterChange"/>
        </section>

        <footer class="app-footer">
          <div v-if="hasSearched" class="creator-cta">
            <a href="https://www.jippylong12.xyz" target="_blank" rel="noopener noreferrer">
              Built by Marcus Salinas
            </a>
          </div>
          <FeedbackLink v-bind="{
            show: true,
            course,
            courseNumber,
            sortByValue,
            filterState: tableFilterState,
            isResultsContext: hasSearched,
          }"/>
        </footer>

        <ShareButton v-bind="{
          show: tableData.length > 0,
          course,
          courseNumber,
          sortByValue,
          filterState: tableFilterState,
        }"/>
      </v-container>
    </div>
  </v-app>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  padding-bottom: 20px;
  overflow: hidden;
}

.app-container {
  position: relative;
  z-index: 2;
  max-width: 1280px;
}

.app-ambient {
  position: fixed;
  z-index: 0;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(2px);
  opacity: 0.5;
}

.app-ambient-a {
  width: 380px;
  height: 380px;
  background: radial-gradient(circle at 30% 30%, rgb(130 173 142 / 70%), rgb(130 173 142 / 5%));
  top: -90px;
  left: -110px;
  animation: drift-a 18s ease-in-out infinite alternate;
}

.app-ambient-b {
  width: 340px;
  height: 340px;
  background: radial-gradient(circle at 70% 70%, rgb(133 43 52 / 45%), rgb(133 43 52 / 3%));
  bottom: -100px;
  right: -70px;
  animation: drift-b 15s ease-in-out infinite alternate;
}

.hero-card {
  margin: 4px 0 18px;
  border: 1px solid var(--surface-border);
  border-radius: 24px;
  background: linear-gradient(120deg, rgb(18 30 28 / 90%), rgb(66 19 30 / 88%));
  color: #f6f6f6;
  padding: clamp(18px, 4vw, 32px);
  box-shadow: 0 30px 60px rgb(10 13 16 / 22%);
}

.hero-kicker {
  margin: 0 0 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.74rem;
  color: rgb(237 209 125 / 88%);
}

.hero-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 2.8rem);
  line-height: 1.08;
}

.hero-copy {
  margin: 14px 0 16px;
  max-width: 760px;
  color: rgb(244 245 247 / 88%);
  font-size: clamp(0.98rem, 1.4vw, 1.12rem);
  line-height: 1.5;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-pill {
  display: inline-flex;
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: 999px;
  padding: 7px 12px;
  background: rgb(255 255 255 / 11%);
  font-size: 0.82rem;
}

.surface-card {
  border: 1px solid var(--surface-border);
  border-radius: 24px;
  background: var(--surface-bg);
  box-shadow: var(--surface-shadow);
}

.form-surface {
  margin-bottom: 16px;
}

.info-surface {
  margin-bottom: 16px;
  overflow: hidden;
}

.no-results-surface {
  margin-bottom: 16px;
  padding: 20px;
}

.no-results-inner {
  border: 1px dashed rgb(20 29 36 / 24%);
  border-radius: 16px;
  padding: 16px 18px;
  background: rgb(255 255 255 / 70%);
}

.no-results-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent-dark);
}

.no-results-inner h2 {
  margin: 8px 0;
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2vw, 1.5rem);
}

.no-results-inner p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.no-results-inner ul {
  margin: 12px 0 0;
  padding-left: 18px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.results-surface {
  margin-bottom: 14px;
  overflow: hidden;
}

.app-footer {
  display: grid;
  gap: 8px;
  justify-items: center;
  text-align: center;
  margin-top: 2px;
}

.creator-cta a {
  color: var(--accent-dark);
  font-weight: 700;
  letter-spacing: 0.01em;
  text-decoration: none;
}

.creator-cta a:hover {
  text-decoration: underline;
}

@keyframes drift-a {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(42px, 12px, 0);
  }
}

@keyframes drift-b {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-28px, -16px, 0);
  }
}

@media (max-width: 760px) {
  .hero-card {
    border-radius: 20px;
    margin-top: 0;
  }

  .surface-card {
    border-radius: 20px;
  }

  .no-results-surface {
    padding: 14px;
  }
}
</style>
