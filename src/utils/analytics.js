const INTERNAL_DOMAIN_ROOT = 'jippylong12.xyz';
const MAILTO_PREFIX = 'mailto:';

let linkTrackingInitialized = false;
let pageViewTrackingInitialized = false;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeGaField(value, fallback = 'unknown') {
  const normalizedValue = normalizeString(value);
  return normalizedValue || fallback;
}

function getAnchorDataValue(anchorElement, key) {
  let current = anchorElement;
  while (current && current instanceof Element) {
    const rawValue = current.dataset ? current.dataset[key] : '';
    const normalizedValue = normalizeString(rawValue);
    if (normalizedValue) {
      return normalizedValue;
    }
    current = current.parentElement;
  }
  return '';
}

function deriveLinkKind(rawHref, destinationHost, destinationUrl) {
  const normalizedHref = normalizeString(rawHref).toLowerCase();
  if (normalizedHref.startsWith(MAILTO_PREFIX)) {
    return 'mailto';
  }

  const normalizedHost = normalizeString(destinationHost).toLowerCase();
  if (!normalizedHost) {
    return 'unknown';
  }

  if (isInternalDomain(normalizedHost)) {
    return 'internal';
  }

  if (destinationUrl) {
    return 'external';
  }

  return 'unknown';
}

function getDestinationHost(rawHref) {
  const normalizedHref = normalizeString(rawHref);
  if (!normalizedHref) {
    return '';
  }

  if (normalizedHref.toLowerCase().startsWith(MAILTO_PREFIX)) {
    return 'mailto';
  }

  try {
    const parsedUrl = new URL(normalizedHref, window.location.href);
    return parsedUrl.hostname || '';
  } catch {
    return '';
  }
}

function getUiLabel(anchorElement, itemName) {
  const gaLabel = getAnchorDataValue(anchorElement, 'gaLabel');
  if (gaLabel) {
    return gaLabel;
  }

  const ariaLabel = normalizeString(anchorElement.getAttribute('aria-label'));
  if (ariaLabel) {
    return ariaLabel;
  }

  const titleLabel = normalizeString(anchorElement.getAttribute('title'));
  if (titleLabel) {
    return titleLabel;
  }

  if (itemName && itemName !== 'unknown') {
    return itemName;
  }

  return 'unknown';
}

function buildLinkTrackingPayload(anchorElement) {
  const rawHref = anchorElement.getAttribute('href') || '';
  const destinationUrl = sanitizeDestinationUrl(rawHref);
  const destinationHost = getDestinationHost(rawHref);
  const itemName = normalizeGaField(
    getAnchorDataValue(anchorElement, 'gaItem') ||
    normalizeString(anchorElement.textContent),
  );
  const section = normalizeGaField(getAnchorDataValue(anchorElement, 'gaSection'));
  const linkKind = normalizeGaField(
    getAnchorDataValue(anchorElement, 'gaKind') ||
    deriveLinkKind(rawHref, destinationHost, destinationUrl),
  );
  const uiLabel = normalizeGaField(getUiLabel(anchorElement, itemName));

  return {
    section,
    item_name: itemName,
    link_kind: linkKind,
    destination_url: destinationUrl || 'unknown',
    destination_host: destinationHost || 'unknown',
    is_internal_domain: isInternalDomain(destinationHost),
    ui_label: uiLabel,
  };
}

function onDocumentLinkClick(event) {
  if (!event || !event.target || !(event.target instanceof Element)) {
    return;
  }

  const anchorElement = event.target.closest('a[href]');
  if (!anchorElement) {
    return;
  }

  trackEvent('portfolio_link_click', buildLinkTrackingPayload(anchorElement));
}

function trackPageView() {
  trackEvent('page_view', {
    page_title: document.title || '',
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
  });
}

function dispatchRouteChange() {
  window.dispatchEvent(new Event('portfolio-route-change'));
}

function patchHistoryForRouteTracking() {
  const originalPushState = window.history.pushState;
  window.history.pushState = function patchedPushState(...args) {
    const result = originalPushState.apply(this, args);
    dispatchRouteChange();
    return result;
  };

  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function patchedReplaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    dispatchRouteChange();
    return result;
  };
}

function initializeDelegatedLinkTracking() {
  if (linkTrackingInitialized) {
    return;
  }

  document.addEventListener('click', onDocumentLinkClick, true);
  linkTrackingInitialized = true;
}

function initializePageViewTracking() {
  if (pageViewTrackingInitialized) {
    return;
  }

  patchHistoryForRouteTracking();
  window.addEventListener('popstate', trackPageView);
  window.addEventListener('hashchange', trackPageView);
  window.addEventListener('portfolio-route-change', trackPageView);
  pageViewTrackingInitialized = true;
}

export function initializeAnalyticsTracking() {
  initializeDelegatedLinkTracking();
  initializePageViewTracking();
}

export function trackEvent(name, params = {}) {
  const normalizedEventName = normalizeString(name);
  if (!normalizedEventName) {
    return;
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', normalizedEventName, params || {});
  }
}

export function sanitizeDestinationUrl(url) {
  const normalizedUrl = normalizeString(url);
  if (!normalizedUrl) {
    return '';
  }

  if (normalizedUrl.toLowerCase().startsWith(MAILTO_PREFIX)) {
    return normalizedUrl;
  }

  try {
    const parsedUrl = new URL(normalizedUrl, window.location.href);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    return '';
  }
}

export function isInternalDomain(host) {
  const normalizedHost = normalizeString(host).toLowerCase().split(':')[0].replace(/\.$/, '');
  if (!normalizedHost) {
    return false;
  }

  return normalizedHost === INTERNAL_DOMAIN_ROOT || normalizedHost.endsWith(`.${INTERNAL_DOMAIN_ROOT}`);
}

