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

function gtag(){dataLayer.push(arguments);}

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
  <v-row no-gutters>
    <v-col cols="12" class="mt-2 px-4">
      <v-row justify="center" no-gutters>
        <v-col cols="12">
          <p class="text-center text-h6">Enter the course information below and press submit. Golden rows are Honors only.</p>
        </v-col>
        <v-col cols="12" lg="6" class="pt-4">
          <v-row>
            <v-col cols="12" sm="6" class="py-0">
              <v-combobox
                  label="Department (Ex: CSCE)"
                  :model-value="course"
                  v-model:search="courseSearchValue"
                  :items="departmentSuggestions"
                  :error-messages="validationErrors.course"
                  @update:model-value="updateCourseValue"
                  @update:modelValue="updateCourseValue"
                  @update:search="updateCourseSearchText"
                  @blur="onCourseBlur"
                  maxlength="4"
                  :clearable="false"
                  :hide-no-data="false"
                  @click="onClickCourse"></v-combobox>
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-combobox
                  label="Course Number (Ex: 111)"
                  :error-messages="validationErrors.course_number"
                  :model-value="courseNumber"
                  v-model:search="courseNumberSearchValue"
                  :items="courseNumberSuggestions"
                  @update:model-value="updateCourseNumberValue"
                  @update:modelValue="updateCourseNumberValue"
                  @update:search="updateCourseNumberSearchText"
                  @blur="onCourseNumberBlur"
                  maxlength="5"
                  :clearable="false"
                  :hide-no-data="false"
                  @click="onClickCourseNumber"></v-combobox>
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-select
                  label="Sort By:"
                  :model-value="sortByValue"
                  :items="sortByOptions"
                  @update:modelValue="onChangeSortBy"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" align-self="start">
              <v-btn color="black" :block=true @click="$emit('submitBtnClick')">Submit</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
