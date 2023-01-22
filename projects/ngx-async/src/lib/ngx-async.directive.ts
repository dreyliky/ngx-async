import {
    ChangeDetectorRef,
    Directive,
    Input,
    OnChanges,
    OnDestroy,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import {
    Observable,
    Subject,
    Subscription,
    takeUntil,
    tap
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

        this._subscription = this.data$
            ?.pipe(
                tap((currentData) => data = currentData),
                takeUntil(this.viewDestroyed$)
            )
            .subscribe({
                next: () => this.tryCreateView(this.initialTemplate, new Context(data)),
                complete: () => this.tryCreateView(this.successOrInitialTemplate, new Context(data)),
                error: () => this.tryCreateView(this.errorTemplate)
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
