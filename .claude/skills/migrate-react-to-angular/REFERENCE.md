# React to Angular Migration Reference

Pattern-by-pattern mapping with before/after code. Targets Angular 17+ with signals and standalone components.

---

## 1. Project Structure

### React (typical)
```
src/
  app/          # router, providers, layout
  features/     # domain modules (pages/, hooks/, components/)
  shared/       # api/, auth/, ui/, stores/, types/, validation/
```

### Angular (target)
```
src/app/
  core/           # singleton services (auth, http, signalr, error-handler, feature-flags)
  shared/         # reusable UI components, pipes, directives, validators, types, utils
  features/       # lazy-loaded feature routes
    bookings/     # routes.ts, components/, services/
    events/
  app.component.ts
  app.config.ts
  app.routes.ts
```

- **Standalone components** (no NgModules) — Angular 17+ default
- Each feature gets its own `routes.ts` for lazy loading
- `core/` services use `providedIn: 'root'`
- `shared/` components are individually importable

---

## 2. Components

### Functional component → Angular component with signals
```tsx
// React
export function BookingBadge({ status }: { status: BookingStatus }) {
  const colorClass = useMemo(() => getStatusColor(status), [status]);
  return <span className={cn('badge', colorClass)}>{status}</span>;
}
```
```typescript
// Angular
@Component({
  selector: 'app-booking-badge',
  standalone: true,
  template: `<span [class]="'badge ' + colorClass()">{{ status() }}</span>`,
})
export class BookingBadgeComponent {
  status = input.required<BookingStatus>();
  colorClass = computed(() => getStatusColor(this.status()));
}
```

### Hook equivalents

| React Hook | Angular Equivalent |
|---|---|
| `useState(init)` | `signal(init)` |
| `useMemo(fn, deps)` | `computed(fn)` (auto-tracked, no deps array) |
| `useCallback(fn, deps)` | Plain method (Angular doesn't re-render on reference identity) |
| `useEffect(fn, deps)` | `effect()` for reactive side effects, or `ngOnInit`/`ngOnDestroy` for lifecycle |
| `useRef(init)` | `viewChild('name')` for DOM, or plain class field for values |
| `useContext(Ctx)` | `inject(ServiceClass)` |
| `useId()` | Not needed; Angular generates unique IDs via CDK `_uniqueId` |

### useEffect → effect() or lifecycle hooks
```tsx
// React — side effect on mount/unmount
useEffect(() => {
  const sub = connection.on('event', handler);
  return () => sub.off();
}, [connection]);
```
```typescript
// Angular
private destroyRef = inject(DestroyRef);

ngOnInit() {
  const sub = this.connection.on('event', this.handler);
  this.destroyRef.onDestroy(() => sub.off());
}
```

### forwardRef → not needed
Angular components expose their element natively. Use `ViewChild` for programmatic access.

### ErrorBoundary → Angular ErrorHandler
```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (error instanceof ApiException) {
      // show toast or route to error page
    }
    console.error(error);
  }
}
// Register: { provide: ErrorHandler, useClass: GlobalErrorHandler }
```

### HOCs / render props → directives or content projection
- HOC wrapping → structural directive or wrapper component with `<ng-content>`
- Render props → `<ng-template>` with `ngTemplateOutlet`

### Portals → Angular CDK Overlay
Use `@angular/cdk/overlay` for dialogs, tooltips, dropdowns.

---

## 3. State Management

### Zustand → Signal-based service
```tsx
// React
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
```
```typescript
// Angular
@Injectable({ providedIn: 'root' })
export class UIStore {
  readonly sidebarOpen = signal(true);
  readonly theme = signal<'light' | 'dark'>('light');

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  setTheme(theme: 'light' | 'dark'): void { this.theme.set(theme); }
}
// Usage: private ui = inject(UIStore);
// Template: @if (ui.sidebarOpen()) { <aside>...</aside> }
```

### Zustand selectors → direct signal reads
```tsx
// React: const open = useUIStore((s) => s.sidebarOpen);
// Angular: ui.sidebarOpen() — auto-tracked in templates
```

**For complex state**: Consider NgRx SignalStore if the app has >5 stores with cross-store dependencies.

---

## 4. Server State (TanStack Query → HttpClient + RxJS)

### useQuery → service + toSignal
```tsx
// React
const { data, isLoading } = useQuery({
  queryKey: bookingKeys.detail(id),
  queryFn: () => getBooking(id),
});
```
```typescript
// Angular service
@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  getBooking(id: string): Observable<BookingDto> {
    return this.http.get<BookingDto>(`/api/bookings/${id}`);
  }
}

// Component
export class BookingDetailComponent {
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);

  private id = toSignal(this.route.paramMap.pipe(map(p => p.get('bookingId')!)));
  booking = toSignal(
    toObservable(this.id).pipe(switchMap(id => this.bookingService.getBooking(id)))
  );
}
```

### useMutation → service call + component state
```typescript
// Angular
isPending = signal(false);

onSubmit(data: CreateBookingRequest): void {
  this.isPending.set(true);
  this.bookingService.createBooking(data).subscribe({
    next: (booking) => {
      this.router.navigate(['/bookings', booking.id]);
      this.toastService.show({ variant: 'success', title: 'Booking Requested' });
    },
    error: () => this.isPending.set(false),
    complete: () => this.isPending.set(false),
  });
}
```

### Cache invalidation
No direct equivalent. Options:
- Use `shareReplay(1)` for simple caching
- Use `@tanstack/angular-query-experimental` if heavy caching is needed
- Build a lightweight cache service for critical paths

---

## 5. Routing

| React (TanStack Router) | Angular Router |
|---|---|
| `createRootRoute({ component })` | Root layout in `app.component.ts` |
| `createRoute({ path: 'bookings' })` | `{ path: 'bookings', loadChildren: ... }` |
| `$bookingId` param | `:bookingId` param |
| `beforeLoad` guard | `canActivate` functional guard |
| `redirect({ to: '/reports' })` | `{ path: '', redirectTo: '/reports', pathMatch: 'full' }` |
| `lazy(() => import(...))` | `loadComponent: () => import(...)` |
| `<Outlet />` | `<router-outlet />` |
| `useNavigate()` | `inject(Router).navigate(...)` |
| `useParams()` | `inject(ActivatedRoute).paramMap` |

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/reports', pathMatch: 'full' },
  { path: 'reports', loadChildren: () => import('./features/reports/routes').then(m => m.REPORT_ROUTES) },
  { path: 'bookings', loadChildren: () => import('./features/bookings/routes').then(m => m.BOOKING_ROUTES) },
  { path: '**', component: NotFoundComponent },
];

