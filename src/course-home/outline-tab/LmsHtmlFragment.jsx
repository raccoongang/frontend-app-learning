import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import * as footerExports from '@edx/frontend-component-footer';

const LmsHtmlFragment = ({
  className,
  html,
  title,
  ...rest
}) => {
  const direction = document.documentElement?.getAttribute('dir') || 'ltr';
  // Mirror the active dark theme inside the fragment iframe. The iframe loads the
  // legacy LMS CSS (lms-main.css), which already contains the compiled
  // `html[data-theme="dark"]` rules, but the iframe's <html> never gets the
  // attribute — so authored welcome/handouts text keeps its light-theme color
  // (#313131) and is invisible on the dark page. Read the shared `theme-variant`
  // cookie (canonical signal, set on the parent domain by the header toggle) and
  // stamp data-theme + load the matching brand variables, exactly as the legacy
  // head-extra.html does for server-rendered pages.
  const themeVariant = (document.cookie.match(/(?:^|;\s*)theme-variant=(dark|light)\b/) || [])[1] || '';
  const isDark = themeVariant === 'dark';
  const brandOverride = getConfig().PARAGON_THEME_URLS?.variants?.[isDark ? 'dark' : 'light']?.urls?.brandOverride;
  const BrandingFontLoader = footerExports?.services?.BrandingFontLoader;
  const brandLinkTag = brandOverride
    ? `<link rel="stylesheet" href="${brandOverride}">`
    : '';
  const wholePage = `
    <html dir="${direction}"${isDark ? ' data-theme="dark"' : ''}>
      <head>
        <base href="${getConfig().LMS_BASE_URL}" target="_parent">
        <link rel="stylesheet" href="/static/${getConfig().LEGACY_THEME_NAME ? `${getConfig().LEGACY_THEME_NAME}/` : ''}css/bootstrap/lms-main.css">
        <link rel="stylesheet" type="text/css" href="${getConfig().BASE_URL}/static/LmsHtmlFragment.css">
        ${brandLinkTag}
      </head>
      <body class="${className}">${html}</body>
      <script>
        const resizer = new ResizeObserver(() => {
          window.parent.postMessage({type: 'lmshtmlfragment.resize'}, '*');
        });
        resizer.observe(document.body);
      </script>
    </html>
  `;

  const iframe = useRef(null);
  function resetIframeHeight() {
    if (iframe?.current?.contentWindow?.document?.body) {
      iframe.current.height = iframe.current.contentWindow.document.body.parentNode.scrollHeight;
    }
  }

  useEffect(() => {
    function receiveMessage(event) {
      const { type } = event.data;
      if (type === 'lmshtmlfragment.resize') {
        resetIframeHeight();
      }
    }
    global.addEventListener('message', receiveMessage);
  }, []);

  return (
    <iframe
      className="w-100 border-0"
      onLoad={(event) => {
        resetIframeHeight();
        const iframeDocument = event.currentTarget?.contentDocument;
        if (iframeDocument && BrandingFontLoader) {
          new BrandingFontLoader({ config: getConfig(), target: iframeDocument }).loadScript();
        }
      }}
      ref={iframe}
      referrerPolicy="origin"
      scrolling="no"
      srcDoc={wholePage}
      title={title}
      {...rest}
    />
  );
};

LmsHtmlFragment.defaultProps = {
  className: '',
};

LmsHtmlFragment.propTypes = {
  className: PropTypes.string,
  html: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default LmsHtmlFragment;
