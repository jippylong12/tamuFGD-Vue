<script setup>
defineProps(['show'])
</script>

<template>
  <v-row no-gutters v-if="show">
    <v-col cols="12" class="py-2">
      <h5 class="suggestion"> Data from Spring 2012 - Spring 2023</h5>
      <h5 class="suggestion"><a
          href="mailto: jippylong12@gmail.com">Email</a> for suggestions
      </h5>
      <h5 class="suggestion"><a href="http://www.jippylong12.xyz">Me</a>
      </h5>
    </v-col>

    <v-col cols="12" class="px-4 py-4">
      <p class="text-center"> I want this to be helpful to all
        students. </p>
      <p class="text-center">An education is the best indicator of success,
        but you don't have to be dumb going about getting one.</p>
      <p class="text-center mb-4"> I will keep updating the course data as
        long as I can.</p>
      <ul class="text-center">
        <li><a href="https://github.com/jippylong12/TAMU_FGD_FRONT_END">
          Front-end Code</a></li>
        <li><a href="https://github.com/jippylong12/TAMU_FGD">Server
          Code</a></li>
        <li><a
            href="https://drive.google.com/drive/folders/0B6WlnfAGiKk9ZlEwcElEZW9rUE0?resourcekey=0-bkINHRtazSza6dDL8MIyIg&usp=sharing">
          CSV DB Files</a></li>
      </ul>
    </v-col>

    <v-col cols="12" class="py-2">
      <p class="text-center"><b>I'm glad this website is helping
        people. </b></p>
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

</template>