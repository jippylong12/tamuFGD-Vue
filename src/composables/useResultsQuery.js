import {computed, ref, watch} from 'vue'
import Toastify from 'toastify-js'

export function useResultsQuery(axios) {
  const cacheNamespace = 'fgd-query-cache';
  const cacheMaxAgeMs = 6 * 60 * 60 * 1000;

  const course = ref('')
  const courseNumber = ref('')
  const sortByOptions = [{value: '1', title: 'GPA'}, {
    value: '2', title: 'Professor Last Name'
  }];
  const sortByValue = ref({value: '1', title: 'GPA'});
  const departmentCatalog = ref([]);
  const courseNumberCatalog = ref({});

  const tableData = ref([]);
  const tableHeaders = ref([]);
  const dataLoading = ref(false);
  const hasSearched = ref(false);
  const validationErrors = ref({});
  const serverMessage = ref('');
  const datasetMetadata = ref({});
  const datasetFingerprint = ref('unknown');
  let latestSubmitId = 0;
  const lastUpdatedText = computed(() => {
    const raw = datasetMetadata.value?.generated_at;
    if (!raw) {
      return '';
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return `Last updated: ${parsed.toLocaleString()}`;
  });

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }

  gtag('js', new Date());
  gtag('config', 'G-B24WEF5K6V');

  function showToast(message) {
    Toastify({
      text: message,
      duration: 2000,
      gravity: "bottom",
      position: "center",
      stopOnFocus: false,
      style: {
        background: 'red'
      },
      className: "error",
    }).showToast();
  }

  function computeDatasetFingerprint(meta) {
    const source = meta?.source || {};
    return [
      meta?.version || '',
      source?.filename || '',
      source?.size || '',
      source?.mtime || '',
      meta?.generated_at || '',
    ].join('|');
  }

  function normalizeCachePart(value) {
    return encodeURIComponent((value || '').trim());
  }

  function makeCacheKey() {
    const normalizedCourse = course.value.trim().toUpperCase();
    const normalizedCourseNumber = courseNumber.value.trim();
    const normalizedSortBy = sortByValue.value['value'];
    const cacheKey = `${cacheNamespace}::${datasetFingerprint.value}::${normalizeCachePart(normalizedCourse)}-${normalizeCachePart(normalizedCourseNumber)}-${normalizeCachePart(normalizedSortBy)}`;
    return cacheKey;
  }

  function pruneOldQueryCacheEntries() {
    if (!window.sessionStorage) {
      return;
    }

    const activePrefix = `${cacheNamespace}::${datasetFingerprint.value}::`;
    const obsoleteKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) {
        continue;
      }

      if (!key.startsWith(`${cacheNamespace}::`)) {
        continue;
      }

      if (!key.startsWith(activePrefix)) {
        obsoleteKeys.push(key);
      }
    }

    for (const keyToDelete of obsoleteKeys) {
      sessionStorage.removeItem(keyToDelete);
    }
  }

  function isFreshCacheEntry(entry) {
    if (!entry || !entry.cached_at) {
      return false;
    }

    const parsed = Number(entry.cached_at);
    if (Number.isNaN(parsed)) {
      return false;
    }

    return Date.now() - parsed <= cacheMaxAgeMs;
  }

  function cacheQueryResult(cacheKey, payload) {
    if (!window.sessionStorage) {
      return;
    }

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        datasetFingerprint: datasetFingerprint.value,
        cached_at: Date.now(),
        payload,
      }));
    } catch {
      // Ignore storage failures (private browsing, quota exceeded, etc).
    }
  }

  function loadQueryCache(cacheKey) {
    if (!window.sessionStorage) {
      return null;
    }

    try {
      const rawValue = sessionStorage.getItem(cacheKey);
      if (!rawValue) {
        return null;
      }

      const parsedValue = JSON.parse(rawValue);
      if (!parsedValue || parsedValue.datasetFingerprint !== datasetFingerprint.value || !isFreshCacheEntry(parsedValue)) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }
      return parsedValue.payload || null;
    } catch {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
  }

  function loadDatasetMetadata() {
    return axios.get('/MasterDBs/MasterDB.meta.json')
      .then((response) => {
        if (response && response.data) {
          datasetMetadata.value = response.data;
          datasetFingerprint.value = computeDatasetFingerprint(response.data);
        } else {
          datasetMetadata.value = {};
          datasetFingerprint.value = 'unknown';
        }
      })
      .catch(() => {
        datasetMetadata.value = {};
        datasetFingerprint.value = 'unknown';
      })
      .finally(() => {
        pruneOldQueryCacheEntries();
      });
  }

  const departmentSuggestions = computed(() => {
    const normalizedDepartment = (course.value || '').trim().toUpperCase();
    if (!normalizedDepartment) {
      return departmentCatalog.value;
    }

    return departmentCatalog.value.filter((nextDepartment) =>
      nextDepartment.startsWith(normalizedDepartment)
    );
  });

  const courseNumberSuggestions = computed(() => {
    const normalizedDepartment = (course.value || '').trim().toUpperCase();
    const allCourseNumbers = courseNumberCatalog.value[normalizedDepartment] || [];
    const normalizedCourseNumber = (courseNumber.value || '').trim();

    if (!normalizedCourseNumber) {
      return allCourseNumbers;
    }

    return allCourseNumbers.filter((nextNumber) =>
      nextNumber.startsWith(normalizedCourseNumber)
    );
  });

  function normalizeDepartmentFromCourseCode(courseCode) {
    return (courseCode || '').toUpperCase().trim();
  }

  function parseCourseCode(courseCode) {
    const normalizedCourseCode = normalizeDepartmentFromCourseCode(courseCode);
    const splitIndex = normalizedCourseCode.indexOf('-');
    if (splitIndex < 1) {
      return null;
    }

    const department = normalizedCourseCode.slice(0, splitIndex);
    const courseNumber = normalizedCourseCode.slice(splitIndex + 1);
    if (!/^[A-Z]{4}$/.test(department)) {
      return null;
    }
    if (!/^\d{3,5}$/.test(courseNumber)) {
      return null;
    }

    return {
      department,
      courseNumber,
    };
  }

  function normalizeCourseNumbers(rawNumbers) {
    return [...new Set(rawNumbers)].sort((left, right) =>
      parseInt(left, 10) - parseInt(right, 10)
    );
  }

  function buildCourseCatalog(coursesByCode) {
    if (!coursesByCode || typeof coursesByCode !== 'object') {
      departmentCatalog.value = [];
      courseNumberCatalog.value = {};
      return;
    }

    const departmentMap = {};
    for (const [courseCode] of Object.entries(coursesByCode)) {
      if (typeof courseCode !== 'string') {
        continue;
      }

      const parsed = parseCourseCode(courseCode);
      if (!parsed) {
        continue;
      }

      const existing = departmentMap[parsed.department] || [];
      existing.push(parsed.courseNumber);
      departmentMap[parsed.department] = existing;
    }

    const nextDepartments = Object.keys(departmentMap).sort();
    const nextCourseNumberCatalog = {};
    for (const department of nextDepartments) {
      nextCourseNumberCatalog[department] = normalizeCourseNumbers(departmentMap[department]);
    }

    departmentCatalog.value = nextDepartments;
    courseNumberCatalog.value = nextCourseNumberCatalog;
  }

  function loadCourseIndexMetadata() {
    return axios.get('/MasterDBs/MasterDB.index.json')
      .then((response) => {
        const payload = response && response.data;
        if (!payload || typeof payload !== 'object') {
          return;
        }

        buildCourseCatalog(payload.courses || {});
      })
      .catch(() => {
        departmentCatalog.value = [];
        courseNumberCatalog.value = {};
      });
  }

  function applyResultPayload(payload) {
    tableHeaders.value = payload?.tableHeaders || [];
    tableData.value = payload?.tableData || [];
    serverMessage.value = payload?.serverMessage || '';
  }

  function shouldCachePayload(payload) {
    if (!payload) {
      return false;
    }

    if (payload.errorCode === 'NO_RESULTS') {
      return true;
    }

    return Array.isArray(payload.tableData);
  }

  function applyBackendValidationErrors(responseData) {
    const nextErrors = {};
    if (!responseData || !Array.isArray(responseData.errors)) {
      validationErrors.value = {};
      return;
    }

    for (const validationError of responseData.errors) {
      if (!validationError || !validationError.field || !validationError.message) {
        continue;
      }
      nextErrors[validationError.field] = validationError.message;
    }

    validationErrors.value = nextErrors;
  }

  function runClientValidation() {
    const nextErrors = {};
    const normalizedCourse = (course.value || '').trim();
    const normalizedCourseNumber = (courseNumber.value || '').trim();
    const numberValue = parseInt(normalizedCourseNumber, 10);

    if (!/^[A-Za-z]{4}$/.test(normalizedCourse)) {
      nextErrors.course = 'Department must be exactly 4 letters (A-Z).';
    }

    if (normalizedCourseNumber === '' || !/^\d+$/.test(normalizedCourseNumber) || numberValue < 100 || numberValue > 10000) {
      nextErrors.course_number = 'Course number must be a number between 100 and 10000.';
    }

    validationErrors.value = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  function makePostRequest() {
    const formData = {
      course: course.value.trim().toUpperCase(),
      course_number: courseNumber.value.trim(),
      sort_by: sortByValue.value['value'],
    }

    return axios.post('results.php', formData)
      .then((response) => {
        const data = response.data || {};

        if (response.status === 200 && data.success) {
          return {
            tableHeaders: data.headers || [],
            tableData: data.results || [],
            serverMessage: '',
          };
        }

        applyBackendValidationErrors(data);
        if (data.error_code === 'NO_RESULTS') {
          return {
            errorCode: 'NO_RESULTS',
            tableHeaders: [],
            tableData: [],
            serverMessage: data.message || 'No results were found for this request.',
          };
        }

        serverMessage.value = data.message || 'Request failed.';
        throw new Error(serverMessage.value);
      });
  }

  function onSubmitButtonClick() {
    if (dataLoading.value) {
      return;
    }

    const isValid = runClientValidation();
    if (!isValid) {
      return;
    }

    hasSearched.value = true;
    const submitId = ++latestSubmitId;
    const cacheKey = makeCacheKey();
    const cachedPayload = loadQueryCache(cacheKey);
    if (cachedPayload) {
      applyResultPayload(cachedPayload);
      dataLoading.value = false;
      return;
    }

    dataLoading.value = true;
    serverMessage.value = '';
    validationErrors.value = {};

    gtag('event', 'clicked_submit_btn', {
      course: course.value,
      course_number: courseNumber.value,
      sort_by: sortByValue.value['title'],
    });

    makePostRequest().then((payload) => {
      if (submitId !== latestSubmitId) {
        return;
      }

      if (!payload) {
        dataLoading.value = false;
        return;
      }

      applyResultPayload(payload);
      if (shouldCachePayload(payload)) {
        cacheQueryResult(cacheKey, payload);
      }
      dataLoading.value = false;
    }).catch((error) => {
      if (submitId !== latestSubmitId) {
        return;
      }

      dataLoading.value = false;

      if (!serverMessage.value) {
        serverMessage.value = 'Something went wrong! Please check form values.';
      }

      if (error.response && error.response.status === 400 && error.response.data) {
        applyBackendValidationErrors(error.response.data);
        serverMessage.value = error.response.data.message || serverMessage.value;
      }

      if (error.response && error.response.status === 404 && error.response.data && error.response.data.error_code === 'NO_RESULTS') {
        tableData.value = [];
        tableHeaders.value = [];
        serverMessage.value = error.response.data.message || serverMessage.value;
      }

      if (serverMessage.value) {
        showToast(serverMessage.value);
      }
    });
  }

  function addSearchParams() {
    const searchParams = new URLSearchParams(window.location.search);
    course.value = searchParams.get("course") || '';
    courseNumber.value = searchParams.get("number") || '';
    const sortByParamValue = searchParams.get("sort_by")
    if (sortByParamValue) {
      const sortVal = sortByOptions.find((a) => a.value === sortByParamValue)
      if (sortVal) {
        sortByValue.value = sortVal;
      }
    }

    if (course.value && courseNumber.value) {
      onSubmitButtonClick();
    }
  }

  watch(course, (nextCourseValue) => {
    if (!nextCourseValue) {
      return;
    }

    const normalizedCourse = normalizeDepartmentFromCourseCode(nextCourseValue);
    if (normalizedCourse !== nextCourseValue) {
      course.value = normalizedCourse;
    }
  });

  function clearValidationError(fieldName) {
    if (!validationErrors.value[fieldName]) {
      return;
    }

    const nextErrors = {...validationErrors.value};
    delete nextErrors[fieldName];
    validationErrors.value = nextErrors;
  }

  return {
    course,
    courseNumber,
    departmentSuggestions,
    courseNumberSuggestions,
    sortByOptions,
    sortByValue,
    tableData,
    tableHeaders,
    dataLoading,
    hasSearched,
    validationErrors,
    serverMessage,
    datasetMetadata,
    lastUpdatedText,
    loadDatasetMetadata,
    loadCourseIndexMetadata,
    addSearchParams,
    clearValidationError,
    onSubmitButtonClick,
  }
}
