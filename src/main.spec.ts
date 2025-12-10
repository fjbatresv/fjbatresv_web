import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapApp } from './main';

describe('main bootstrap', () => {
  it('bootstraps AppComponent with appConfig', async () => {
    const bootstrapFn = jasmine.createSpy('bootstrapFn').and.returnValue(Promise.resolve({}));

    await bootstrapApp(bootstrapFn as any);

    expect(bootstrapFn).toHaveBeenCalledWith(AppComponent, appConfig);
  });
});
