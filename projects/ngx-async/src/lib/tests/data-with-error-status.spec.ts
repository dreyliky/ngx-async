import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { switchMap, throwError, timer } from 'rxjs';
import { NgxAsyncDirective } from '../ngx-async.directive';

@Component({
    template: `
        <div
            *ngxAsync="data$; loading: loading; error: error;"
            class="content">
            Never shown
        </div>

        <ng-template #loading>
            <div class="loading">Loading...</div>
        </ng-template>

        <ng-template #error>
            <div class="error">Error!</div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ExampleComponent {
    public readonly data$ = timer(1000)
        .pipe(
            switchMap(() => throwError(() => new Error('Error')))
        );
}

describe('NgxAsyncDirective', () => {
    let module: TestBed;
    let fixture: ComponentFixture<ExampleComponent>;

    beforeEach(waitForAsync(() => {
        module = TestBed.configureTestingModule({
            declarations: [
                NgxAsyncDirective,
                ExampleComponent
            ]
        });
        module.compileComponents();

        fixture = module.createComponent(ExampleComponent);
    }));

    it('should process data$ with loading and error statuses', fakeAsync(() => {
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.content'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeTruthy();
        tick(1000);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.error'))).toBeTruthy();
    }));
});
