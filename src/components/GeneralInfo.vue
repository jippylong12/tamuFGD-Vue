<script setup>
import {computed} from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  datasetMetadata: {
    type: Object,
    default: () => ({}),
  },
});

const termRangeText = computed(() => {
  const termRange = props.datasetMetadata?.coverage?.term_range || props.datasetMetadata?.term_range;
  if (termRange && termRange.start && termRange.end) {
    return `Data window: ${termRange.start} - ${termRange.end}`;
  }
  return 'Data window: Spring 2012 - Summer 2023';
});
</script>

<template>
  <v-row no-gutters v-if="show" class="info-shell">
    <v-col cols="12" class="px-4 px-sm-6 pt-5">
      <p class="info-kicker">How to use this</p>
      <h3 class="info-title">Fast grade-distribution context for better registration choices.</h3>
      <p class="info-range">{{ termRangeText }}</p>
    </v-col>

    <v-col cols="12" md="7" class="px-4 px-sm-6 py-3">
      <div class="info-panel">
        <h4>What this app helps with</h4>
        <ul>
          <li>Quickly compare instructors for the same course.</li>
          <li>Spot grade spread patterns and withdrawal risk before enrollment.</li>
          <li>Share specific filtered views with classmates in one link.</li>
        </ul>
      </div>
    </v-col>

    <v-col cols="12" md="5" class="px-4 px-sm-6 py-3">
      <div class="info-panel">
        <h4>Acknowledgements</h4>
        <ul class="credits-list">
          <li><b>My Momma:</b> #1</li>
          <li><b>Matthew:</b> q-drop column update</li>
          <li><b>Zubin:</b> averaging feedback</li>
          <li><b>Eric:</b> honors distinction suggestion</li>
        </ul>
      </div>
    </v-col>

    <v-col cols="12" class="px-4 px-sm-6 pb-6 pt-2">
      <a href="https://github.com/jippylong12/TAMU_FGD" target="_blank" rel="noopener noreferrer" class="repo-link">
        View the open-source pipeline
      </a>
    </v-col>
  </v-row>
</template>

<style scoped>
.info-shell {
  border-radius: inherit;
}

.info-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent-dark);
}

.info-title {
  margin: 10px 0 8px;
  font-family: var(--font-display);
  font-size: clamp(1.22rem, 2vw, 1.7rem);
  line-height: 1.2;
  color: var(--text-primary);
}

.info-range {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.info-panel {
  height: 100%;
  border: 1px solid rgb(27 33 42 / 10%);
  border-radius: 16px;
  padding: 16px 18px;
  background: linear-gradient(180deg, rgb(255 255 255 / 80%), rgb(250 249 246 / 72%));
}

.info-panel h4 {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--text-primary);
}

.info-panel ul {
  margin: 0;
  padding-left: 18px;
  color: var(--text-secondary);
  line-height: 1.58;
}

.credits-list {
  list-style: none;
  padding-left: 0;
}

.credits-list li {
  margin-bottom: 8px;
}

.repo-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-dark);
  font-weight: 700;
  text-decoration: none;
}

.repo-link:hover {
  text-decoration: underline;
}
</style>
