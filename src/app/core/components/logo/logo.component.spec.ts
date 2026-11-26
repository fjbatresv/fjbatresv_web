import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  let fixture: ComponentFixture<LogoComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LogoComponent] }).compileComponents();
    fixture = TestBed.createComponent(LogoComponent);
  });

  it('renders the isotipo at 96px with the accessible name', () => {
    fixture.componentInstance.size = 'lg';
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.width).toBe(96);
    expect(image.height).toBe(96);
    expect(image.alt).toBe('Javier Batres');
  });
});
