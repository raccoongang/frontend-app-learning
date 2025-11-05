/**
 * @implements {BrandingFontLoader}
 * @memberof module:FontLoaderScript
 */
class BrandingFontLoader {
  constructor({ config, targetDocument } = {}) {
    this.googleFontsUrl = config.GOOGLE_FONTS;
    this.customFonts = config.CUSTOM_FONTS;
    this.iframeDocument = targetDocument || (typeof document !== 'undefined' ? document : null);
  }

  loadGoogleFonts() {
    if (!this.googleFontsUrl || !this.iframeDocument) {
      return;
    }

    // Avoid inserting duplicates
    if (this.iframeDocument.querySelector('link[data-font-loader="google-font"]')) {
      return;
    }

    const preconnect1 = this.iframeDocument.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    preconnect1.setAttribute('data-font-loader', 'google-font');

    const preconnect2 = this.iframeDocument.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    preconnect2.setAttribute('data-font-loader', 'google-font');

    const stylesheet = this.iframeDocument.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = this.googleFontsUrl;
    stylesheet.setAttribute('data-font-loader', 'google-font');

    this.iframeDocument.head.append(preconnect1, preconnect2, stylesheet);
  }

  loadCustomFonts() {
    if (!Array.isArray(this.customFonts) || this.customFonts.length === 0 || !this.iframeDocument) {
      return;
    }

    // Avoid duplicate injection
    if (this.iframeDocument.getElementById('custom-fonts-style')) {
      return;
    }

    const style = this.iframeDocument.createElement('style');
    style.id = 'custom-fonts-style';

    style.innerHTML = this.customFonts.map(font => `
      @font-face {
        font-family: '${font.font_family}';
        src: url('${font.font_file}') format('woff2');
        font-weight: ${font.font_weight};
        font-style: ${font.font_style};
        font-display: swap;
      }
    `).join('\n');
    this.iframeDocument.head.appendChild(style);
  }

  loadScript() {
    this.loadGoogleFonts();
    this.loadCustomFonts();
  }
}

export default BrandingFontLoader;
