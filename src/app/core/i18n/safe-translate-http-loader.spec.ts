import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SafeTranslateHttpLoader } from './safe-translate-http-loader';

describe('SafeTranslateHttpLoader', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns translations on success', (done) => {
    const loader = new SafeTranslateHttpLoader(http, 'prefix/', '.json');

    loader.getTranslation('en').subscribe((res) => {
      const result = res as Record<string, unknown>;
      expect(result).toEqual({ hello: 'hi' });
      done();
    });

    httpMock.expectOne('prefix/en.json').flush({ hello: 'hi' });
  });

  it('uses default prefix/suffix when not provided', (done) => {
    const loader = new SafeTranslateHttpLoader(http);

    loader.getTranslation('en').subscribe((res) => {
      const result = res as Record<string, unknown>;
      expect(result).toEqual({});
      done();
    });

    httpMock.expectOne('./assets/i18n/en.json').error(new ProgressEvent('error'));
  });

  it('falls back to empty object and warns on failures', (done) => {
    const loader = new SafeTranslateHttpLoader(http, 'prefix/', '.json');
    const warnSpy = spyOn(console, 'warn');

    loader.getTranslation('es').subscribe((res) => {
      const result = res as Record<string, unknown>;
      expect(result).toEqual({});
      expect(warnSpy).toHaveBeenCalled();
      done();
    });

    httpMock.expectOne('prefix/es.json').error(new ProgressEvent('error'), {
      status: 404,
      statusText: 'Not Found',
    });
  });
});
