<script setup>
import {FilterMatchMode} from "primevue/api";
import {ref, onUpdated} from "vue";

const props = defineProps(['tableData', 'dataLoading', 'tableHeaders',])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Professor': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
let transformedData = transformData();
let highestGPA = getHighestGPA(transformedData);
let lowestGPA = getLowestGPA(transformedData);
let avgGPA = getAverageGPA(transformedData);

onUpdated(() => {
  if(props.dataLoading){
    transformedData = transformData();
    highestGPA = getHighestGPA(transformedData);
    lowestGPA = getLowestGPA(transformedData);
    avgGPA = getAverageGPA(transformedData);
  }
})

function determineRowClass(row) {
  if (row.honors) {
    return 'honors'
  } else {
    return null;
  }
}

function getHighestGPA(data) {
  return data.reduce((currentMax, student) => {
    const currentGPA = student.GPA;
    if (currentGPA > currentMax.GPA) {
      return student;
    }

    return currentMax;
  }, data[0]) || {};
}

function getLowestGPA(data) {
  return data.reduce((currentMax, student) => {
    const currentGPA = student.GPA;
    if (currentGPA < currentMax.GPA) {
      return student;
    }

    return currentMax;
  }, data[0]) || {};
}

function getAverageGPA(data) {
  const nonHonorResults = data.filter(prof => !prof.honors);
  const averageGPA = nonHonorResults
      .map((professor) => parseFloat(professor.GPA))
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0) / nonHonorResults.length;

  return averageGPA.toFixed(2);
}

// turn from array to Objects with headers matching key
function transformData() {
  return props.tableData.map((row, index) => {
    const obj = {};
    for (let i = 0; i < props.tableHeaders.length; i++) {
      if (i === 0) {
        if (row[i].includes("*")) {
          row[i] = row[i].replace("*", "");
          obj['honors'] = true;
        } else {
          obj['honors'] = false;
        }
        row[i] = titleCase(row[i]);
      }
      obj[props.tableHeaders[i]] = row[i];
    }
    return obj;
  });

  function titleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
  }

}


</script>
<template>
  <v-row v-if="transformedData.length > 0 || dataLoading" class="px-4">
    <v-col cols="12">
      <DataTable :loading="dataLoading" :rowClass="determineRowClass"
                 :value="transformedData"
                 paginator :rows="12" :rowsPerPageOptions="[12, 25, 50]"
                 tableStyle="min-width: 50rem"
                 filterDisplay="row" v-model:filters="filters"
                 :globalFilterFields="['Professor']">
        <template #header>
          <v-row no-gutters>
            <v-col cols="12" sm="8" lg="10" align-self="center">
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="green"
                  text-color="white"
                  :label="true"
              >
                Highest GPA 🎓😁🏅 {{ highestGPA['Professor'] }} -
                {{ highestGPA['GPA'] }}
              </v-chip>
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="red"
                  text-color="white"
                  :label="true"

              >
                Lowest GPA 😔🙏 {{ lowestGPA['Professor'] }} -
                {{ lowestGPA['GPA'] }}
              </v-chip>
              <v-chip
                  class="ma-2 font-weight-bold"
                  color="blue"
                  :label="true"
              >
                Avg. GPA 🧮 (Non Hon) {{ avgGPA }}
              </v-chip>

              <v-chip
                  class="ma-2 font-weight-bold"
                  color="blue-grey"
                  :label="true"
              >
                Total 🔢 {{ transformedData.length }}
              </v-chip>
            </v-col>
            <v-col cols="12" sm="4" lg="2">
              <v-text-field v-model="filters['global'].value" placeholder="Search" color="white" variant="solo-filled"/>
            </v-col>
          </v-row>


        </template>
        <template #empty> No records found.</template>
        <Column :sortable=true v-for="header of tableHeaders"
                :field="header" :header="header" :showFilterMenu="false"
                :style="header === 'Professor' ? 'min-width: 14rem' : ''">
          <template v-if="header === 'Professor'" #body="{ field, data }">
            <div :class="data['honors'] === true ? 'shimmer' : null">
              {{ data[field] }}
            </div>
          </template>

        </Column>

      </DataTable>
    </v-col>
  </v-row>

</template>

<style scoped>

.search-box {
  color: black;
  background-color: white;
}

.search-box::placeholder {
  background-color: whitesmoke;
  color: black;
}

</style>