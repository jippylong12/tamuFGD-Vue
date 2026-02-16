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
    <v-col cols="12" class="form-intro px-4 px-sm-6 pt-5 pt-sm-6">
      <p class="form-kicker">Search</p>
      <h2 class="form-title">Build your schedule with cleaner data.</h2>
      <p class="form-copy">
        Enter a department and course number, then compare outcomes by GPA or professor name. Honors sections stay highlighted.
      </p>
      <p class="form-helper">Tip: press Enter after filling fields to run search quickly.</p>
    </v-col>

    <v-col cols="12" class="px-4 px-sm-6 pb-5 pb-sm-6">
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

        <v-col cols="12" sm="6" class="field-col pl-sm-2 pb-2 d-flex align-end">
          <v-btn class="submit-btn" :block=true :loading="dataLoading" :disabled="dataLoading" type="submit">
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
  border-bottom: 1px solid rgb(28 31 35 / 8%);
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
  margin: 12px 0 0;
  max-width: 760px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.form-helper {
  margin: 9px 0 0;
  color: var(--text-secondary);
  font-size: 0.86rem;
}

.form-submit {
  margin: 0;
}

.form-grid {
  margin-top: 14px;
}

.submit-btn {
  width: 100%;
  min-height: 56px;
  font-weight: 700;
  letter-spacing: 0.01em;
  border-radius: 14px;
  background: linear-gradient(120deg, #17342d, #68232f);
  color: #fff;
  box-shadow: 0 14px 24px rgb(20 24 29 / 16%);
}

.submit-btn:hover {
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.78;
}

.submit-btn:focus-visible {
  box-shadow: 0 0 0 3px rgb(45 120 161 / 30%), 0 14px 24px rgb(20 24 29 / 16%);
}

:deep(.v-field) {
  border-radius: 14px;
  background: rgb(252 252 252 / 90%);
}

:deep(.v-field__outline) {
  color: rgb(28 31 35 / 20%);
}

@media (max-width: 760px) {
  .submit-btn {
    min-height: 52px;
  }
}
</style>
