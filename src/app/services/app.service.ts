import { Injectable } from '@angular/core';
import { OverlayService } from '../../lib/public_api';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    constructor(private overlay: OverlayService) {

    }

    public get Overlay() { return this.overlay; }
}
