import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import { AppService } from './services/app.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

    public model: { [name: string]: any } = {};

    constructor(private service: AppService) { }

    public ngOnInit(): void {
    }

    public notify() {
        Array(3).fill(0).forEach((n, i) => {
            setTimeout(() => {
                this.service.Overlay.notify(
                    `Test ${Math.floor(Math.random() * 999999)}`,
                    'Test',
                    _ => console.log('Test'),
                    null,
                    Math.floor(Math.random() * 10) * 3000);
            }, 300 * i);
        });
    }
}
