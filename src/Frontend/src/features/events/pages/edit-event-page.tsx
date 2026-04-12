import { useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PageHeader,
  Button,
  Input,
  Textarea,
  DatePicker,
  Skeleton,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/ui';
import {
  updateEventSchema,
  type UpdateEventInput,
} from '@/shared/validation';
import type { UpdateEventRequest } from '@/shared/types';
import { useEventDetail } from '../hooks/use-event-detail';
import { useUpdateEvent } from '../hooks/use-update-event';

/* -------------------------------------------------------------------------- */
/*  Route type helper                                                          */
/* -------------------------------------------------------------------------- */

interface RouteParams {
  eventId: string;
}

export interface EditEventPageProps {
  params?: RouteParams;
}

/* -------------------------------------------------------------------------- */
/*  EditEventPage                                                              */
/* -------------------------------------------------------------------------- */

export function EditEventPage({ params }: EditEventPageProps) {
  const { t } = useTranslation('events');
  const navigate = useNavigate();

  const eventId = params?.eventId ?? '';

  const { data: event, isLoading: isLoadingEvent } = useEventDetail(eventId);
  const updateMutation = useUpdateEvent(eventId);

  const methods = useForm<UpdateEventInput>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: '',
      description: '',
      venue: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      startDate: '',
      endDate: '',
      capacity: 100,
      categories: '',
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  /* Pre-populate the form when the event data loads */
  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        venue: event.venue,
        street: '', // street is not exposed in EventDto -- leave blank
        city: event.city,
        state: '',
        country: event.country,
        postalCode: '',
        startDate: event.startDate,
        endDate: event.endDate,
        capacity: event.capacity,
        categories: event.categories,
      });
    }
  }, [event, reset]);

  const onSubmit = useCallback(
    (data: UpdateEventInput) => {
      const request: UpdateEventRequest = { ...data };
      updateMutation.mutate(request, {
        onSuccess: () => {
          navigate({ to: '/events/$eventId', params: { eventId } });
        },
      });
    },
    [updateMutation, navigate, eventId],
  );

  const isPending = updateMutation.isPending || isSubmitting;

  /* ----- Loading skeleton ----- */
  if (isLoadingEvent) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton variant="heading" />
        <Skeleton variant="rectangle" height={200} />
        <Skeleton variant="rectangle" height={200} />
        <Skeleton variant="rectangle" height={120} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">
          {t('edit.notFound', 'Event not found.')}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title={t('edit.title', 'Edit Event')}
        breadcrumbs={[
          { label: t('breadcrumb.home', 'Home'), href: '/' },
          { label: t('breadcrumb.events', 'Events'), href: '/events' },
          { label: event.title, href: `/events/${eventId}` },
          { label: t('breadcrumb.edit', 'Edit') },
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* ---- Basic Information ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('edit.basicInfo', 'Basic Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <div>
                    <FormLabel>{t('fields.title', 'Title')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('fields.titlePlaceholder', 'Enter event title')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <div>
                    <FormLabel>{t('fields.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'fields.descriptionPlaceholder',
                          'Describe the event...',
                        )}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                control={control}
                name="categories"
                render={({ field }) => (
                  <div>
                    <FormLabel>{t('fields.categories', 'Categories')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'fields.categoriesPlaceholder',
                          'e.g. Technology, Business (comma-separated)',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* ---- Location ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('edit.location', 'Location')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="venue"
                render={({ field }) => (
                  <div>
                    <FormLabel>{t('fields.venue', 'Venue')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('fields.venuePlaceholder', 'Venue name')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                control={control}
                name="street"
                render={({ field }) => (
                  <div>
                    <FormLabel>{t('fields.street', 'Street')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('fields.streetPlaceholder', 'Street address')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <div>
                      <FormLabel>{t('fields.city', 'City')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('fields.cityPlaceholder', 'City')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <div>
                      <FormLabel>{t('fields.state', 'State / Province')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('fields.statePlaceholder', 'State or province')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <div>
                      <FormLabel>{t('fields.country', 'Country')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('fields.countryPlaceholder', 'Country')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={control}
                  name="postalCode"
                  render={({ field }) => (
                    <div>
                      <FormLabel>{t('fields.postalCode', 'Postal Code')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('fields.postalCodePlaceholder', 'Postal code')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ---- Date & Capacity ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('edit.dateCapacity', 'Date & Capacity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <div>
                      <FormLabel>{t('fields.startDate', 'Start Date')}</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('fields.startDatePlaceholder', 'Select start date')}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <div>
                      <FormLabel>{t('fields.endDate', 'End Date')}</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('fields.endDatePlaceholder', 'Select end date')}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="capacity"
                render={({ field }) => (
                  <div>
                    <FormLabel>{t('fields.capacity', 'Capacity')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder={t('fields.capacityPlaceholder', 'Maximum attendees')}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* ---- Submit ---- */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/events/$eventId', params: { eventId } })}
            >
              {t('edit.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
            >
              {t('edit.submit', 'Save Changes')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
