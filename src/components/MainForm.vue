<script setup>
import {ref, watch} from 'vue';

const props = defineProps({
  course: {
    type: String,
    required: true,
  },
  courseNumber: {
    type: String,
    required: true,
  },
  sortByValue: {
    type: Object,
    required: true,
  },
  sortByOptions: {
    type: Array,
    required: true,
  },
  departmentSuggestions: {
    type: Array,
    default: () => ([]),
  },
  courseNumberSuggestions: {
    type: Array,
    default: () => ([]),
  },
  validationErrors: {
    type: Object,
    default: () => ({}),
  },
  dataLoading: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:course', 'update:courseNumber', 'update:sortByValue', 'submitBtnClick'])

const courseSearchValue = ref(props.course || '');
const courseNumberSearchValue = ref(props.courseNumber || '');

watch(
  courseSearchValue,
  (nextValue) => {
    emits('update:course', (nextValue || '').toUpperCase());
  },
  {flush: 'sync'}
);

watch(
  courseNumberSearchValue,
  (nextValue) => {
    emits('update:courseNumber', nextValue || '');
  },
  {flush: 'sync'}
);

watch(() => props.course, (nextValue) => {
  const nextCourse = (nextValue || '').toUpperCase();
  if (courseSearchValue.value !== nextCourse) {
    courseSearchValue.value = nextCourse;
  }
});

watch(() => props.courseNumber, (nextValue) => {
  const nextCourseNumber = nextValue || '';
  if (courseNumberSearchValue.value !== nextCourseNumber) {
    courseNumberSearchValue.value = nextCourseNumber;
  }
});

function gtag() {
  dataLayer.push(arguments);
}

function onClickCourse() {
  gtag('event', 'clicked_course');
}

function onClickCourseNumber() {
  gtag('event', 'clicked_course_number');
}

function updateCourseValue(value) {
  const nextValue = value || '';
  const nextSearchValue = (courseSearchValue.value || '').toUpperCase();

  if (!nextValue && nextSearchValue) {
    courseSearchValue.value = nextSearchValue;
    return;
  }

  courseSearchValue.value = nextValue.toUpperCase();
}

function updateCourseNumberValue(value) {
  const nextValue = value || '';
  const nextSearchValue = courseNumberSearchValue.value || '';

  if (!nextValue && nextSearchValue) {
    return;
  }

  courseNumberSearchValue.value = nextValue;
}

function onChangeSortBy(val) {
  gtag('event', 'clicked_sort_by');
  const nextSortBy = props.sortByOptions.find((a) => a.value === val);
  emits('update:sortByValue', nextSortBy);
}

function updateCourseSearchText(nextValue) {
  courseSearchValue.value = (nextValue || '').toUpperCase();
}

function updateCourseNumberSearchText(nextValue) {
  courseNumberSearchValue.value = nextValue || '';
}

function onCourseBlur() {
  courseSearchValue.value = (courseSearchValue.value || '').toUpperCase();
}

function onCourseNumberBlur() {
  courseNumberSearchValue.value = courseNumberSearchValue.value || '';
}
</script>

<template>
  <v-row no-gutters class="form-shell">
    <v-col cols="12" class="form-intro px-4 px-sm-5 pt-4 pt-sm-5">
      <p class="form-kicker">Search</p>
      <h2 class="form-title">Build your schedule with cleaner data.</h2>
      <p class="form-copy">
        Enter a department and course number, then compare outcomes by GPA or professor name. Honors sections stay highlighted.
      </p>
      <p class="form-helper">Tip: press Enter after filling fields to run search quickly.</p>
    </v-col>

    <v-col cols="12" class="px-4 px-sm-5 pt-3 pt-sm-4 pb-4 pb-sm-5">
      <form class="form-submit" @submit.prevent="$emit('submitBtnClick')">
      <v-row class="form-grid" no-gutters>
        <v-col cols="12" sm="6" class="field-col pr-sm-2 pb-2">
          <v-combobox
            label="Department"
            placeholder="CSCE"
            :model-value="course"
            v-model:search="courseSearchValue"
            :items="departmentSuggestions"
            :disabled="dataLoading"
            :error-messages="validationErrors.course"
            @update:model-value="updateCourseValue"
            @update:modelValue="updateCourseValue"
            @update:search="updateCourseSearchText"
            @blur="onCourseBlur"
            maxlength="4"
            :clearable="false"
            :hide-no-data="false"
            @click="onClickCourse"
          ></v-combobox>
        </v-col>

        <v-col cols="12" sm="6" class="field-col pl-sm-2 pb-2">
          <v-combobox
            label="Course Number"
            placeholder="221"
            :error-messages="validationErrors.course_number"
            :model-value="courseNumber"
            v-model:search="courseNumberSearchValue"
            :items="courseNumberSuggestions"
            :disabled="dataLoading"
            @update:model-value="updateCourseNumberValue"
            @update:modelValue="updateCourseNumberValue"
            @update:search="updateCourseNumberSearchText"
            @blur="onCourseNumberBlur"
            maxlength="5"
            :clearable="false"
            :hide-no-data="false"
            @click="onClickCourseNumber"
          ></v-combobox>
        </v-col>

        <v-col cols="12" sm="6" class="field-col pr-sm-2 pb-2">
          <v-select
            label="Sort Results By"
            :model-value="sortByValue"
            :items="sortByOptions"
            :disabled="dataLoading"
            @update:modelValue="onChangeSortBy"
          ></v-select>
        </v-col>

        <v-col cols="12" sm="6" class="field-col pl-sm-2 pb-2 submit-col">
          <v-btn class="submit-btn" color="primary" variant="flat" :block=true :loading="dataLoading" :disabled="dataLoading" type="submit">
            {{ dataLoading ? 'Loading Results...' : 'Show Results' }}
          </v-btn>
        </v-col>
      </v-row>
      </form>
    </v-col>
  </v-row>
</template>

<style scoped>
.form-shell {
  border-radius: inherit;
}

.form-intro {
  border-bottom: 1px solid rgb(80 0 0 / 20%);
  padding-bottom: 14px;
  margin-bottom: 6px;
}

.form-kicker {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent-dark);
}

.form-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.2vw, 2rem);
  line-height: 1.15;
  color: var(--text-primary);
}

