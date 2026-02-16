<script>
import {onMounted, ref, watch} from 'vue'
import axios from 'axios';
import MainForm from "@/components/MainForm.vue";
import GeneralInfo from "@/components/GeneralInfo.vue";
import ShareButton from "@/components/ShareButton.vue";
import FeedbackLink from "@/components/FeedbackLink.vue";
import ResultsTable from "@/components/ResultsTable.vue";
import { useResultsQuery } from '@/composables/useResultsQuery.js';
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
      validationErrors,
      datasetMetadata,
      lastUpdatedText,
      loadDatasetMetadata,
      loadCourseIndexMetadata,
      addSearchParams,
      clearValidationError,
      onSubmitButtonClick,
    } = useResultsQuery(axios);

    const tableFilterState = ref({...DEFAULT_FILTER_STATE});

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
      datasetMetadata,
      lastUpdatedText,
      tableFilterState,
      onResultsTableFilterChange,
    }
  },
}
</script>
<template>
  <v-app>
    <v-container :fluid=true class="pa-1">
      <h1 class="title"> TAMU Free Grade Distribution</h1>

      <MainForm :course="course"
                :course-number="courseNumber"
                :sort-by-value="sortByValue"
                :sort-by-options="sortByOptions"
                :department-suggestions="departmentSuggestions"
                :course-number-suggestions="courseNumberSuggestions"
                :validation-errors="validationErrors"
                @update:course="onCourseUpdate"
                @update:courseNumber="onCourseNumberUpdate"
                @update:sortByValue="onSortByUpdate"
                @submit-btn-click="onSubmit"/>
      <GeneralInfo :show="tableData.length === 0 && !dataLoading"
                  :dataset-metadata="datasetMetadata"/>

      <ResultsTable v-bind="{
        tableData,
        dataLoading,
        tableHeaders,
        initialFilterState: tableFilterState,
      }"
      @filter-state-changed="onResultsTableFilterChange"/>

      <v-row no-gutters v-if="!(tableData.length === 0 && !dataLoading)" class="mt-0 mb-4">
        <v-col cols="12" class="py-0">
          <h5 class="suggestion"><a href="https://www.jippylong12.xyz">👋🏽 Me</a></h5>
        </v-col>
      </v-row>

      <v-row no-gutters class="mt-0 mb-1">
        <v-col cols="12" class="text-center py-2">
              <FeedbackLink v-bind="{
                show: true,
                course,
                courseNumber,
                sortByValue,
                filterState: tableFilterState,
                isResultsContext: tableData.length > 0,
              }"/>
        </v-col>
      </v-row>

      <ShareButton v-bind="{
        show: tableData.length > 0,
        course,
        courseNumber,
        sortByValue,
        filterState: tableFilterState,
      }"/>
      <v-row no-gutters v-if="lastUpdatedText">
        <v-col cols="12" class="text-center py-2">
          <p class="text-caption">
            {{ lastUpdatedText }}
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
