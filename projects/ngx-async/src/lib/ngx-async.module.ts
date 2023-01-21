import { NgModule } from '@angular/core';
import { NgxAsyncDirective } from './ngx-async.directive';

@NgModule({
    declarations: [
        NgxAsyncDirective
    ],
    exports: [
        NgxAsyncDirective
    ]
})
export class NgxAsyncModule {}
