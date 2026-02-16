<script setup>
import Toastify from "toastify-js";

const props = defineProps(['show', 'course', 'courseNumber', 'sortByValue', 'filterState'])
defineEmits(['click'])

function getTextFilter(value) {
  if (typeof value !== 'string') {
    return value || '';
  }

  return value.trim();
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function buildShareUrl() {
  const queryParams = new URLSearchParams();
  const sortValue = props.sortByValue && props.sortByValue.value ? String(props.sortByValue.value) : '';
  queryParams.set('course', props.course || '');
  queryParams.set('number', props.courseNumber || '');
  queryParams.set('sort_by', sortValue || '');

  const nextFilterState = props.filterState || {};
  const globalFilter = getTextFilter(nextFilterState.globalFilter);
  if (globalFilter) {
    queryParams.set('q', globalFilter);
  }

  const professorFilter = getTextFilter(nextFilterState.professorFilter);
  if (professorFilter) {
    queryParams.set('prof', professorFilter);
  }

  const gpaMinFilter = Number(nextFilterState.gpaMinFilter);
  if (isNumber(gpaMinFilter)) {
    queryParams.set('gpa_min', String(gpaMinFilter));
  }

  const gpaMaxFilter = Number(nextFilterState.gpaMaxFilter);
  if (isNumber(gpaMaxFilter)) {
    queryParams.set('gpa_max', String(gpaMaxFilter));
  }

  if (nextFilterState.honorsOnlyFilter === true) {
    queryParams.set('honors', '1');
  }

  return `https://grades.jippylong12.xyz/?${queryParams.toString()}`;
}

async function pressedCopyButton() {
  showToast()
  const currentUrl = buildShareUrl();
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

</script>
<template>
  <div v-if="show" id="copy-url-button"
       @click="pressedCopyButton">
    <button class="copy-url-button">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
           fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
        <path
            d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
      </svg>
      <span class="ms-1">
                Share
            </span>
    </button>
  </div>
</template>

<style scoped>
.copy-url-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #000;
  color: #fff;
  padding: 12px 20px;
  border-radius: 32px;
  cursor: pointer;
}

@media (hover: hover) {
  .copy-url-button:hover {
    background-color: #333;
  }
}
</style>
