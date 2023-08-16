<script>
import { ref } from 'vue'
import axios from 'axios';

export default {
  setup() {
    const course = ref('')
    const courseNumber = ref('')
    const sortByOptions = [{value: '1', title: 'GPA'}, {value: '2', title: 'Professor Last Name'}];
    const sortByValue = ref({value: '1', title: 'GPA'});
    const tableData = ref([]);
    const tableHeaders = ref([])

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

    function determineRowClass(row) {
      if(row.honors) {
        return 'honors'
      } else {return null;}
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
          <DataTable :rowClass="determineRowClass" :value="tableData" paginator :rows="12" :rowsPerPageOptions="[12, 25, 50]" tableStyle="min-width: 50rem">
            <Column v-for="header of tableHeaders" :field="header" :header="header">
              <template v-if="header === 'Professor'"  #body="{ field, data }">
                <div :class="data['honors'] === true ? 'shimmer' : null">
                  {{ data[field] }}
                </div>
              </template>
            </Column>
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
