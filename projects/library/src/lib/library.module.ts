import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { version } from './settings';

import * as dayjs_api from 'dayjs';
const dayjs = dayjs_api;

import { AOverlayService } from './services/overlay.service';
import { OverlayContentComponent } from './components/overlay-content/overlay-content.component';
import { OverlayOutletComponent } from './components/overlay-outlet/overlay-outlet.component';
import { TooltipDirective } from './directives/tooltip.directive';
import { TooltipWrapperComponent } from './components/tooltip-wrapper/tooltip-wrapper.component';
import { ModalDirective } from './directives/model.directive';
import { NotificationOutletComponent } from './components/notification-outlet/notification-outlet.component';
import { FloatingTextComponent } from './components/floating-text/floating-text.component';
import { FloatingTextDirective } from './directives/floating-text.directive';
import { ContextItemDirective } from './directives/context-item.directive';

@NgModule({
    declarations: [
        OverlayContentComponent,
        OverlayOutletComponent,
        FloatingTextComponent,
        FloatingTextDirective,
        ModalDirective,
        NotificationOutletComponent,
        TooltipDirective,
        TooltipWrapperComponent,
        ContextItemDirective
    ],
    imports: [CommonModule, OverlayModule],
    exports: [
        OverlayContentComponent,
        OverlayOutletComponent,
        FloatingTextComponent,
        FloatingTextDirective,
        ModalDirective,
        NotificationOutletComponent,
        TooltipDirective,
        TooltipWrapperComponent,
        ContextItemDirective
    ],
    entryComponents: [OverlayOutletComponent, FloatingTextComponent, NotificationOutletComponent]
})
export class LibraryModule {
    public static version = 'local-dev';
    private static init = false;
    readonly build = dayjs();

    constructor() {
        if (!LibraryModule.init) {
            const now = dayjs();
            LibraryModule.init = true;
            const build = now.isSame(this.build, 'd') ? `Today at ${this.build.format('h:mmA')}` : this.build.format('D MMM YYYY, h:mmA');
            version(LibraryModule.version, build);
        }
    }
}

export { LibraryModule as ACA_OVERLAYS_MODULE };
export { LibraryModule as AOverlayModule };
