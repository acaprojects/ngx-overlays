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
        this.service.Overlay.notify(
            `Test ${Math.floor(Math.random() * 999999)}`,
            'Test',
            (i) => console.log('Test'),
            null,
            Math.floor(Math.random() * 10) * 3000);
    }
}
