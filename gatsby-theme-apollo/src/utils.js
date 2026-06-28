function getVersionBasePath(version) {
  return `/v${version.replace(/\s+/g, '-')}`;
}

function trackCustomEvent({category, action, label, value}) {
  if (window.gtag) {
    window.gtag('event', action, {
      category,
      label,
      value
    });
  }
}

exports.getVersionBasePath = getVersionBasePath;
exports.HEADER_HEIGHT = 0; // 72;
exports.trackCustomEvent = trackCustomEvent;
