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

  return `https://grades.jippylong12.xyz/?${queryParams.toString()}`;
}

async function pressedCopyButton() {
  showToast()
  const currentUrl = buildShareUrl();
  await navigator.clipboard.writeText(currentUrl);
}

async function showToast() {
  Toastify({
    text: "Share link copied",
    duration: 1200,
    gravity: "bottom",
    position: "center",
    stopOnFocus: false,
    style: {
      background: '#500000'
    },
    className: "info",
  }).showToast();
}

</script>
<template>
  <div v-if="show" class="share-button-shell" @click="pressedCopyButton">
    <button class="copy-url-button">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
           fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
        <path
          d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
      </svg>
      <span>Share View</span>
    </button>
  </div>
</template>

<style scoped>
.share-button-shell {
  position: fixed;
  bottom: 18px;
  right: 18px;
  z-index: 1200;
}

.copy-url-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgb(255 255 255 / 26%);
  background: linear-gradient(120deg, #500000, #6f1b2b);
  color: #fff;
  padding: 11px 16px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 14px 26px rgb(14 17 23 / 26%);
  font-weight: 600;
}

@media (hover: hover) {
  .copy-url-button:hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 700px) {
  .copy-url-button {
    padding: 10px 13px;
    font-size: 0.88rem;
  }
}
</style>
