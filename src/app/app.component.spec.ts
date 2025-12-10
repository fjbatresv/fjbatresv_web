import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { TranslationService } from './core/services/translation.service';

describe('AppComponent', () => {
  const translationServiceMock = {
    init: jasmine.createSpy('init'),
  };
  const titleMock = {
    setTitle: jasmine.createSpy('setTitle'),
  };
  const metaMock = {
    addTags: jasmine.createSpy('addTags'),
  };

  beforeEach(async () => {
    translationServiceMock.init.calls.reset();
    titleMock.setTitle.calls.reset();
    metaMock.addTags.calls.reset();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot(), AppComponent],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: Title, useValue: titleMock },
        { provide: Meta, useValue: metaMock },
      ],
    }).compileComponents();
  });

  it('should expose the current year', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('initializes translations and metadata on init', () => {
    TestBed.createComponent(AppComponent).componentInstance.ngOnInit();
    expect(translationServiceMock.init).toHaveBeenCalled();
    expect(titleMock.setTitle).toHaveBeenCalledWith('Javier Batres');
    expect(metaMock.addTags).toHaveBeenCalled();
  });
});
