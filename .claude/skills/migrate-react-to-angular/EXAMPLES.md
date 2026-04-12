# Migration Examples

End-to-end transformations for complex, multi-pattern files.

---

## Example 1: Multi-step form page

**React patterns**: useState, useForm, zodResolver, useFieldArray, FormProvider, useTranslation, useAuth, useMutation (custom hook), Radix UI, CVA/Tailwind.

### React (before)
```tsx
export function CreateBookingPage() {
  const { t } = useTranslation('bookings');
  const { user } = useAuth();
  const mutation = useCreateBooking();
  const [step, setStep] = useState<Step>('itineraries');

  const methods = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: { userId: user?.id, currency: 'USD', itineraries: [{}], passengers: [{}] },
    mode: 'onTouched',
  });

  const { fields: itinFields, append: addItin, remove: removeItin } = useFieldArray({
    control: methods.control, name: 'itineraries',
  });

  async function goToStep(target: Step) {
    if (step === 'itineraries') { if (!(await methods.trigger('itineraries'))) return; }
    setStep(target);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}>
        {step === 'itineraries' && itinFields.map((f, i) => (
          <ItineraryRow key={f.id} index={i} onRemove={() => removeItin(i)} />
        ))}
        {step === 'review' && <ReviewSummary />}
        <Button loading={mutation.isPending}>Submit</Button>
      </form>
    </FormProvider>
  );
}
```

### Angular (after)
```typescript
@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonComponent, ItineraryRowComponent, ReviewSummaryComponent],
  templateUrl: './create-booking.component.html',
})
export class CreateBookingComponent {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private auth = inject(AuthService);

  step = signal<'itineraries' | 'passengers' | 'review'>('itineraries');
  isPending = signal(false);

  form = this.fb.group({
    userId: [this.auth.currentUser()?.id ?? '', Validators.required],
    totalAmount: [0, [Validators.required, Validators.min(0)]],
    currency: ['USD', Validators.required],
    itineraries: this.fb.array([this.createItinerary()]),
    passengers: this.fb.array([this.createPassenger()]),
  });

  get itineraries(): FormArray { return this.form.get('itineraries') as FormArray; }

  createItinerary(): FormGroup {
    return this.fb.group({
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      travelClass: ['economy'],
      departureDate: ['', Validators.required],
      returnDate: [''],
    });
  }

  createPassenger(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      passportNumber: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
    });
  }

  addItinerary(): void { this.itineraries.push(this.createItinerary()); }
  removeItinerary(i: number): void { this.itineraries.removeAt(i); }

  goToStep(target: 'itineraries' | 'passengers' | 'review'): void {
    if (this.step() === 'itineraries' && target !== 'itineraries') {
      this.itineraries.markAllAsTouched();
      if (this.itineraries.invalid) return;
    }
    this.step.set(target);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isPending.set(true);
    this.bookingService.createBooking(this.form.getRawValue()).subscribe({
      next: (booking) => {
        this.router.navigate(['/bookings', booking.id]);
        this.toastService.show({ variant: 'success', title: 'Booking Requested' });
      },
      error: () => this.isPending.set(false),
      complete: () => this.isPending.set(false),
    });
  }
}
```

### Template (create-booking.component.html)
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  @if (step() === 'itineraries') {
    @for (ctrl of itineraries.controls; track ctrl; let i = $index) {
      <app-itinerary-row [index]="i" [form]="ctrl" (remove)="removeItinerary(i)" />
    }
    <button type="button" (click)="addItinerary()">+ Add Itinerary</button>
  }

  @if (step() === 'review') {
    <app-review-summary [form]="form" />
  }

  <div class="flex gap-2">
    @if (step() !== 'itineraries') {
      <button type="button" (click)="goToStep('itineraries')">Back</button>
    }
    @if (step() !== 'review') {
      <button type="button" (click)="goToStep('review')">Next</button>
    }
    @if (step() === 'review') {
      <app-button [loading]="isPending()" type="submit">Submit</app-button>
    }
  </div>
</form>
```

**Migration notes**:
- `useForm` + `zodResolver` → `FormBuilder.group()` + Angular validators (or reuse Zod with `zodValidator()` adapter from REFERENCE.md)
- `useFieldArray` → `FormArray` with `push()`/`removeAt()`
- `FormProvider` → pass `FormGroup` as `@Input()` to child components
- `mutation.mutate()` → direct `.subscribe()` with isPending signal
- `mutation.isPending` → manual `isPending` signal

---

## Example 2: Real-time data sync (query + SignalR)

**React patterns**: useQuery (custom hook), useSignalREvent, useQueryClient, useState for transition state.

### React (before)
```tsx
export function useBookingSagaStatus(bookingId: string | undefined) {
  const queryClient = useQueryClient();
  const { data: booking, isLoading, error } = useBookingDetail(bookingId);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useSignalREvent<BookingConfirmedEvent>('BookingConfirmed', (event) => {
    if (event.bookingId === bookingId) {
      setIsTransitioning(true);
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) })
        .then(() => setIsTransitioning(false));
    }
  });

  return { booking, sagaState: booking?.status ?? 'Requested', isTransitioning, isLoading, error };
}
```

### Angular (after)
```typescript
@Injectable()
export class BookingSagaStatusService {
  private bookingService = inject(BookingService);
  private signalr = inject(SignalRService);

