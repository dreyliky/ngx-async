import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { map, timer } from 'rxjs';
import { NgxAsyncDirective } from '../ngx-async.directive';

const items = [
    'Apple',
    'Banana',
    'Orange',
    'Pineapple'
];

@Component({
    template: `
        <ng-template
            [ngxAsync]="data$"
            [ngxAsyncLoading]="loading"
            let-items>
            <ul class="items">
                <li *ngFor="let item of items">
                    {{ item }}
                </li>
            </ul>
        </ng-template>

        <ng-template #loading>
            <div class="loading">Loading...</div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ExampleComponent {
    public readonly data$ = timer(1000)
        .pipe(
            map(() => items)
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

    it('should work with ng-template', fakeAsync(() => {
        fixture.detectChanges();
        let liElements = fixture.debugElement.queryAll(By.css('.items li'));
        expect(liElements.length).toBe(0);

        const loadingElement = fixture.debugElement.query(By.css('.loading'));
        expect(loadingElement).toBeTruthy();

        tick(1000);
        fixture.detectChanges();

        liElements = fixture.debugElement.queryAll(By.css('.items li'));

        liElements.forEach((liElement, index) => {
            expect(liElement.nativeElement.textContent).toContain(items[index]);
        });
        
        expect(liElements.length).toBe(items.length);
    }));
});
