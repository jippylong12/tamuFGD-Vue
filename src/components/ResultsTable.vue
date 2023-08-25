<script setup>
import {ref} from "vue";
import {FilterMatchMode} from "primevue/api";

defineProps(['tableData', 'dataLoading', 'highestGPA', 'lowestGPA', 'tableHeaders', 'avgGPA'])
const filters = ref({
  'Professor': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
function determineRowClass(row) {
  if (row.honors) {
    return 'honors'
  } else {
    return null;
  }
}


</script>
<template>
  <v-row v-if="tableData.length > 0 || dataLoading" class="px-4 mb-4">
    <v-col cols="12">
      <DataTable :loading="dataLoading" :rowClass="determineRowClass"
                 :value="tableData"
                 paginator :rows="12" :rowsPerPageOptions="[12, 25, 50]"
                 tableStyle="min-width: 50rem"
                 filterDisplay="row" v-model:filters="filters"
                 :globalFilterFields="['Professor']">
        <template #header>
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
            Total 🔢 {{ tableData.length }}
          </v-chip>

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
          <template v-if="header === 'Professor'"
                    #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()"
                       type="text" class="p-column-filter"
                       placeholder="Filter"/>
          </template>
        </Column>

      </DataTable>
    </v-col>
  </v-row>

</template>