<script>
import {ref} from 'vue'
import axios from 'axios';
import {DEBUG_FLAG} from "./main";
import Toastify from 'toastify-js'
import {FilterMatchMode} from 'primevue/api';
import MainForm from "@/components/MainForm.vue";
import GeneralInfo from "@/components/GeneralInfo.vue";
import ShareButton from "@/components/ShareButton.vue";
import ResultsTable from "@/components/ResultsTable.vue";

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

    const highestGPA = ref({});
    const lowestGPA = ref({});
    const avgGPA = ref('N/A');
    let tableData = ref([]);
    let tableHeaders = ref([]);
    let dataLoading = ref(false);
    if (DEBUG_FLAG) {
      tableData.value = [
        [
          "DAUGHERITY W*",
          "3.71",
          "78.57%",
          "14.29%",
          "7.14%",
          "0.0%",
          "0.0%",
          "0.0%",
          "2"
        ],
        [
          "IOERGER T*",
          "3.5",
          "75.0%",
          "16.67%",
          "0.0%",
          "0.0%",
          "0.0%",
          "8.33%",
          "1"
        ],
        [
          "WELCH J*",
          "3.5",
          "77.52%",
          "10.85%",
          "3.88%",
          "0.0%",
          "0.78%",
          "6.98%",
          "6"
        ],
        [
          "CARLISLE M*",
          "3.46",
          "70.83%",
          "16.67%",
          "4.17%",
          "4.17%",
          "4.17%",
          "0.0%",
          "1"
        ],
        [
          "KEYSER J*",
          "3.43",
          "71.43%",
          "14.29%",
          "7.14%",
          "0.0%",
          "0.0%",
          "7.14%",
          "1"
        ],
        [
          "LEYK T",
          "3.07",
          "42.62%",
          "34.22%",
          "16.19%",
          "1.64%",
          "0.2%",
          "5.12%",
          "2"
        ],
        [
          "CHAMON C",
          "3.02",
          "58.73%",
          "17.46%",
          "6.35%",
          "1.59%",
          "3.17%",
          "12.7%",
          "1"
        ],
        [
          "TAELE P",
          "2.99",
          "53.78%",
          "20.12%",
          "10.56%",
          "2.59%",
          "1.39%",
          "11.55%",
          "4"
        ],
        [
          "LIGHTFOOT R",
          "2.94",
          "51.37%",
          "17.81%",
          "14.38%",
          "6.16%",
          "4.11%",
          "6.16%",
          "2"
        ],
        [
          "HURLEY J",
          "2.88",
          "40.0%",
          "20.0%",
          "28.0%",
          "12.0%",
          "0.0%",
          "0.0%",
          "1"
        ],
        [
          "DA SILVA D",
          "2.86",
          "49.17%",
          "22.65%",
          "9.39%",
          "2.21%",
          "0.0%",
          "16.57%",
          "2"
        ],
        [
          "HUANG Q",
          "2.85",
          "48.31%",
          "20.6%",
          "12.73%",
          "4.12%",
          "0.75%",
          "13.48%",
          "2"
        ],
        [
          "DANG D",
          "2.84",
          "40.0%",
          "31.76%",
          "11.76%",
          "4.71%",
          "2.35%",
          "9.41%",
          "1"
        ],
      ];
      tableHeaders.value = [
        "Professor",
        "GPA",
        "A",
        "B",
        "C",
        "D",
        "F",
        "Q Drops",
        "Semester Count"
      ];
    }

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

      dataLoading.value = false;
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

    // turn from array to Objects with headers matching key
    function transformData() {
      const results = tableData.value.map((row, index) => {
        const obj = {};
        for (let i = 0; i < tableHeaders.value.length; i++) {
          if (i === 0) {
            if (row[i].includes("*")) {
              row[i] = row[i].replace("*", "");
              obj['honors'] = true;
            } else {
              obj['honors'] = false;
            }
            row[i] = titleCase(row[i]);
          }
          obj[tableHeaders.value[i]] = row[i];
        }
        return obj;
      });


      highestGPA.value = results.reduce((currentMax, student) => {
        const currentGPA = student.GPA;
        if (currentGPA > currentMax.GPA) {
          return student;
        }

        return currentMax;
      }, results[0]) || {};

      lowestGPA.value = results.reduce((currentMax, student) => {
        const currentGPA = student.GPA;
        if (currentGPA < currentMax.GPA) {
          return student;
        }

        return currentMax;
      }, results[0]) || {};

      const nonHonorResults = results.filter(prof => !prof.honors);
      const averageGPA = nonHonorResults
          .map((professor) => parseFloat(professor.GPA))
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0) / nonHonorResults.length;

      avgGPA.value = averageGPA.toFixed(2);
      tableData.value = results;
    }

    function onSubmitButtonClick() {
      dataLoading.value = true;

      gtag('event', 'clicked_submit_btn', {
        course: course.value,
        course_number: courseNumber.value,
        sort_by: sortByValue.value['title'],
      });
      makePostRequest().then((response) => {
        transformData();
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

    if (DEBUG_FLAG) {
      transformData();
    }

    async function pressedCopyButton() {
      showToast()
      let currentUrl = `https://grades.jippylong12.xyz/?course=${course.value}&number=${courseNumber.value}&sort_by=${sortByValue.value['value']}`;
      await navigator.clipboard.writeText(currentUrl);
    }

    async function showToast() {
      Toastify({
        text: "Copied!",
        duration: 1000,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: false, // Prevents dismissing of toast on hover
        style: {
          background: 'black'
        },
        className: "info",
      }).showToast();
    }

    function titleCase(str) {
      return str.replace(
          /\w\S*/g,
          function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
      );
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
      pressedCopyButton,
      dataLoading,
      highestGPA,
      lowestGPA,
      avgGPA,
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

      <ResultsTable :table-data="tableData" :data-loading="dataLoading"
                    :highestGPA="highestGPA" :lowestGPA="lowestGPA"
                    :table-headers="tableHeaders" :avgGPA="avgGPA" />

      <ShareButton :show="tableData.length > 0" @click="pressedCopyButton"/>
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
