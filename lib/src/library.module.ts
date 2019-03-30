/**
 * @Author: Alex Sorafumo
 * @Date:   09/12/2016 9:39 AM
 * @Email:  alex@yuion.net
 * @Filename: index.ts
 * @Last modified by:   Alex Sorafumo
 * @Last modified time: 06/02/2017 11:28 AM
 */

import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { OverlayOutletComponent } from './components/overlay-outlet/overlay-outlet.component';

import { LIBRARY_SETTINGS } from './settings';

import * as day_api from 'dayjs';
const dayjs = day_api;

const COMPONENTS: Type<any>[] = [
];

const DIRECTIVES: Type<any>[] = [
];

const ENTRY_COMPONENTS: Type<any>[] = [
    OverlayOutletComponent
];

@NgModule({
    declarations: [
        // Declare Directive
        // ...COMPONENTS
        ...ENTRY_COMPONENTS,
        // ...DIRECTIVES
    ],
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule
    ],
    entryComponents: [
        ...ENTRY_COMPONENTS
    ],
    exports: [
        // Export Directives,
        // ...DIRECTIVES
    ]
})
class LibraryModule {
    public static version = '0.1.0';
    private static init = false;
    private build = dayjs(1552621020000);

    constructor() {
        if (!LibraryModule.init) {
            const now = dayjs();
            LibraryModule.init = true;
            const build = now.isSame(this.build, 'd') ? `Today at ${this.build.format('h:mmA')}` : this.build.format('D MMM YYYY, h:mmA');
            LIBRARY_SETTINGS.version(LibraryModule.version, build);
        }
    }
}

export const ACA_OVERLAY_BASE_MODULE = LibraryModule;
export const OverlayBaseModule = LibraryModule;
