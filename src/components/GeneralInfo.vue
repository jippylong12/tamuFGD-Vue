<script setup>
defineProps(['show'])
</script>

<template>
  <v-row no-gutters v-if="show">
    <v-col cols="12" class="py-2">
      <h5 class="suggestion"><a href="https://www.jippylong12.xyz">👋🏽 Me</a></h5>
      <h5 class="suggestion"> Data from Spring 2012 - Spring 2023</h5>
    </v-col>

    <v-col cols="12" class="px-4 pb-4">
      <p class="text-center"> I want this to be helpful to all
        students. </p>
      <p class="text-center">An education is the best indicator of success,
        but you don't have to be dumb going about getting one.</p>
      <p class="text-center mb-4"> I will keep updating the course data as
        long as I can.</p>

    </v-col>

    <v-col cols="12">
      <h5 class="suggestion"> Thanks & Acknowledgements</h5>
      <h5 class="credits">
        <b>My Momma: #1🥇</b><br>
        <b>Matthew:</b> adding the Q drop column.<br>
        <b>Zubin:</b> Pointing out the averaging problem.<br>
        <b>Eric:</b> Suggesting to distinguish honors sections.
      </h5>
    </v-col>

    <v-col cols="12" class="px-4 py-4">
      <ul class="text-center">
        <li><a href="https://github.com/jippylong12/TAMU_FGD">Server
          Code</a></li>
      </ul>
    </v-col>
  </v-row>
</template>