.form-copy {
  margin: 8px 0 0;
  max-width: 760px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.form-helper {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 0.86rem;
}

.form-submit {
  margin: 0;
}

.form-grid {
  margin-top: 10px;
}

.submit-col {
  display: flex;
  align-items: flex-start;
}

.submit-btn {
  width: 100%;
  min-height: 52px;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none !important;
  font-size: 0.98rem;
  border-radius: 12px;
  border: 1px solid rgb(67 0 0 / 88%);
  background: #500000 !important;
  color: #fff;
  box-shadow: 0 2px 6px rgb(48 7 14 / 18%);
}

.submit-btn:hover {
  transform: translateY(0);
  background: #5b0c15 !important;
  box-shadow: 0 3px 8px rgb(48 7 14 / 22%);
}

.submit-btn:active {
  transform: translateY(0);
  background: #430000 !important;
}

.submit-btn:disabled {
  opacity: 0.78;
}

.submit-btn:focus-visible {
  box-shadow: 0 0 0 3px rgb(92 31 41 / 32%), 0 3px 8px rgb(48 7 14 / 22%);
}

:deep(.submit-btn .v-btn__content) {
  text-transform: none !important;
  letter-spacing: 0.01em;
  font-weight: 700;
}

:deep(.v-field) {
  border-radius: 12px;
  background: rgb(252 250 248 / 94%);
}

:deep(.v-field__outline) {
  color: rgb(80 0 0 / 30%);
}

@media (max-width: 760px) {
  .submit-btn {
    min-height: 52px;
  }
}
</style>
