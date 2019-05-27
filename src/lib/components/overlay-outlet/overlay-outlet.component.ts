
import { Component, OnInit, TemplateRef, Type, ViewEncapsulation } from '@angular/core';

import { OverlayItem } from '../../services/overlay-item.class';
import { IPoint, OverlayContent } from '../../services/overlay.interfaces';

@Component({
    selector: 'overlay-outlet',
    templateUrl: './overlay-outlet.component.html',
    styleUrls: ['./overlay-outlet.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class OverlayOutletComponent implements OnInit {
    /** CSS class to add to the root element of the component */
    public klass = 'default';
    /** Method with which to inject content in to the component */
    public method: 'template' | 'component' | 'text';
    /** Content to inject into the component */
    public content: OverlayContent;
    /** Context data to pass to the template/component injected into the component */
    public context;
    /** Offset position for the overlay */
    public offset: IPoint;

    constructor(private overlay: OverlayItem) {
    }

    public ngOnInit() {
        setTimeout(() => {
            this.offset = this.overlay.details.offset;
            this.setMethod();
        }, 1);
    }

    /** Set injection method based of the content passed */
    public setMethod() {
        this.method = 'component';
        this.content = this.overlay.content;
        this.klass = this.overlay.details.klass || 'default';

        if (typeof this.content === 'string') {
            this.method = 'text';
        } else if (this.content instanceof TemplateRef) {
            this.method = 'template';
            this.context = {
                ...(this.overlay.details.data || {}),
                event: this.overlay.post.bind(this.overlay),
                close: this.overlay.close.bind(this.overlay)
            };
            Object.defineProperty(this.context, 'position', {
                get: () => this.overlay.position
            });
        }
    }
}
