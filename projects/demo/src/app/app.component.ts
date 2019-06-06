import { Component, ViewEncapsulation } from '@angular/core';

import { AOverlayService } from 'projects/library/src/lib/services/overlay.service';

@Component({
    selector: 'app-root',
    templateUrl: `./app.component.html`,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    public model: { [name: string]: any } = {};

    constructor(private overlay: AOverlayService) { }

    public notify() {
        Array(3).fill(0).forEach((n, i) => {
            setTimeout(() => {
                this.overlay.notify(
                    `Test ${Math.floor(Math.random() * 999999)}`,
                    'Test',
                    _ => console.log('Test'),
                    null,
                    Math.floor(Math.random() * 10) * 3000);
            }, 300 * i);
        });
    }
}
