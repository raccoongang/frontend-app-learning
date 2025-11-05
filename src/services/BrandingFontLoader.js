/**
 * @implements {BrandingFontLoader}
 * @memberof module:FontLoaderScript
 */
class BrandingFontLoader {
  constructor({ config }) {
    this.googleFontsUrl = config.GOOGLE_FONTS;
    this.customFonts = config.CUSTOM_FONTS;
  }

  loadGoogleFonts() {
    if (!this.googleFontsUrl) {
      return;
    }

    // Avoid inserting duplicates
    if (document.querySelector('link[data-font-loader="google-font"]')) {
      return;
    }

    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    preconnect1.setAttribute('data-font-loader', 'google-font');

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    preconnect2.setAttribute('data-font-loader', 'google-font');

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = this.googleFontsUrl;
    stylesheet.setAttribute('data-font-loader', 'google-font');

    document.head.append(preconnect1, preconnect2, stylesheet);
  }

  loadCustomFonts() {
    if (!Array.isArray(this.customFonts) || this.customFonts.length === 0) {
      return;
    }

    // Avoid duplicate injection
    if (document.getElementById('custom-fonts-style')) {
      return;
    }

    const style = document.createElement('style');
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
    document.head.appendChild(style);
  }

  loadScript() {
    this.loadGoogleFonts();
    this.loadCustomFonts();
  }
}

export default BrandingFontLoader;