// features/bookings/routes.ts
export const BOOKING_ROUTES: Routes = [
  { path: '', component: BookingSearchComponent },
  { path: 'new', component: CreateBookingComponent },
  { path: ':bookingId', component: BookingDetailComponent },
];
```

### Auth guards
```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const roleGuard = (role: string): CanActivateFn => () => {
  return inject(AuthService).currentUser()?.roles.includes(role) ?? false;
};
```

---

## 6. Forms

| React Hook Form | Angular Reactive Forms |
|---|---|
| `useForm({ resolver: zodResolver(schema) })` | `FormBuilder.group({...})` with validators |
| `useFieldArray({ name })` | `FormArray` |
| `FormProvider` | Pass `FormGroup` via input or DI |
| `trigger('field')` | `form.get('field')!.markAsTouched()` |
| `watch()` | `form.valueChanges` pipe or `form.getRawValue()` |
| `handleSubmit(fn)` | `(ngSubmit)="onSubmit()"` + `form.valid` check |

### Zod reuse in Angular
```typescript
export function zodValidator(schema: ZodType): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(control.value);
    return result.success ? null : { zod: result.error.flatten().fieldErrors };
  };
}
```

### Multi-step form pattern
```typescript
step = signal<'itineraries' | 'passengers' | 'review'>('itineraries');
form = this.fb.group({
  itineraries: this.fb.array([this.createItinerary()]),
  passengers: this.fb.array([this.createPassenger()]),
});

get itineraries(): FormArray { return this.form.get('itineraries') as FormArray; }

goToStep(target: string): void {
  if (this.step() === 'itineraries') {
    this.itineraries.markAllAsTouched();
    if (this.itineraries.invalid) return;
  }
  this.step.set(target);
}
```

---

## 7. Context / DI

| React | Angular |
|---|---|
| `createContext()` + `Provider` | `@Injectable({ providedIn: 'root' })` |
| `useContext(Ctx)` | `inject(Service)` |
| Nested provider tree | Flat DI — services injected independently |
| Scoped provider | `providedIn: 'any'` or route-level `providers: [...]` |

```typescript
// Auth service (replaces AuthContext + AuthProvider)
@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly currentUser = this.user.asReadonly();
  async getAccessToken(): Promise<string | null> { /* ... */ }
}
```

### Provider tree → app.config.ts
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, correlationInterceptor, retryInterceptor, errorInterceptor])),
    provideAnimations(),
    importProvidersFrom(TranslateModule.forRoot({ loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient] } })),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
```

---

## 8. HTTP Client

### Custom fetch wrapper → HttpClient + interceptors

```typescript
// Auth interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessTokenSync();
  return token
    ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
    : next(req);
};

// Correlation ID interceptor
export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ setHeaders: { 'X-Correlation-Id': crypto.randomUUID() } }));
};

// Retry interceptor (replaces manual retry loop)
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({ count: 3, delay: (error, retryCount) => {
      if (error.status < 500) throw error;
      return timer(1000 * Math.pow(2, retryCount));
    }}),
  );
};

// Error parsing interceptor (replaces ApiException.fromErrorBody)
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.error?.error) throw ApiException.fromErrorBody(err.error, err.status);
      throw new ApiException('INTERNAL_ERROR', err.message, '', err.status);
    }),
  );
};
```

---

## 9. SignalR

