import { AOverlayService } from "./overlay.service";
import { TestBed } from '@angular/core/testing';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { OverlayItem } from '../classes/overlay-item.class';

describe('AOverlayService', () => {
    let service: AOverlayService
    let overlay: any;
    let clock: jasmine.Clock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [

            ],
            providers: [
                AOverlayService
            ],
            imports: [CommonModule, OverlayModule]
        }).compileComponents();
        service = TestBed.get(AOverlayService);
        overlay = TestBed.get(Overlay);
        clock = jasmine.clock();
        clock.uninstall();
        clock.install();
    });

    afterEach(() => {
        clock.uninstall();
    });

    it('should create an instance', () => {
        expect(service).toBeTruthy();
    });
});
