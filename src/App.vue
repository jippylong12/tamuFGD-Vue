<script>
import { ref } from 'vue'
import axios from 'axios';
import tab from "bootstrap/js/src/tab";

export default {
  setup() {
    const course = ref('')
    const courseNumber = ref('')
    const sortByOptions = [{value: '1', title: 'GPA'}, {value: '2', title: 'Professor Last Name'}];
    const sortByValue = ref({value: '1', title: 'GPA'});
    const tableData = ref([
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
      [
        "POLSLEY S",
        "2.78",
        "49.37%",
        "18.99%",
        "10.13%",
        "3.8%",
        "2.53%",
        "15.19%",
        "1"
      ],
      [
        "DUYSAK A",
        "2.76",
        "49.46%",
        "20.43%",
        "5.38%",
        "6.45%",
        "1.08%",
        "17.2%",
        "1"
      ],
      [
        "JAIN A",
        "2.75",
        "52.5%",
        "20.0%",
        "2.5%",
        "0.0%",
        "7.5%",
        "17.5%",
        "1"
      ],
      [
        "DAUGHERITY W",
        "2.72",
        "31.13%",
        "35.99%",
        "17.6%",
        "4.33%",
        "4.38%",
        "6.57%",
        "17"
      ],
      [
        "ZHANG Y",
        "2.68",
        "34.62%",
        "32.05%",
        "12.82%",
        "7.69%",
        "12.82%",
        "0.0%",
        "1"
      ],
      [
        "RITCHEY P",
        "2.61",
        "39.44%",
        "24.18%",
        "12.48%",
        "5.76%",
        "6.33%",
        "11.8%",
        "6"
      ],
      [
        "STROUSTRUP B",
        "2.6",
        "30.43%",
        "33.91%",
        "15.65%",
        "5.22%",
        "4.35%",
        "10.43%",
        "1"
      ],
      [
        "LEE H",
        "2.6",
        "38.37%",
        "19.77%",
        "20.93%",
        "5.81%",
        "8.14%",
        "6.98%",
        "1"
      ],
      [
        "CARLISLE M",
        "2.56",
        "39.29%",
        "22.62%",
        "13.1%",
        "4.76%",
        "5.95%",
        "14.29%",
        "1"
      ],
      [
        "NEMEC A",
        "2.54",
        "42.31%",
        "24.36%",
        "5.13%",
        "1.28%",
        "7.69%",
        "19.23%",
        "1"
      ],
      [
        "QUINN M",
        "2.53",
        "34.72%",
        "25.93%",
        "15.28%",
        "6.02%",
        "1.85%",
        "16.2%",
        "3"
      ],
      [
        "FERREIRA C",
        "2.47",
        "27.78%",
        "27.78%",
        "22.22%",
        "7.78%",
        "1.11%",
        "13.33%",
        "1"
      ],
      [
        "SOTO C",
        "2.46",
        "31.46%",
        "28.09%",
        "16.85%",
        "2.25%",
        "6.74%",
        "14.61%",
        "1"
      ],
      [
        "MOORE J",
        "2.42",
        "33.26%",
        "25.51%",
        "12.71%",
        "6.79%",
        "6.67%",
        "15.06%",
        "23"
      ],
      [
        "TAYLOR B",
        "2.42",
        "28.27%",
        "28.8%",
        "16.23%",
        "9.95%",
        "3.14%",
        "13.61%",
        "1"
      ],
      [
        "NOWAK M",
        "2.4",
        "31.02%",
        "25.48%",
        "16.46%",
        "6.41%",
        "2.43%",
        "18.2%",
        "6"
      ],
      [
        "MCGUIRE T",
        "2.37",
        "32.24%",
        "26.32%",
        "11.62%",
        "5.48%",
        "7.68%",
        "16.67%",
        "3"
      ],
      [
        "GARZA E",
        "2.26",
        "26.14%",
        "30.68%",
        "11.36%",
        "6.82%",
        "3.41%",
        "21.59%",
        "1"
      ],
      [
        "HOUNGNINOU D",
        "2.17",
        "22.86%",
        "28.57%",
        "14.29%",
        "11.43%",
        "20.0%",
        "2.86%",
        "1"
      ],
      [
        "KEYSER J",
        "2.06",
        "29.41%",
        "17.65%",
        "11.76%",
        "11.76%",
        "11.76%",
        "17.65%",
        "1"
      ],
      [
        "LUPOLI S",
        "1.86",
        "27.07%",
        "17.03%",
        "10.48%",
        "5.24%",
        "6.11%",
        "34.06%",
        "1"
      ],
      [
        "SHELL D",
        "1.82",
        "19.86%",
        "27.18%",
        "8.36%",
        "4.53%",
        "5.23%",
        "34.84%",
        "2"
      ]
    ]);
    const tableHeaders = ref([
      "Professor",
      "GPA",
      "A",
      "B",
      "C",
      "D",
      "F",
      "Q Drops",
      "Semester Count"
    ])

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
          console.log(data.results);
        }
      } else {
        // The request failed
        console.log(response.error);
      }
    };

    function addSearchParams() {
      const searchParams = new URLSearchParams(window.location.search);
      const sortByInput = document.getElementById("sort_by");

      course.value = searchParams.get("course");
      courseNumber.value = searchParams.get("number");
      if(searchParams.get("sort_by")){
        sortByInput.value = searchParams.get("sort_by")
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
          }
          obj[tableHeaders.value[i]] = row[i];
        }
        return obj;
      });
      console.log(results)

      tableData.value = results;
    }

    function onSubmitButtonClick() {
      gtag('event', 'clicked_submit_btn', {
        course: course.value,
        course_number: courseNumber.value,
        sort_by: sortByValue.value['title'],
      });
      makePostRequest().then((response) => {
        transformData();
      })
    }

    transformData();
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
                    <v-text-field label="Course (Ex: CSCE)" v-model="course" maxlength="4" @click="setupCourseElem"></v-text-field>
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

      <v-row no-gutters v-if="tableData.length === 0">
        <v-col cols="12" class="py-2">
          <h5 class="suggestion"> Data from Spring 2012 - Fall 2022</h5>
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
      <v-row v-if="tableData.length > 0" class="px-4 mb-4">
        <v-col cols="12">
          <DataTable :value="tableData" paginator :rows="12" :rowsPerPageOptions="[12, 25, 50]" tableStyle="min-width: 50rem">
            <Column v-for="header of tableHeaders" :field="header" :header="header"></Column>
          </DataTable>
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
