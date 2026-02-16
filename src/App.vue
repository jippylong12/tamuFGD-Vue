<script>
import {ref, watch} from 'vue'
import axios from 'axios';
import Toastify from 'toastify-js'
import MainForm from "@/components/MainForm.vue";
import GeneralInfo from "@/components/GeneralInfo.vue";
import ShareButton from "@/components/ShareButton.vue";
import ResultsTable from "@/components/ResultsTable.vue";
import 'primeicons/primeicons.css';

export default {
  components: {ResultsTable, ShareButton, GeneralInfo, MainForm},
  setup() {
    const course = ref('')
    const courseNumber = ref('')
    const sortByOptions = [{value: '1', title: 'GPA'}, {
      value: '2',
      title: 'Professor Last Name'
    }];
    const sortByValue = ref({value: '1', title: 'GPA'});


    let tableData = ref([]);
    let tableHeaders = ref([]);
    let dataLoading = ref(false);
    const validationErrors = ref({});
    const serverMessage = ref('');

    window.dataLayer = window.dataLayer || [];

    function gtag() {
      dataLayer.push(arguments);
    }

    gtag('js', new Date());

    gtag('config', 'G-B24WEF5K6V');

    function showToast(message) {
      Toastify({
        text: message,
        duration: 2000,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: false, // Prevents dismissing of toast on hover
        style: {
          background: 'red'
        },
        className: "error",
      }).showToast();
    }

    window.addEventListener('DOMContentLoaded', function () {
      addSearchParams()
    })

    const makePostRequest = async () => {
      const formData = {
        course: course.value.trim().toUpperCase(),
        course_number: courseNumber.value.trim(),
        sort_by: sortByValue.value['value'],
      }
      const url = 'results.php'
      const response = await axios.post(url, formData);
      const data = response.data || {};

      if (response.status === 200 && data.success) {
        tableHeaders.value = data.headers;
        tableData.value = data.results;
        serverMessage.value = '';
        return;
      }

      applyBackendValidationErrors(data);
      if (data.error_code === 'NO_RESULTS') {
        tableHeaders.value = [];
        tableData.value = [];
        serverMessage.value = data.message || 'No results were found for this request.';
        return;
      }

      serverMessage.value = data.message || 'Request failed.';
      throw new Error(serverMessage.value);
    };

    function addSearchParams() {
      const searchParams = new URLSearchParams(window.location.search);
      course.value = searchParams.get("course") || '';
      courseNumber.value = searchParams.get("number") || '';
      let sortByParamValue = searchParams.get("sort_by")
      if (sortByParamValue) {
        let sortVal = sortByOptions.find((a) => a.value === sortByParamValue)
        if (sortVal) {
          sortByValue.value = sortVal
        }
      }

      if (course.value && courseNumber.value) {
        onSubmitButtonClick();
      }
    }

    function runClientValidation() {
      const nextErrors = {};
      const normalizedCourse = (course.value || '').trim();
      const normalizedCourseNumber = (courseNumber.value || '').trim();
      const numberValue = parseInt(normalizedCourseNumber, 10);

      if (!/^[A-Za-z]{4}$/.test(normalizedCourse)) {
        nextErrors.course = 'Department must be exactly 4 letters (A-Z).';
      }

      if (normalizedCourseNumber === '' || !/^\d+$/.test(normalizedCourseNumber) || numberValue < 100 || numberValue > 10000) {
        nextErrors.course_number = 'Course number must be a number between 100 and 10000.';
      }

      validationErrors.value = nextErrors;
      return Object.keys(nextErrors).length === 0;
    }

    function applyBackendValidationErrors(responseData) {
      const nextErrors = {};
      if (!responseData || !Array.isArray(responseData.errors)) {
        validationErrors.value = {};
        return;
      }

      for (const validationError of responseData.errors) {
        if (!validationError || !validationError.field || !validationError.message) {
          continue;
        }
        nextErrors[validationError.field] = validationError.message;
      }

      validationErrors.value = nextErrors;
    }

    function onSubmitButtonClick() {
      const isValid = runClientValidation();
      if (!isValid) {
        return;
      }

      dataLoading.value = true;
      serverMessage.value = '';
      validationErrors.value = {};

      gtag('event', 'clicked_submit_btn', {
        course: course.value,
        course_number: courseNumber.value,
        sort_by: sortByValue.value['title'],
      });
      makePostRequest().then(() => {
        dataLoading.value = false;
      }).catch((error) => {
        console.log(error);
        dataLoading.value = false;
        if (!serverMessage.value) {
          serverMessage.value = 'Something went wrong! Please check form values.';
        }

        if (error.response && error.response.status === 400 && error.response.data) {
          applyBackendValidationErrors(error.response.data);
          serverMessage.value = error.response.data.message || serverMessage.value;
        }

        if (error.response && error.response.status === 404 && error.response.data && error.response.data.error_code === 'NO_RESULTS') {
          tableData.value = [];
          tableHeaders.value = [];
          serverMessage.value = error.response.data.message || serverMessage.value;
        }

        if (serverMessage.value) {
          showToast(serverMessage.value);
        }
      })
    }

    watch(course, () => {
      if (validationErrors.value.course) {
        const currentErrors = {...validationErrors.value};
        delete currentErrors.course;
        validationErrors.value = currentErrors;
      }
    })

    watch(courseNumber, () => {
      if (validationErrors.value.course_number) {
        const currentErrors = {...validationErrors.value};
        delete currentErrors.course_number;
        validationErrors.value = currentErrors;
      }
    })

    watch(sortByValue, () => {
      if (validationErrors.value.sort_by) {
        const currentErrors = {...validationErrors.value};
        delete currentErrors.sort_by;
        validationErrors.value = currentErrors;
      }
    }, {deep: true})

    // expose the ref to the template
    return {
      course,
      courseNumber,
      sortByOptions,
      sortByValue,
      tableData,
      tableHeaders,
      onSubmitButtonClick,
      dataLoading,
      validationErrors,
    }
  },
}
</script>
<template>
  <v-app>
    <v-container :fluid=true class="pa-1">
      <h1 class="title"> TAMU Free Grade Distribution</h1>

      <MainForm v-model:course="course" v-model:course-number="courseNumber"
                v-model:sort-by-value="sortByValue"
                :sort-by-options=sortByOptions
                :validation-errors="validationErrors"
                @submit-btn-click="onSubmitButtonClick"/>
      <GeneralInfo :show="tableData.length === 0 && !dataLoading"/>

      <ResultsTable v-bind="{
        tableData,
        dataLoading,
        tableHeaders,
      }"/>

      <v-row no-gutters v-if="!(tableData.length === 0 && !dataLoading)" class="mt-0 mb-4">
        <v-col cols="12" class="py-0">
          <h5 class="suggestion"><a href="https://www.jippylong12.xyz">👋🏽 Me</a></h5>
        </v-col>
      </v-row>

      <ShareButton v-bind="{
        show: tableData.length > 0,
        course,
        courseNumber,
        sortByValue,
      }"/>
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
