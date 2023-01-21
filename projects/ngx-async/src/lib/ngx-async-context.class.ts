export class NgxAsyncContext<T = unknown> {
    public $implicit: T = null!;
    public ngxAsync: T = null!;

    constructor(data: T) {
        this.$implicit = this.ngxAsync = data;
    }
}
