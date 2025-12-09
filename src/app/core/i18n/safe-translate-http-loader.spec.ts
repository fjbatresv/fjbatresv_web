import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SafeTranslateHttpLoader } from './safe-translate-http-loader';

describe('SafeTranslateHttpLoader', () => {
  let httpMock: HttpTestingController;
  let loader: SafeTranslateHttpLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    httpMock = TestBed.inject(HttpTestingController);
    loader = new SafeTranslateHttpLoader(TestBed.inject(HttpClient));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns translations when the request succeeds', () => {
    const expected = { greeting: 'Hi' };
    let result: Record<string, unknown> | undefined;

    loader.getTranslation('en').subscribe((translations) => {
      result = translations;
    });

    const request = httpMock.expectOne('./assets/i18n/en.json');
    request.flush(expected);

    expect(result).toEqual(expected);
  });

  it('returns an empty object and logs when the request fails', () => {
    const warnSpy = spyOn(console, 'warn');
    let result: Record<string, unknown> | undefined;

    loader.getTranslation('es').subscribe((translations) => {
      result = translations;
    });

    const request = httpMock.expectOne('./assets/i18n/es.json');
    request.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

    expect(result).toEqual({});
    expect(warnSpy).toHaveBeenCalled();
  });
});
