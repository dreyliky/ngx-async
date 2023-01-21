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
    takeUntil
} from 'rxjs';
import { NgxAsyncContext as Context } from './ngx-async-context.class';

@Directive({
    selector: '[ngxAsync]'
})
export class NgxAsyncDirective<T = unknown> implements OnChanges, OnDestroy {
    @Input('ngxAsync')
    public data$!: Observable<T> | undefined;

    @Input('ngxAsyncLoading')
    public loadingTemplate: TemplateRef<unknown> | undefined;

    @Input('ngxAsyncError')
    public errorTemplate: TemplateRef<unknown> | undefined;

    @Input('ngxAsyncSuccess')
    public successTemplate: TemplateRef<unknown> | undefined;

    private readonly viewDestroyed$ = new Subject<boolean>();

    private _subscription: Subscription | undefined;

    constructor(
        private readonly viewContainerRef: ViewContainerRef,
        private readonly templateRef: TemplateRef<Context<T>>,
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
            this.tryCreateView(this.templateRef);
        }
    }

    public ngOnDestroy(): void {
        this.viewDestroyed$.next(true);
        this.viewDestroyed$.complete();
    }

    private initDataObserver(): void {
        this._subscription?.unsubscribe();
        this.tryCreateView(this.loadingTemplate);

        this._subscription = this.data$
            ?.pipe(takeUntil(this.viewDestroyed$))
            .subscribe({
                next: (data) => this.tryCreateView(this.templateRef, new Context(data)),
                complete: () => this.tryCreateView(this.successTemplate ?? this.templateRef),
                error: () => this.tryCreateView(this.errorTemplate)
            });
    }

    private tryCreateView(
        template: TemplateRef<unknown> | undefined,
        context: Context | null = null
    ): void {
        this.viewContainerRef.clear();

        if (template) {
            this.viewContainerRef.createEmbeddedView(template, context);
        }

        this.changeDetector.markForCheck();
    }
}