### React provider + hooks → Angular service with RxJS
```typescript
@Injectable({ providedIn: 'root' })
export class SignalRService {
  private auth = inject(AuthService);
  private connection: HubConnection | null = null;
  readonly status = signal<'connected' | 'connecting' | 'reconnecting' | 'disconnected'>('disconnected');
  private subjects = new Map<string, Subject<unknown>>();

  async connect(): Promise<void> {
    this.status.set('connecting');
    this.connection = new HubConnectionBuilder()
      .withUrl('/hubs/events', { accessTokenFactory: () => this.auth.getAccessToken()! })
      .withAutomaticReconnect()
      .build();
    this.connection.onreconnecting(() => this.status.set('reconnecting'));
    this.connection.onreconnected(() => this.status.set('connected'));
    this.connection.onclose(() => this.status.set('disconnected'));
    await this.connection.start();
    this.status.set('connected');
  }

  on<T>(event: string): Observable<T> {
    if (!this.subjects.has(event)) {
      const subject = new Subject<T>();
      this.subjects.set(event, subject as Subject<unknown>);
      this.connection?.on(event, (data: T) => subject.next(data));
    }
    return this.subjects.get(event)!.asObservable() as Observable<T>;
  }

  disconnect(): void {
    this.connection?.stop();
    this.subjects.forEach(s => s.complete());
    this.subjects.clear();
    this.status.set('disconnected');
  }
}

// Usage (replaces useSignalREvent):
this.signalr.on<BookingConfirmedEvent>('BookingConfirmed')
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(event => { /* handle */ });
```

---

## 10. Feature Flags

### FeatureGate component → structural directive
```typescript
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags = signal<Record<string, boolean>>({});
  isEnabled(flag: string): boolean { return this.flags()[flag] ?? false; } // fail-closed
}

@Directive({ selector: '[appFeatureFlag]', standalone: true })
export class FeatureFlagDirective {
  private flags = inject(FeatureFlagService);
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private rendered = false;

  @Input() set appFeatureFlag(flag: string) {
    const enabled = this.flags.isEnabled(flag);
    if (enabled && !this.rendered) { this.vcr.createEmbeddedView(this.tpl); this.rendered = true; }
    else if (!enabled && this.rendered) { this.vcr.clear(); this.rendered = false; }
  }
}
// Usage: <div *appFeatureFlag="'new-dashboard'">...</div>
```

---

## 11. i18n

| react-i18next | @ngx-translate/core |
|---|---|
| `useTranslation('ns')` | `TranslateModule` + `translate` pipe |
| `t('key')` | `{{ 'ns.key' \| translate }}` |
| `i18next.init({ resources })` | `TranslateHttpLoader` with JSON files |

Namespace JSON files (`locales/en/bookings.json`) reusable as-is.

---

## 12. UI Components

| Radix Primitive | Angular Equivalent |
|---|---|
| `Dialog` | `@angular/cdk/dialog` |
| `DropdownMenu` | `@angular/cdk/menu` |
| `Select` | `cdkListbox` or `mat-select` |
| `Tabs` | Custom with CDK a11y or `mat-tab-group` |
| `Toast` | CDK overlay + custom toast service |
| `Tooltip` | CDK overlay + custom directive |
| `Switch` | Custom toggle or `mat-slide-toggle` |

### CVA + cn() + Tailwind — keep as-is
```typescript
// shared/utils/cn.ts — identical to React version
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(...inputs)); }
```

CVA variant definitions work in Angular unchanged. Apply via `[class]` binding:
```typescript
template: `<button [class]="buttonVariants({ variant: variant(), size: size() })">
  <ng-content />
</button>`
```

---

## 13. Testing

| React | Angular |
|---|---|
| Vitest | Jest (`@angular-builders/jest`) or Karma |
| `@testing-library/react` | `@testing-library/angular` (recommended — same API) |
| `screen.getByRole()` | `screen.getByRole()` (with TL/angular) |
| `userEvent.click()` | `userEvent.click()` (with TL/angular) |
| MSW handlers | `HttpClientTestingModule` + `HttpTestingController` |
| `vi.fn()` | `jest.fn()` or `jasmine.createSpy()` |
| Playwright E2E | Playwright E2E (update selectors only) |

**Recommendation**: Use `@testing-library/angular` to minimize test rewriting.

---

## 14. Build Tooling

| Vite | Angular CLI |
|---|---|
| `vite.config.ts` | `angular.json` (esbuild-based since v17) |
| `.env.development` | `environment.development.ts` + `fileReplacements` |
| `vite preview` | `ng serve` |
| `vite build` | `ng build` |
| Path alias `@/` in tsconfig | Same — `paths: { "@/*": ["./src/app/*"] }` |
| Proxy config in `vite.config.ts` | `proxy.conf.json` referenced in `angular.json` |

---

## 15. TypeScript Patterns — No Change Needed

These transfer directly:
- Union types: `type BookingStatus = 'Confirmed' | 'Pending'`
- `z.infer<typeof schema>` (if keeping Zod)
- Barrel exports (`index.ts`)
- Path aliases (`@/`)
- Generic utility types
