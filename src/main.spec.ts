import * as platformBrowser from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapApp } from './main';

describe('main bootstrap', () => {
  it('bootstraps AppComponent with appConfig', async () => {
    const bootstrapFn = jasmine.createSpy('bootstrapFn').and.returnValue(Promise.resolve({}));

    await bootstrapApp(bootstrapFn as any);

    expect(bootstrapFn).toHaveBeenCalledWith(AppComponent, appConfig);
  });

  it('logs when bootstrap rejects', async () => {
    const error = new Error('boom');
    const consoleSpy = spyOn(console, 'error');
    const rejectingFn = jasmine.createSpy('rejectingFn').and.returnValue(Promise.reject(error));

    await bootstrapApp(rejectingFn as any);

    expect(consoleSpy).toHaveBeenCalledWith(error);
  });
});
