import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, timer } from 'rxjs';
import { NgxAsyncDirective } from '../ngx-async.directive';

@Component({
    template: `
        <button
            *ngxAsync="deleteProcessing$; loading: loading; error: error; success: success;"
            class="delete-button"
            (click)="onDeleteButtonClick()">
            Delete
        </button>

        <ng-template #loading>
            <div class="loading">Loading...</div>
        </ng-template>

        <ng-template #error>
            <div class="error">Error!</div>
        </ng-template>

        <ng-template #success>
            <div class="success">Success!</div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ExampleComponent {
    public deleteProcessing$: Observable<unknown> | null = null;

    public onDeleteButtonClick(): void {
        this.deleteProcessing$ = timer(1000);
    }
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

    it('should process success action', fakeAsync(() => {
        fixture.detectChanges();
        let deleteButton = fixture.debugElement.query(By.css('.delete-button'));
        expect(fixture.debugElement.query(By.css('.loading'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.error'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.success'))).toBeFalsy();
        expect(deleteButton).toBeTruthy();
        deleteButton.triggerEventHandler('click');
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.delete-button'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.error'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.success'))).toBeFalsy();
        tick(1000);
        expect(fixture.debugElement.query(By.css('.delete-button'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.error'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.success'))).toBeTruthy();
    }));
});
