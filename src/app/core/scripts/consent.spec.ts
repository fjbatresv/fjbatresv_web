async function runConsentScript(): Promise<void> {
  const response = await fetch('/public/consent.js');
  new Function(await response.text())();
}

function makeConsentBanner(): void {
  const banner = document.createElement('div');
  banner.id = 'cookie-consent';
  banner.className = 'cookie-consent cookie-consent-hidden';
  const message = document.createElement('span');
  message.dataset['cookieMessage'] = '';
  const accept = document.createElement('button');
  accept.id = 'cookie-consent-accept';
  accept.dataset['cookieAccept'] = '';
  const reject = document.createElement('button');
  reject.id = 'cookie-consent-reject';
  reject.dataset['cookieReject'] = '';
  banner.append(message, accept, reject);
  document.body.prepend(banner);
}

describe('analytics consent script', () => {
  beforeEach(() => {
    document.cookie = 'analytics_consent=; Max-Age=0; path=/';
    document.cookie = '_ga=; Max-Age=0; path=/';
    document.documentElement.lang = 'en';
    makeConsentBanner();
  });

  afterEach(() => {
    document.getElementById('cookie-consent')?.remove();
    document
      .querySelectorAll('script[src*="googletagmanager.com"]')
      .forEach((script) => script.remove());
    document.cookie = 'analytics_consent=; Max-Age=0; path=/';
    document.cookie = '_ga=; Max-Age=0; path=/';
  });

  it('shows the banner when consent is missing', async () => {
    await runConsentScript();
    expect(document.getElementById('cookie-consent')?.style.display).toBe('flex');
  });

  it('stores acceptance and loads Google Analytics', async () => {
    await runConsentScript();
    document.getElementById('cookie-consent-accept')?.click();
    expect(document.cookie).toContain('analytics_consent=accepted');
    expect(
      document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-MSCC45EHNV"]')
    ).toBeTruthy();
  });

  it('clears analytics cookies and the script on rejection', async () => {
    document.cookie = '_ga=test; path=/';
    await runConsentScript();
    document.getElementById('cookie-consent-accept')?.click();
    document.getElementById('cookie-consent-reject')?.click();
    expect(document.cookie).toContain('analytics_consent=rejected');
    expect(document.cookie).not.toContain('_ga=test');
    expect(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')).toBeNull();
  });

  it('renders Spanish text and a policy anchor without innerHTML', async () => {
    document.documentElement.lang = 'es';
    const innerHtmlSetter = spyOnProperty(Element.prototype, 'innerHTML', 'set');
    await runConsentScript();
    expect(document.getElementById('cookie-consent-accept')?.textContent).toBe('Aceptar');
    expect(document.querySelector('[data-cookie-message] a')?.getAttribute('href')).toBe(
      '/privacy-policy.pdf'
    );
    expect(innerHtmlSetter).not.toHaveBeenCalled();
  });
});
