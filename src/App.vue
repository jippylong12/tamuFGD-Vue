<script>
import {ref} from 'vue'
import axios from 'axios';
import {DEBUG_FLAG} from "./main";
import Toastify from 'toastify-js'
import {FilterMatchMode} from 'primevue/api';

export default {
  setup() {
    const course = ref('')
    const courseNumber = ref('')
    const sortByOptions = [{value: '1', title: 'GPA'}, {value: '2', title: 'Professor Last Name'}];
    const sortByValue = ref({value: '1', title: 'GPA'});
    const filters = ref({
      'Professor': { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const highestGPA = ref({});
    const lowestGPA = ref({});
    const avgGPA = ref('N/A');
    let tableData = ref([]);
    let tableHeaders = ref([]);
    let dataLoading = ref(false);
    if(DEBUG_FLAG) {
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
    function gtag(){dataLayer.push(arguments);}
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
        if(data.success){
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
      if(sortByParamValue){
        let sortVal = sortByOptions.find((a) => a.value === sortByParamValue)
        if(sortVal){
          sortByValue.value = sortVal
        }
      }

      if (course.value && courseNumber.value) {
        onSubmitButtonClick();
      }}

    function setupCourseElem() {
      gtag('event', 'clicked_course');
    }

    function setupCourseNumber() {
      gtag('event', 'clicked_course_number');
    }

    function setupSortBy() {
      gtag('event', 'clicked_sort_by');
    }

    // turn from array to Objects with headers matching key
    function transformData() {
      const results = tableData.value.map((row, index) => {
        const obj = {};
        for (let i = 0; i < tableHeaders.value.length; i++) {
          if(i === 0){
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

      const averageGPA = results
          .map((professor) => parseFloat(professor.GPA))
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0) / results.length;

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

    function determineRowClass(row) {
      if(row.honors) {
        return 'honors'
      } else {return null;}
    }

    if(DEBUG_FLAG){
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
          function(txt) {
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
      setupCourseElem,
      setupCourseNumber,
      setupSortBy,
      onSubmitButtonClick,
      determineRowClass,
      pressedCopyButton,
      dataLoading,
      filters,
      highestGPA,
      lowestGPA,
      avgGPA,
    }
  },
}
</script>
<template>
  <v-app>
    <v-container fluid="true" class="pa-1">
      <h1 class="title"> TAMU Free Grade Distribution</h1>

      <v-row no-gutters>
        <v-col cols="12" class="mt-2 px-4">
          <v-row justify="center" no-gutters>
            <v-col cols="12">
              <p class="text-center text-h6">Enter the course information below and press submit. Golden rows are Honors only.</p>
            </v-col>
            <v-col cols="12" lg="6" class="pt-4">
                <v-row>
                  <v-col cols="12" sm="6" class="py-0">
                    <v-text-field label="Department (Ex: CSCE)" v-model="course" maxlength="4" @click="setupCourseElem"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" class="py-0">
                    <v-text-field label="Course Number (Ex: 111)" v-model="courseNumber" @click="setupCourseNumber"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" class="py-0">
                    <v-select
                        label="Sort By:"
                        v-model="sortByValue"
                        :items="sortByOptions"
                        @change="setupSortBy"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" align-self="start">
                    <v-btn color="black" block="true" @click="onSubmitButtonClick">Submit</v-btn>
                  </v-col>
                </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row no-gutters v-if="tableData.length === 0 && !dataLoading">
        <v-col cols="12" class="py-2">
          <h5 class="suggestion"> Data from Spring 2012 - Spring 2023</h5>
          <h5 class="suggestion"> <a href="mailto: jippylong12@gmail.com">Email</a> for suggestions</h5>
          <h5 class="suggestion"><a href="http://www.jippylong12.xyz">Me</a></h5>
        </v-col>

        <v-col cols="12" class="px-4 py-4">
          <p class="text-center"> I want this to be helpful to all students. </p>
          <p class="text-center">An education is the best indicator of success, but you don't have to be dumb going about getting one.</p>
          <p class="text-center mb-4"> I will keep updating the course data as long as I can.</p>
          <ul class="text-center">
            <li><a href="https://github.com/jippylong12/TAMU_FGD_FRONT_END"> Front-end Code</a></li>
            <li><a href="https://github.com/jippylong12/TAMU_FGD">Server Code</a></li>
            <li><a href="https://drive.google.com/drive/folders/0B6WlnfAGiKk9ZlEwcElEZW9rUE0?resourcekey=0-bkINHRtazSza6dDL8MIyIg&usp=sharing"> CSV DB Files</a></li>
          </ul>
        </v-col>

        <v-col cols="12" class="py-2">
          <p style="text-align: center"><b>I'm glad this website is helping people. </b> </p>
        </v-col>
        <v-col cols="12">
          <h5 class="suggestion"> Thanks & Acknowledgements</h5>
          <h5 class="credits">
            <b>My Momma: #1</b><br>
            <b>Matthew:</b> adding the Q drop column.<br>
            <b>Zubin:</b> Pointing out the averaging problem.<br>
            <b>Eric:</b> Suggesting to distinguish honors sections.
          </h5>
        </v-col>
      </v-row>
      <v-row v-if="tableData.length > 0 || dataLoading" class="px-4 mb-4">
        <v-col cols="12">
          <DataTable :loading="dataLoading" :rowClass="determineRowClass" :value="tableData"
                     paginator :rows="12" :rowsPerPageOptions="[12, 25, 50]" tableStyle="min-width: 50rem"
                     filterDisplay="row"  v-model:filters="filters" :globalFilterFields="['Professor']">
            <template #header>
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="green"
                  text-color="white"
                  label
              >
                Highest GPA 🎓😁🏅 {{highestGPA['Professor']}} - {{highestGPA['GPA']}}
              </v-chip>
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="red"
                  text-color="white"
                  label>
                Lowest GPA 😔🙏 {{lowestGPA['Professor']}} - {{lowestGPA['GPA']}}
              </v-chip>
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="blue"
              >
                Avg. GPA 🧮 {{avgGPA}}
              </v-chip>
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="blue-grey"
              >
                Total 🔢 {{tableData.length}}
              </v-chip>

            </template>
            <template #empty> No records found. </template>
            <Column sortable="true" v-for="header of tableHeaders" :field="header" :header="header"  :showFilterMenu="false" :style="header === 'Professor' ? 'min-width: 14rem' : ''">
              <template v-if="header === 'Professor'"  #body="{ field, data }">
                <div :class="data['honors'] === true ? 'shimmer' : null">
                  {{ data[field] }}
                </div>
              </template>
              <template v-if="header === 'Professor'" #filter="{ filterModel, filterCallback }">
                <InputText v-model="filterModel.value" @input="filterCallback()"  type="text" class="p-column-filter" placeholder="Filter" />
              </template>
            </Column>

          </DataTable>
        </v-col>
      </v-row>

      <div v-if="tableData.length > 0" id="copy-url-button" @click="pressedCopyButton">
        <button class="copy-url-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
          </svg>
          <span class="ms-1">
                Share
            </span>
        </button>
      </div>
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
