import { TestBed, async } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { OverlayModule } from '../lib/public_api';

describe('AppComponent', () => {
    let originalTimeout: number;

    beforeEach(async(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [OverlayModule]
        }).compileComponents();
    }));

    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    it('should contain a button', async((d) => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('button')).toBeTruthy();
    }));
});
