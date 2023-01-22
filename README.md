## ngx-async 🪄 [Angular 15+]

# Idea

Directive allows you to work with Observable and visually represent its statuses, like Loading, Error, Success.

[StackBlitz example #1](https://stackblitz.com/edit/angular-ivy-sdeg3n?file=src%2Fapp%2Fapp.component.html)

[StackBlitz example #2](https://stackblitz.com/edit/angular-ivy-4xbhy4?file=src%2Fapp%2Fitem-delete-button%2Fitem-delete-button.component.html)

# Installation
`npm install ngx-async --save`

# Get Started

Add `NgxAsyncModule` to your module.

```typescript
import { NgxAsyncModule } from 'ngx-async';

@NgModule({
    imports: [NgxAsyncModule]
})
export class AppModule {}
```

# Usage by representing data and its statuses

Add the `ngxAsync` structural directive on your element.

Define `loadingTemplate` (optional), `errorTemplate` (optional).

### Description

In this example will be rendered `loadingTemplate`
while there is no data from `labels$` Observable.

If `labels$` Observable has an error then it will be rendered `errorTemplate`.

if `labels$` Observable will have the status "next" (loaded),
then will be rendered the `mat-list` component.

*example.component.html*
```html
<ng-container *ngxAsync="labels$ as labels; loading: loadingTemplate; error: errorTemplate;">
    <mat-list>
        <mat-list-item *ngFor="let label of labels">
            {{ label.name }}
        </mat-list-item>
    </mat-list>
</ng-container>

<ng-template #loadingTemplate>
    <div class="loading">
        Loading...
    </div>
</ng-template>

<ng-template #errorTemplate>
    <div class="error">
        Can't load data
    </div>
</ng-template>
```

*example.component.ts*
```typescript
@Component({})
export class ExampleComponent {
    public readonly labels$ = this.labelsService.getAll();

    constructor(
        private readonly labelsService: LabelsService
    ) {}
}
```

# Usage by representing "action" and its statuses

You can use the `ngxAsync` directive with `ng-template` as well.

In this case, data from your Observable will be in the context of the `ng-template` by the `$implicit` key.

So, you can get this data by defining `let-data` on the `ng-template`.

### Description

In this example will be rendered `button` element.

When `button` will be clicked, than `onDeleteButtonClick` handler
will change field `deletingProcess$` to Observable from the service.

After that `loadingTemplate` will be rendered while there is no data.

If the `deletingProcess$` Observable has an error then it will be rendered `errorTemplate`.

If the `deletingProcess$` Observable will be completed then it will be rendered `successTemplate`.

*example.component.html*
```html
<mat-card>
    <ng-template
        [ngxAsync]="deletingProcess$"
        [ngxAsyncLoading]="loadingTemplate"
        [ngxAsyncError]="errorTemplate"
        [ngxAsyncSuccess]="successTemplate">
        <button
            mat-raised-button
            (click)="onDeleteButtonClick()">
            Delete
        </button>
    </ng-template>
</mat-card>

<ng-template #loadingTemplate>
    <div class="loading">
        Loading...
    </div>
</ng-template>

<ng-template #errorTemplate>
    <div class="error">
        Something went wrong :(
    </div>
</ng-template>

<ng-template #successTemplate>
    <div class="success">
        Card deleted!
    </div>
</ng-template>
```

*example.component.ts*
```typescript
@Component({})
export class ExampleComponent {
    public deletingProcess$: Observable<unknown> | null = null;

    constructor(
        private readonly usersService: UsersService
    ) {}

    public onDeleteButtonClick(): void {
        this.deletingProcess$ = this.usersService.delete();
    }
}
```
