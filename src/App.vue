<script>
import {ref} from 'vue'
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

    window.dataLayer = window.dataLayer || [];

    function gtag() {
      dataLayer.push(arguments);
    }

    gtag('js', new Date());

    gtag('config', 'G-B24WEF5K6V');

    window.addEventListener('DOMContentLoaded', function () {
      addSearchParams()
    })

    const makePostRequest = async () => {
      const formData = {
        course: course.value,
        course_number: courseNumber.value,
        sort_by: sortByValue.value['value'],
      }
      const url = 'results.php'
      const response = await axios.post(url, formData);

      if (response.status === 200) {
        // The request was successful
        const data = response.data;
        if (data.success) {
          tableHeaders.value = data.headers;
          tableData.value = data.results;
        }
      } else {
        // The request failed
        console.log(response.error);
      }
    };

    function addSearchParams() {
      const searchParams = new URLSearchParams(window.location.search);
      course.value = searchParams.get("course");
      courseNumber.value = searchParams.get("number");
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

    function onSubmitButtonClick() {
      dataLoading.value = true;

      gtag('event', 'clicked_submit_btn', {
        course: course.value,
        course_number: courseNumber.value,
        sort_by: sortByValue.value['title'],
      });
      makePostRequest().then((response) => {
        dataLoading.value = false;
      }).catch((error) => {
        console.log(error);
        dataLoading.value = false;
        Toastify({
          text: "Something went wrong! Please check form values",
          duration: 2000,
          gravity: "bottom", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
          stopOnFocus: false, // Prevents dismissing of toast on hover
          style: {
            background: 'red'
          },
          className: "error",
        }).showToast();
      })
    }

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
