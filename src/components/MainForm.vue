<script setup>
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

function gtag(){dataLayer.push(arguments);}

function onClickCourse() {
  gtag('event', 'clicked_course');
}

function onClickCourseNumber() {
  gtag('event', 'clicked_course_number');
}

function updateCourseValue(value) {
  emits('update:course', value || '');
}

function updateCourseNumberValue(value) {
  emits('update:courseNumber', value || '');
}

function onChangeSortBy(val) {
  gtag('event', 'clicked_sort_by');
  const nextSortBy = props.sortByOptions.find((a) => a.value === val);
  emits('update:sortByValue', nextSortBy);
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
              <v-autocomplete
                  label="Department (Ex: CSCE)"
                  :model-value="course"
                  :items="departmentSuggestions"
                  :error-messages="validationErrors.course"
                  @update:model-value="updateCourseValue"
                  @update:modelValue="updateCourseValue"
                  maxlength="4"
                  :clearable="false"
                  :hide-no-data="false"
                  @click="onClickCourse"></v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-autocomplete
                  label="Course Number (Ex: 111)"
                  :error-messages="validationErrors.course_number"
                  :model-value="courseNumber"
                  :items="courseNumberSuggestions"
                  @update:model-value="updateCourseNumberValue"
                  @update:modelValue="updateCourseNumberValue"
                  maxlength="5"
                  :clearable="false"
                  :hide-no-data="false"
                  @click="onClickCourseNumber"></v-autocomplete>
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
