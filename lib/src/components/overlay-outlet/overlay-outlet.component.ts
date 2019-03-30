
import { Component, OnInit, TemplateRef, Type, ViewEncapsulation } from '@angular/core';

import { OverlayItem } from '../../services/overlay-item.class';

export type OverlayContent = TemplateRef<any> | Type<any> | string;

@Component({
    selector: 'overlay-outlet',
    templateUrl: './overlay-outlet.component.html',
    styleUrls: ['./overlay-outlet.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class OverlayOutletComponent implements OnInit {
    public method: 'template' | 'component' | 'text';
    public content: OverlayContent;
    public context;

    constructor(private overlay: OverlayItem) { }

    public ngOnInit() {
        this.setMethod();
    }

    public setMethod() {
        this.method = 'component';
        this.content = this.overlay.content;

        if (typeof this.content === 'string') {
            this.method = 'text';
        } else if (this.content instanceof TemplateRef) {
            this.method = 'template';
            this.context = {
                event: this.overlay.post.bind(this.overlay),
                close: this.overlay.close.bind(this.overlay)
            };
        }
    }
}
