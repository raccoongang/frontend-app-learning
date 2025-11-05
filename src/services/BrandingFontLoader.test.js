import BrandingFontLoader from './BrandingFontLoader';

describe('BrandingFontLoader', () => {
  beforeEach(() => {
    document.head.innerHTML = ''; // clean head before each test
  });

  test('should inject Google Fonts <link> tags when GOOGLE_FONTS is set', () => {
    const loader = new BrandingFontLoader({
      config: {
        GOOGLE_FONTS: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
      },
    });

    loader.loadScript();

    const links = document.querySelectorAll('link[data-font-loader="google-font"]');
    expect(links.length).toBe(3);
    expect(document.querySelector(`link[href="${loader.googleFontsUrl}"]`)).toBeTruthy();
  });

  test('should not inject Google Fonts if already present', () => {
    const link = document.createElement('link');
    link.setAttribute('data-font-loader', 'google-font');
    document.head.appendChild(link);

    const loader = new BrandingFontLoader({
      config: { GOOGLE_FONTS: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap' },
    });

    loader.loadScript();

    const links = document.querySelectorAll('link[data-font-loader="google-font"]');
    expect(links.length).toBe(1); // no duplicates
  });

  test('should inject <style> with @font-face rules when CUSTOM_FONTS is set', () => {
    const loader = new BrandingFontLoader({
      config: {
        CUSTOM_FONTS: [
          {
            font_family: 'CustomFont',
            font_file: 'https://example.com/font.woff2',
            font_weight: '400',
            font_style: 'normal',
          },
        ],
      },
    });

    loader.loadScript();

    const style = document.getElementById('custom-fonts-style');
    expect(style).toBeTruthy();
    expect(style.innerHTML).toContain('@font-face');
    expect(style.innerHTML).toContain("font-family: 'CustomFont'");
  });

  test('should not inject @font-face if CUSTOM_FONTS is empty', () => {
    const loader = new BrandingFontLoader({ config: { CUSTOM_FONTS: [] } });
    loader.loadScript();
    expect(document.getElementById('custom-fonts-style')).toBeNull();
  });

  test('should not inject duplicate @font-face style tag', () => {
    const style = document.createElement('style');
    style.id = 'custom-fonts-style';
    document.head.appendChild(style);

    const loader = new BrandingFontLoader({
      config: {
        CUSTOM_FONTS: [
          {
            font_family: 'TestFont',
            font_file: 'https://example.com/font.woff2',
            font_weight: '400',
            font_style: 'normal',
          },
        ],
      },
    });

    loader.loadScript();

    // should remain only one
    expect(document.querySelectorAll('#custom-fonts-style').length).toBe(1);
  });

  test('should work when both GOOGLE_FONTS and CUSTOM_FONTS are set', () => {
    const loader = new BrandingFontLoader({
      config: {
        GOOGLE_FONTS: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
        CUSTOM_FONTS: [
          {
            font_family: 'DualFont',
            font_file: 'https://example.com/dual.woff2',
            font_weight: '700',
            font_style: 'italic',
          },
        ],
      },
    });

    loader.loadScript();

    expect(document.querySelectorAll('link[data-font-loader="google-font"]').length).toBe(3);
    expect(document.getElementById('custom-fonts-style')).toBeTruthy();
  });
});
