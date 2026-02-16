<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  course: {
    type: String,
    default: '',
  },
  courseNumber: {
    type: String,
    default: '',
  },
  sortByValue: {
    type: Object,
    default: () => ({
      value: '',
      title: '',
    }),
  },
  filterState: {
    type: Object,
    default: () => ({}),
  },
  isResultsContext: {
    type: Boolean,
    default: false,
  },
});

const feedbackEmail = 'marcus.salinas2@jippylong12.xyz';

function getTextFilter(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) {
    return null;
  }

  return nextValue;
}

function getCurrentQueryUrl() {
  const queryParams = new URLSearchParams();
  if (props.course) {
    queryParams.set('course', props.course);
  }
  if (props.courseNumber) {
    queryParams.set('number', props.courseNumber);
  }

  const sortValue = props.sortByValue && props.sortByValue.value ? String(props.sortByValue.value) : '';
  if (sortValue) {
    queryParams.set('sort_by', sortValue);
  }

  const nextFilterState = props.filterState || {};
  if (props.isResultsContext) {
    const globalFilter = getTextFilter(nextFilterState.globalFilter);
    if (globalFilter) {
      queryParams.set('q', globalFilter);
    }

    const professorFilter = getTextFilter(nextFilterState.professorFilter);
    if (professorFilter) {
      queryParams.set('prof', professorFilter);
    }

    const gpaMinFilter = normalizeNumber(nextFilterState.gpaMinFilter);
    if (gpaMinFilter !== null) {
      queryParams.set('gpa_min', String(gpaMinFilter));
    }

    const gpaMaxFilter = normalizeNumber(nextFilterState.gpaMaxFilter);
    if (gpaMaxFilter !== null) {
      queryParams.set('gpa_max', String(gpaMaxFilter));
    }

    if (nextFilterState.honorsOnlyFilter === true) {
      queryParams.set('honors', '1');
    }
  }

  const query = queryParams.toString();
  const baseUrl = window.location.origin + window.location.pathname;
  if (!query) {
    return baseUrl;
  }

  return `${baseUrl}?${query}`;
}

function getMailBody() {
  const currentFilters = props.filterState || {};
  const includeFilters = props.isResultsContext;
  const lines = [
    'Hi Marcus,',
    '',
    includeFilters ? 'I found an issue with a TAMU FGD result view.' : 'I have a feedback item on TAMU FGD.',
    '',
    `Course: ${props.course || '(not set)'}`,
    `Course number: ${props.courseNumber || '(not set)'}`,
    `Sort by: ${props.sortByValue && props.sortByValue.title ? props.sortByValue.title : 'GPA'}`,
    '',
    'Filters:',
    `- Search text: ${includeFilters ? getTextFilter(currentFilters.globalFilter) || '(none)' : 'not applied'}`,
    `- Professor: ${includeFilters ? getTextFilter(currentFilters.professorFilter) || '(none)' : 'not applied'}`,
    `- GPA min: ${includeFilters ? (normalizeNumber(currentFilters.gpaMinFilter) ?? '(none)') : 'not applied'}`,
    `- GPA max: ${includeFilters ? (normalizeNumber(currentFilters.gpaMaxFilter) ?? '(none)') : 'not applied'}`,
    `- Honors only: ${includeFilters ? (currentFilters.honorsOnlyFilter === true ? 'Yes' : 'No') : 'not applied'}`,
    '',
    `Shared view URL: ${getCurrentQueryUrl()}`,
  ];

  return encodeURIComponent(lines.join('\n'));
}

function getMailtoUrl() {
  const subject = `FGD issue report: ${props.course || ''} ${props.courseNumber || ''}`.trim() || 'FGD issue report';
  return `mailto:${feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${getMailBody()}`;
}
</script>

<template>
  <div v-if="show" class="report-issue-link">
    <a :href="getMailtoUrl()" class="feedback-link" rel="noopener noreferrer">
      {{ isResultsContext ? 'Report an issue with this result set' : 'Report an issue' }}
    </a>
  </div>
</template>

<style scoped>
.report-issue-link {
  display: inline-flex;
}

.feedback-link {
  color: var(--accent-dark);
  font-weight: 700;
  text-decoration: none;
}

.feedback-link:hover {
  text-decoration: underline;
}
</style>
