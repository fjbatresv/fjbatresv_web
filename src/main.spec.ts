import { ApplicationRef } from '@angular/core';
import * as platformBrowser from '@angular/platform-browser';
import { bootstrapAdapter, bootstrapApp } from './main';

describe('bootstrapApp', () => {
  it('logs and resolves when bootstrap fails', async () => {
    const error = new Error('boom');
    const consoleSpy = spyOn(console, 'error');
    const failingBootstrap = jasmine
      .createSpy('bootstrapFn')
      .and.returnValue(Promise.reject(error));

    await bootstrapApp(failingBootstrap as any);

    expect(failingBootstrap).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(error);
  });

  it('defaults to bootstrapApplication when not provided', async () => {
    const bootstrapSpy = spyOn(bootstrapAdapter, 'bootstrap').and.returnValue(
      Promise.resolve({} as ApplicationRef)
    );

    await bootstrapApp();

    expect(bootstrapSpy).toHaveBeenCalled();
  });
});
