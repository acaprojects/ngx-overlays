import { Component, ViewContainerRef, ViewEncapsulation, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { AppService } from './services/app.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

    public model: { [name: string]: any } = {};

    constructor(private view: ViewContainerRef, private service: AppService) {
        this.service.Overlay.view = view;
    }

    public ngOnInit(): void {

    }
}
