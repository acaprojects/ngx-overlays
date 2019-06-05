import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <div class="app">
            <div class="test">
                <button feedback (tapped)="toggle()">Test {{ model.test }}</button>

                <div class="square" style="overflow: visible" feedback [center]="true"></div>
            </div>
        </div>
    `,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    public model: { [name: string]: any } = {};

    public toggle() {
        console.warn('Toggle');
        this.model.test = !this.model.test;
    }
}
