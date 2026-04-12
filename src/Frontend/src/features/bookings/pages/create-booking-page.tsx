import { useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/ui/card';
import { cn } from '@/shared/utils/cn';
import { formatDate } from '@/shared/utils/date';
import { useAuth } from '@/shared/auth/use-auth';
import {
  createBookingSchema,
  type CreateBookingInput,
} from '@/shared/validation/booking-schemas';
import { useCreateBooking } from '@/features/bookings/hooks/use-create-booking';
import { ItineraryFormRow } from '@/features/bookings/components/itinerary-form-row';
import { PassengerFormRow } from '@/features/bookings/components/passenger-form-row';

/* -------------------------------------------------------------------------- */
/*  CreateBookingPage                                                         */
/*  Multi-step form: 1) Itineraries  2) Passengers  3) Review & Confirm      */
/* -------------------------------------------------------------------------- */

type Step = 'itineraries' | 'passengers' | 'review';

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: 'itineraries', label: 'Itineraries', number: 1 },
  { key: 'passengers', label: 'Passengers', number: 2 },
  { key: 'review', label: 'Review & Confirm', number: 3 },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'AUD', label: 'AUD' },
];

export function CreateBookingPage() {
  const { t } = useTranslation('bookings');
  const { user } = useAuth();
  const createBookingMutation = useCreateBooking();

  const [step, setStep] = useState<Step>('itineraries');

  /* ---- form setup ---- */
  const methods = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      userId: user?.id ?? '',
      totalAmount: 0,
      currency: 'USD',
      itineraries: [
        {
          origin: '',
          destination: '',
          travelClass: 'economy',
          departureDate: '',
          returnDate: undefined,
        },
      ],
      passengers: [
        {
          firstName: '',
          lastName: '',
          passportNumber: '',
          dateOfBirth: '',
        },
      ],
    },
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  /* ---- field arrays ---- */
  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
  } = useFieldArray({ control: methods.control, name: 'itineraries' });

  const {
    fields: passengerFields,
    append: appendPassenger,
    remove: removePassenger,
  } = useFieldArray({ control: methods.control, name: 'passengers' });

  /* ---- step navigation ---- */
  async function goToStep(target: Step) {
    // Validate current step fields before advancing
    if (step === 'itineraries' && target !== 'itineraries') {
      const valid = await trigger('itineraries');
      if (!valid) return;
    }
    if (step === 'passengers' && target === 'review') {
      const valid = await trigger('passengers');
      if (!valid) return;
    }
    setStep(target);
  }

  /* ---- submit ---- */
  function onSubmit(data: CreateBookingInput) {
    createBookingMutation.mutate({
      userId: data.userId,
      totalAmount: data.totalAmount,
      currency: data.currency,
      itineraries: data.itineraries.map((it) => ({
        origin: it.origin,
        destination: it.destination,
        travelClass: it.travelClass,
        departureDate: it.departureDate,
        returnDate: it.returnDate || undefined,
      })),
      passengers: data.passengers.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        passportNumber: p.passportNumber,
        dateOfBirth: p.dateOfBirth,
      })),
    });
  }

  /* ---- watched values for the review step ---- */
  const formValues = watch();
  const currentStepIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <FormProvider {...methods}>
      <PageHeader
        title={t('createBooking.title', { defaultValue: 'Create Booking' })}
        breadcrumbs={[
          { label: t('breadcrumbs.home', { defaultValue: 'Home' }), href: '/' },
          { label: t('breadcrumbs.bookings', { defaultValue: 'Bookings' }), href: '/bookings' },
          { label: t('breadcrumbs.create', { defaultValue: 'Create' }) },
        ]}
      />

      {/* Step indicator */}
      <nav aria-label="Form steps" className="mb-8">
        <ol className="flex items-center gap-2">
          {STEPS.map((s, idx) => {
            const isActive = s.key === step;
            const isCompleted = idx < currentStepIdx;

            return (
              <li
                key={s.key}
                className={cn('flex items-center gap-2', idx < STEPS.length - 1 && 'flex-1')}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                      isActive && 'bg-blue-600 text-white',
                      isCompleted && 'bg-green-500 text-white',
                      !isActive && !isCompleted && 'bg-gray-200 text-gray-500',
                    )}
                  >
                    {s.number}
                  </span>
                  <span
                    className={cn(
                      'hidden text-sm font-medium sm:inline',
                      isActive && 'text-blue-700',
                      isCompleted && 'text-green-700',
                      !isActive && !isCompleted && 'text-gray-400',
                    )}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1',
                      isCompleted ? 'bg-green-500' : 'bg-gray-200',
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ========= Step 1: Itineraries ========= */}
        {step === 'itineraries' && (
          <div className="space-y-4">
            {itineraryFields.map((field, idx) => (
              <ItineraryFormRow
                key={field.id}
                index={idx}
                onRemove={() => removeItinerary(idx)}
                showRemove={itineraryFields.length > 1}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendItinerary({
                  origin: '',
                  destination: '',
                  travelClass: 'economy',
                  departureDate: '',
                  returnDate: undefined,
                })
              }
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('createBooking.addLeg', { defaultValue: 'Add Leg' })}
            </Button>

            {errors.itineraries?.root?.message && (
              <p className="text-sm text-red-600" role="alert">
                {errors.itineraries.root.message}
              </p>
            )}

            <div className="flex justify-end pt-4">
              <Button type="button" onClick={() => goToStep('passengers')}>
                {t('createBooking.next', { defaultValue: 'Next' })}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* ========= Step 2: Passengers ========= */}
        {step === 'passengers' && (
          <div className="space-y-4">
            {passengerFields.map((field, idx) => (
              <PassengerFormRow
                key={field.id}
                index={idx}
                onRemove={() => removePassenger(idx)}
                showRemove={passengerFields.length > 1}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendPassenger({
                  firstName: '',
                  lastName: '',
                  passportNumber: '',
                  dateOfBirth: '',
                })
              }
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('createBooking.addPassenger', { defaultValue: 'Add Passenger' })}
            </Button>

            {errors.passengers?.root?.message && (
              <p className="text-sm text-red-600" role="alert">
                {errors.passengers.root.message}
              </p>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep('itineraries')}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {t('createBooking.back', { defaultValue: 'Back' })}
              </Button>
              <Button type="button" onClick={() => goToStep('review')}>
                {t('createBooking.next', { defaultValue: 'Next' })}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* ========= Step 3: Review & Confirm ========= */}
        {step === 'review' && (
          <div className="space-y-6">
            {/* Itinerary summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('createBooking.reviewItineraries', {
                    defaultValue: 'Itineraries',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="px-3 py-2 font-medium text-gray-500">#</th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.origin', { defaultValue: 'Origin' })}
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.destination', { defaultValue: 'Destination' })}
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.travelClass', { defaultValue: 'Class' })}
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.departureDate', { defaultValue: 'Departure' })}
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.returnDate', { defaultValue: 'Return' })}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formValues.itineraries.map((it, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                          <td className="px-3 py-2">{it.origin}</td>
                          <td className="px-3 py-2">{it.destination}</td>
                          <td className="px-3 py-2 capitalize">{it.travelClass}</td>
                          <td className="px-3 py-2">{formatDate(it.departureDate)}</td>
                          <td className="px-3 py-2">{formatDate(it.returnDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Passenger summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('createBooking.reviewPassengers', {
                    defaultValue: 'Passengers',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="px-3 py-2 font-medium text-gray-500">#</th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.firstName', { defaultValue: 'First Name' })}
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.lastName', { defaultValue: 'Last Name' })}
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.passportNumber', { defaultValue: 'Passport' })}
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          {t('createBooking.dateOfBirth', { defaultValue: 'Date of Birth' })}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formValues.passengers.map((p, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                          <td className="px-3 py-2">{p.firstName}</td>
                          <td className="px-3 py-2">{p.lastName}</td>
                          <td className="px-3 py-2 font-mono">{p.passportNumber}</td>
                          <td className="px-3 py-2">{formatDate(p.dateOfBirth)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Total & Currency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('createBooking.pricing', { defaultValue: 'Pricing' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={t('createBooking.totalAmount', { defaultValue: 'Total Amount' })}
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValues.totalAmount || ''}
                    onChange={(e) =>
                      setValue('totalAmount', parseFloat(e.target.value) || 0, {
                        shouldValidate: true,
                      })
                    }
                    error={errors.totalAmount?.message}
                  />
                  <Select
                    label={t('createBooking.currency', { defaultValue: 'Currency' })}
                    options={CURRENCY_OPTIONS}
                    value={formValues.currency}
                    onValueChange={(val) => setValue('currency', val)}
                    error={errors.currency?.message}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep('passengers')}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {t('createBooking.back', { defaultValue: 'Back' })}
              </Button>
              <Button
                type="submit"
                loading={createBookingMutation.isPending}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {t('createBooking.submit', { defaultValue: 'Submit Booking' })}
              </Button>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
