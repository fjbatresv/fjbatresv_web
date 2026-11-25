import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DeferErrorComponent } from './defer-error.component';

describe('DeferErrorComponent', () => {
  function create(platformId: 'browser' | 'server' = 'browser'): DeferErrorComponent {
    TestBed.configureTestingModule({
      imports: [DeferErrorComponent],
      providers: [{ provide: PLATFORM_ID, useValue: platformId }],
    });
    return TestBed.createComponent(DeferErrorComponent).componentInstance;
  }

  beforeEach(() => {
    sessionStorage.clear();
    jasmine.clock().install();
  });

  afterEach(() => {
    sessionStorage.clear();
    jasmine.clock().uninstall();
    TestBed.resetTestingModule();
    delete (globalThis as typeof globalThis & { __deferReloaded?: boolean }).__deferReloaded;
  });

  it('reports and reloads once for a section', () => {
    const component = create();
    component.section = 'projects';
    const reload = spyOn(component as unknown as { reload: () => void }, 'reload');
    component.ngOnInit();

    expect(sessionStorage.getItem('defer-reload:projects')).toBe('1');
    jasmine.clock().tick(50);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload repeatedly after a prior attempt', () => {
    sessionStorage.setItem('defer-reload:unknown', '1');
    const component = create();
    const reload = spyOn(component as unknown as { reload: () => void }, 'reload');
    component.ngOnInit();
    jasmine.clock().tick(50);
    expect(reload).not.toHaveBeenCalled();
  });

  it('uses the in-memory guard when session storage throws', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('blocked');
    const component = create();
    const reload = spyOn(component as unknown as { reload: () => void }, 'reload');
    component.ngOnInit();
    expect(
      (globalThis as typeof globalThis & { __deferReloaded?: boolean }).__deferReloaded
    ).toBeTrue();
    jasmine.clock().tick(50);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not access browser APIs while rendering on the server', () => {
    const storage = spyOn(Storage.prototype, 'getItem');
    const component = create('server');
    const reload = spyOn(component as unknown as { reload: () => void }, 'reload');
    component.ngOnInit();
    expect(storage).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads the browser window through its document', () => {
    const reload = jasmine.createSpy('reload');
    const testDocument = {
      defaultView: { location: { reload } },
    } as unknown as Document;
    const component = Object.create(DeferErrorComponent.prototype) as DeferErrorComponent;
    (component as unknown as { document: Document }).document = testDocument;
    (component as unknown as { reload: () => void }).reload();
    expect(reload).toHaveBeenCalled();
  });
});
