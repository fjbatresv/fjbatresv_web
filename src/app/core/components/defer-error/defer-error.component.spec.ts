import { DeferErrorComponent } from './defer-error.component';

describe('DeferErrorComponent', () => {
  let timerSpy: jasmine.Spy;

  beforeEach(() => {
    sessionStorage.clear();
    timerSpy = spyOn(globalThis, 'setTimeout').and.stub();
  });

  afterEach(() => {
    sessionStorage.clear();
    delete (globalThis as typeof globalThis & { __deferReloaded?: boolean }).__deferReloaded;
  });

  it('reports and reloads once for a section', () => {
    const component = new DeferErrorComponent();
    component.section = 'projects';
    component.ngOnInit();

    expect(sessionStorage.getItem('defer-reload:projects')).toBe('1');
    expect(timerSpy).toHaveBeenCalledWith(jasmine.any(Function), 50);
  });

  it('does not reload repeatedly after a prior attempt', () => {
    sessionStorage.setItem('defer-reload:unknown', '1');
    new DeferErrorComponent().ngOnInit();
    expect(timerSpy).not.toHaveBeenCalled();
  });

  it('uses the in-memory guard when session storage throws', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('blocked');
    new DeferErrorComponent().ngOnInit();
    expect(
      (globalThis as typeof globalThis & { __deferReloaded?: boolean }).__deferReloaded
    ).toBeTrue();
    expect(timerSpy).toHaveBeenCalledWith(jasmine.any(Function), 50);
  });
});
