import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreProvidersComponent } from './explore-providers.component';

describe('ExploreProvidersComponent', () => {
  let component: ExploreProvidersComponent;
  let fixture: ComponentFixture<ExploreProvidersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreProvidersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExploreProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
