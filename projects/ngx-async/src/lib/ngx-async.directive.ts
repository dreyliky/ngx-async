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

@Directive({
    selector: '[ngxAsync]'
})
export class NgxAsyncDirective<T = unknown> implements OnChanges, OnDestroy {
    @Input('ngxAsync')
    public data$!: Observable<T> | null | undefined;

    @Input('ngxAsyncLoading')
    public loadingTemplate: TemplateRef<unknown> | null | undefined;

    @Input('ngxAsyncError')
    public errorTemplate: TemplateRef<unknown> | null | undefined;

    @Input('ngxAsyncSuccess')
    public successTemplate: TemplateRef<unknown> | null | undefined;

    private readonly viewDestroyed$ = new Subject<boolean>();

    private _subscription: Subscription | undefined;

    private get successOrInitialTemplate(): TemplateRef<unknown> {
        return (this.successTemplate ?? this.templateRef);
    }

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
        let data: T;

        this._subscription?.unsubscribe();
        this.tryCreateView(this.loadingTemplate);

        this._subscription = this.data$
            ?.pipe(
                tap((currentData) => data = currentData),
                takeUntil(this.viewDestroyed$)
            )
            .subscribe({
                next: () => this.tryCreateView(this.templateRef, new Context(data)),
                complete: () => this.tryCreateView(this.successOrInitialTemplate, new Context(data)),
                error: () => this.tryCreateView(this.errorTemplate)
            });
    }

    private tryCreateView(
        template: TemplateRef<unknown> | null | undefined,
        context: Context | null = null
    ): void {
        if (template) {
            this.viewContainerRef.clear();
            this.viewContainerRef.createEmbeddedView(template, context);
            this.changeDetector.markForCheck();
        }
    }
}
