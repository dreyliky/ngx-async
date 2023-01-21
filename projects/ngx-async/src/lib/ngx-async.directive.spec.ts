import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { map, Observable, of, switchMap, throwError, timer } from 'rxjs';
import { NgxAsyncDirective } from './ngx-async.directive';

const items = [
    'Apple',
    'Banana',
    'Orange',
    'Pineapple'
];

@Injectable()
class ItemsService {
    public readonly data$ = of(items);

    public getAll(): Observable<string[]> {
        return timer(1000)
            .pipe(
                map(() => items)
            );
    }

    public getAllWithErrorResult(): Observable<string[]> {
        return of(items)
            .pipe(
                switchMap(() => throwError(() => new Error('Error')))
            );
    }
    
    public deleteWithSuccessResult(): Observable<unknown> {
        return timer(1000);
    }

    public deleteWithErrorResult(): Observable<unknown> {
        return timer(1000)
            .pipe(
                switchMap(() => throwError(() => new Error('Error')))
            );
    }
}

@Component({
    template: `
        <div *ngxAsync="items$ as items; loading: loading;">
            {{ items | json }}
            <ul>
                <li *ngFor="let item of items">
                    {{ item }}
                </li>
            </ul>
        </div>

        <ng-template #loading>
            <div class="loading">Loading...</div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ItemsSuccessComponent {
    public items$ = this.itemsService.getAll();

    constructor(
        private readonly itemsService: ItemsService
    ) {}
}

@Component({
    template: `
        <div *ngxAsync="items$ as items; loading: loading; error: error;">
            <ul>
                <li *ngFor="let item of items">
                    {{ item }}
                </li>
            </ul>
        </div>

        <ng-template #loading>
            <div class="loading">Loading...</div>
        </ng-template>

        <ng-template #error>
            <div class="error">Error...</div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ItemsErrorComponent {
    public items$ = this.itemsService.getAllWithErrorResult();

    constructor(
        private readonly itemsService: ItemsService
    ) {}
}

@Component({
    template: `
        <button
            *ngxAsync="deleteSuccessProcessing$; loading: loading; error: error; success: success;"
            class="delete-success"
            (click)="onDeleteSuccessButtonClick()">
            Delete with success
        </button>

        <button
            *ngxAsync="deleteErrorProcessing$; loading: loading; error: error; success: success;"
            class="delete-error"
            (click)="onDeleteErrorButtonClick()">
            Delete with error
        </button>

        <ng-template #loading>
            <div class="loading">Loading...</div>
        </ng-template>

        <ng-template #error>
            <div class="error">Error...</div>
        </ng-template>

        <ng-template #success>
            <div class="success">Success!</div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DeletingProcessingComponent {
    public deleteSuccessProcessing$: Observable<unknown> | null = null;
    public deleteErrorProcessing$: Observable<unknown> | null = null;

    constructor(
        private readonly itemsService: ItemsService
    ) {}

    public onDeleteSuccessButtonClick(): void {
        this.deleteSuccessProcessing$ = this.itemsService.deleteWithSuccessResult();
    }

    public onDeleteErrorButtonClick(): void {
        this.deleteErrorProcessing$ = this.itemsService.deleteWithErrorResult();
    }
}

describe('NgxAsyncDirective', () => {
    let module: TestBed;

    beforeEach(waitForAsync(() => {
        module = TestBed.configureTestingModule({
            declarations: [
                NgxAsyncDirective,
                ItemsSuccessComponent,
                ItemsErrorComponent,
                DeletingProcessingComponent
            ],
            providers: [
                ItemsService
            ]
        });
        module.compileComponents();
    }));

    it('should create ItemsSuccessComponent', () => {
        const fixture = module.createComponent(ItemsSuccessComponent);
        const component = fixture.componentInstance;

        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should render loading template and host element in ItemsSuccessComponent', fakeAsync(() => {
        const fixture = module.createComponent(ItemsSuccessComponent);

        fixture.detectChanges();
        let liElements = fixture.debugElement.queryAll(By.css('li'));
        expect(liElements.length).toBe(0);

        const loadingElement = fixture.debugElement.query(By.css('.loading'));
        expect(loadingElement).toBeTruthy();

        tick(1000);
        fixture.detectChanges();
        
        liElements = fixture.debugElement.queryAll(By.css('li'));

        expect(liElements.length).toBe(items.length);
    }));

    it('should render error template in ItemsErrorComponent', fakeAsync(() => {
        const fixture = module.createComponent(ItemsErrorComponent);

        fixture.detectChanges();
        let errorElement = fixture.debugElement.query(By.css('.error'));
        expect(errorElement).toBeTruthy();
    }));

    it('should render statuses for actions in DeletingProcessingComponent', fakeAsync(() => {
        const fixture = module.createComponent(DeletingProcessingComponent);
        
        fixture.detectChanges();
        console.log(fixture.nativeElement.innerHTML);

        // Button Success
        let deleteSuccessButton = fixture.debugElement.query(By.css('.delete-success'));
        expect(deleteSuccessButton).toBeTruthy();
        deleteSuccessButton.triggerEventHandler('click');
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.delete-success'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeTruthy();
        tick(1000);
        expect(fixture.debugElement.query(By.css('.success'))).toBeTruthy();

        // Button Error
        let deleteErrorButton = fixture.debugElement.query(By.css('.delete-error'));
        expect(deleteErrorButton).toBeTruthy();
        deleteErrorButton.triggerEventHandler('click');
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.delete-error'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeTruthy();
        tick(1000);
        expect(fixture.debugElement.query(By.css('.error'))).toBeTruthy();
    }));
});

