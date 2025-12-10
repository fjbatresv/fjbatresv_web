import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let events$: Subject<NavigationEnd>;
  const routeStub = { snapshot: { data: { section: 'about' } } } as unknown as ActivatedRoute;

  beforeEach(async () => {
    events$ = new Subject<NavigationEnd>();
    await TestBed.configureTestingModule({
      imports: [HomePageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: { events: events$.asObservable() } },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    routeStub.snapshot.data = { section: 'about' };
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
});
