
import { Component, OnInit, TemplateRef, Type, ViewEncapsulation, Inject, forwardRef, Injector } from '@angular/core';

import { OverlayItem } from '../../classes/overlay-item.class';
import { IPoint, OverlayContent } from '../../interfaces/overlay.interfaces';

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
    /** Overlay item associated with the outlet component */
    private _overlay: OverlayItem;

    constructor(private injector: Injector) {
        this._overlay = injector.get(OverlayItem);
    }

    public ngOnInit() {
        setTimeout(() => {
            this.offset = this._overlay.details.offset;
            this.setMethod();
        }, 1);
    }

    /** Set injection method based of the content passed */
    public setMethod() {
        this.method = 'component';
        this.content = this._overlay.content;
        this.klass = this._overlay.details.klass || 'default';

        if (typeof this.content === 'string') {
            this.method = 'text';
        } else if (this.content instanceof TemplateRef) {
            this.method = 'template';
            this.context = {
                ...(this._overlay.details.data || {}),
                event: this._overlay.post.bind(this._overlay),
                close: this._overlay.close.bind(this._overlay)
            };
            Object.defineProperty(this.context, 'position', {
                get: () => this._overlay.position
            });
        }
    }
}
