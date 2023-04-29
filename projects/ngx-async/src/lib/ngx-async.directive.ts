import {
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import {
    Observable,
    Subject,
    Subscription,
    takeUntil
} from 'rxjs';
import { NgxAsyncContext as Context } from './ngx-async-context.class';

type OptionalTemplateRef<T> = TemplateRef<T> | null | undefined;

@Directive({
    selector: '[ngxAsync]'
})
export class NgxAsyncDirective<T = unknown> implements OnChanges, OnDestroy {
    @Input('ngxAsync')
    public data$!: Observable<T> | null | undefined;

    @Input('ngxAsyncLoading')
    public loadingTemplate: OptionalTemplateRef<void>;

    @Input('ngxAsyncError')
    public errorTemplate: OptionalTemplateRef<void>;

    @Input('ngxAsyncSuccess')
    public successTemplate: OptionalTemplateRef<Context<T>>;

    @Output()
    public loading = new EventEmitter();

    @Output()
    public newData = new EventEmitter<T>();

    @Output()
    public error = new EventEmitter();

    @Output()
    public success = new EventEmitter<T>();

    private readonly viewDestroyed$ = new Subject<boolean>();

    private _subscription: Subscription | undefined;

    private get successOrInitialTemplate(): TemplateRef<Context<T>> {
        return (this.successTemplate ?? this.initialTemplate);
    }

    constructor(
        private readonly viewContainerRef: ViewContainerRef,
        private readonly initialTemplate: TemplateRef<Context<T>>,
        private readonly changeDetector: ChangeDetectorRef
    ) {}

    public static ngTemplateContextGuard<T>(
        directive: NgxAsyncDirective<T>,
        context: unknown
    ): context is Context<T> {
        return true;
    }

    public ngOnChanges(): void {
        if (this.data$) {
            this.initDataObserver();
        } else {
            this.tryCreateView(this.initialTemplate);
        }
    }

    public ngOnDestroy(): void {
        this.viewDestroyed$.next(true);
        this.viewDestroyed$.complete();
    }

    private initDataObserver(): void {
        let data: T;

        this._subscription?.unsubscribe();
        this.tryCreateView(this.loadingTemplate);
        this.loading.emit();

        this._subscription = this.data$
            ?.pipe(takeUntil(this.viewDestroyed$))
            .subscribe({
                next: (newData) => {
                    data = newData;

                    this.tryCreateView(this.initialTemplate, new Context(data));
                    this.newData.emit(newData);
                },
                complete: () => {
                    this.tryCreateView(this.successOrInitialTemplate, new Context(data));
                    this.success.next(data);
                },
                error: () => {
                    this.tryCreateView(this.errorTemplate);
                    this.error.emit();
                }
            });
    }

    private tryCreateView(template: OptionalTemplateRef<unknown>, context?: Context): void {
        if (template) {
            this.viewContainerRef.clear();
            this.viewContainerRef.createEmbeddedView(template, context);
            this.changeDetector.markForCheck();
        }
    }
}