  getStatus(bookingId: string) {
    const isTransitioning = signal(false);

    // Initial load + auto-refresh on SignalR event
    const booking$ = this.signalr.on<BookingConfirmedEvent>('BookingConfirmed').pipe(
      filter(e => e.bookingId === bookingId),
      tap(() => isTransitioning.set(true)),
      startWith(null), // trigger initial load
      switchMap(() => this.bookingService.getBooking(bookingId)),
      tap(() => isTransitioning.set(false)),
      shareReplay(1),
    );

    return { booking$, isTransitioning };
  }
}

// Component usage
export class BookingDetailComponent implements OnInit {
  private sagaService = inject(BookingSagaStatusService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  booking = signal<BookingDto | null>(null);
  isTransitioning = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('bookingId')!;
    const { booking$, isTransitioning } = this.sagaService.getStatus(id);
    this.isTransitioning = isTransitioning;

    booking$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(b => this.booking.set(b));
  }
}
```

**Migration notes**:
- `useQueryClient().invalidateQueries()` → `switchMap` to re-fetch on SignalR event
- `useSignalREvent` → `signalr.on<T>()` returns Observable, filter by ID
- Transition state preserved with signal, same UX behavior
- `shareReplay(1)` replaces TanStack Query's built-in caching

---

## Example 3: Feature module (complete folder migration)

### React structure
```
features/bookings/
  hooks/
    use-bookings-search.ts    → BookingService.searchBookings()
    use-create-booking.ts     → BookingService.createBooking()
    use-booking-detail.ts     → BookingService.getBooking()
    use-booking-saga-status.ts → BookingSagaStatusService
  components/
    booking-card.tsx           → booking-card.component.ts
    booking-filters.tsx        → booking-filters.component.ts
    itinerary-form-row.tsx     → itinerary-form-row.component.ts
  pages/
    bookings-page.tsx          → booking-search.component.ts
    create-booking-page.tsx    → create-booking.component.ts
    booking-detail-page.tsx    → booking-detail.component.ts
```

### Angular structure
```
features/bookings/
  services/
    booking.service.ts         # All API calls (merged from hooks)
    booking-saga-status.service.ts
  components/
    booking-card.component.ts
    booking-filters.component.ts
    itinerary-form-row.component.ts
    booking-search.component.ts
    create-booking.component.ts
    booking-detail.component.ts
  routes.ts                    # Lazy-loaded routes
  index.ts                     # Barrel export
```

### Routes file
```typescript
// features/bookings/routes.ts
export const BOOKING_ROUTES: Routes = [
  { path: '', component: BookingSearchComponent },
  { path: 'new', component: CreateBookingComponent },
  { path: ':bookingId', component: BookingDetailComponent },
];
```

### Service (merges all hooks into one service)
```typescript
@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  searchBookings(filters: BookingFilters): Observable<PaginatedResult<BookingDto>> {
    const params = new HttpParams({ fromObject: filters as Record<string, string> });
    return this.http.get<PaginatedResult<BookingDto>>('/api/bookings', { params });
  }

  getBooking(id: string): Observable<BookingDto> {
    return this.http.get<BookingDto>(`/api/bookings/${id}`);
  }

  createBooking(data: CreateBookingRequest): Observable<BookingDto> {
    return this.http.post<BookingDto>('/api/bookings', data);
  }
}
```

**Migration notes**:
- Multiple React hooks for the same domain → single Angular service
- `pages/` → just components (no special distinction in Angular)
- Each component is standalone — import only what it uses
- Feature barrel export (`index.ts`) re-exports routes and public components

---

## Example 4: Provider tree → app.config.ts

### React (before)
```tsx
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TelemetryProvider>
        <QueryClientProvider client={queryClient}>
          <SignalRProvider>
            <FeatureFlagProvider>
              <ToastProvider>{children}</ToastProvider>
            </FeatureFlagProvider>
          </SignalRProvider>
        </QueryClientProvider>
      </TelemetryProvider>
    </AuthProvider>
  );
}
```

### Angular (after)
```typescript
// app.config.ts — flat, no nesting
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, correlationInterceptor, retryInterceptor, errorInterceptor])
    ),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient] },
      })
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // AuthService, SignalRService, FeatureFlagService, ToastService, TelemetryService
    // are all providedIn: 'root' — no explicit registration needed
  ],
};
```

**Migration notes**:
- React's nested provider tree becomes flat Angular DI
- Provider ordering no longer matters — Angular resolves dependencies automatically
- `APP_INITIALIZER` can handle boot-sequence dependencies (e.g., load feature flags before rendering)
- Services that were React Context + Provider become `@Injectable({ providedIn: 'root' })`
