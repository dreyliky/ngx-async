import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { interval, map, of, switchMap, throwError } from 'rxjs';
import { NgxAsyncDirective } from '../ngx-async.directive';

@Component({
    template: `
        <div
            *ngxAsync="data$ as data; loading: loading; error: error;"
            class="content">
            {{ data }}
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
    public readonly data$ = interval(1000)
        .pipe(
            map((value) => {
                if (!value) {
                    return 1;
                }

                return (value + 1);
            }),
            switchMap((value) => {
                if (value === 2) {
                    return throwError(() => new Error('Error'));
                }

                return of(value);
            })
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

    it('should process long term data with error status', fakeAsync(() => {
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.content'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.error'))).toBeFalsy();
        tick(1000);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.content'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.error'))).toBeFalsy();
        tick(1000)
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.content'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.error'))).toBeTruthy();
    }));
});
