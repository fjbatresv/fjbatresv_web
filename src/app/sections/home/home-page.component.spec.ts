import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let events$: Subject<NavigationEnd>;
  const routeStub = { snapshot: { data: { section: 'about' } } } as unknown as ActivatedRoute;
  let routerStub: Pick<Router, 'events' | 'createUrlTree' | 'serializeUrl'>;
  let platformId: 'browser' | 'server' = 'browser';

  beforeEach(async () => {
    events$ = new Subject<NavigationEnd>();
    routerStub = {
      events: events$.asObservable(),
      createUrlTree: () => ({}) as any,
      serializeUrl: () => '/',
    };
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideTranslateService(),
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    routeStub.snapshot.data = { section: 'about' };
    platformId = 'browser';
  });

  it('scrolls to the section defined in route data on init', () => {
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    spyOn(document, 'getElementById').and.returnValue({ scrollIntoView } as any);

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.componentInstance.ngAfterViewInit();

    expect(document.getElementById).toHaveBeenCalledWith('about');
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('scrolls again when navigation events occur', () => {
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    const getElementSpy = spyOn(document, 'getElementById').and.returnValue({
      scrollIntoView,
    } as any);

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.componentInstance.ngAfterViewInit();

    events$.next(new NavigationEnd(1, '/skills', '/skills'));

    expect(getElementSpy).toHaveBeenCalledTimes(2);
  });

  it('does nothing when section element is missing', () => {
    spyOn(document, 'getElementById').and.returnValue(null);
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.componentInstance.ngAfterViewInit();
    expect(document.getElementById).toHaveBeenCalled();
  });

  it('falls back to home section when route data is missing', () => {
    routeStub.snapshot.data = {};
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    spyOn(document, 'getElementById').and.returnValue({ scrollIntoView } as any);

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.componentInstance.ngAfterViewInit();

    expect(document.getElementById).toHaveBeenCalledWith('home');
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('does not access the document while rendering on the server', () => {
    platformId = 'server';
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideTranslateService(),
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    });
    const documentSpy = spyOn(document, 'getElementById');
    TestBed.createComponent(HomePageComponent).componentInstance.ngAfterViewInit();
    expect(documentSpy).not.toHaveBeenCalled();
  });
});
