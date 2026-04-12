import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import {
  PageHeader,
  Button,
  Input,
  Textarea,
  DatePicker,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/ui';
import { useAuth } from '@/shared/auth';
import {
  createEventSchema,
  type CreateEventInput,
} from '@/shared/validation';
import type { CreateEventRequest } from '@/shared/types';
import { useCreateEvent } from '../hooks/use-create-event';

/* -------------------------------------------------------------------------- */
/*  CreateEventPage                                                            */
/* -------------------------------------------------------------------------- */

export function CreateEventPage() {
  const { t } = useTranslation('events');
  const { user } = useAuth();
  const createMutation = useCreateEvent();

  const methods = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      organizerId: user?.id ?? '',
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
      sessions: [],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sessions',
  });

  const onSubmit = useCallback(
    (data: CreateEventInput) => {
      const request: CreateEventRequest = {
        ...data,
        sessions: data.sessions.map((s) => ({
          ...s,
          description: '',
        })),
      };
      createMutation.mutate(request);
    },
    [createMutation],
  );

  const isPending = createMutation.isPending || isSubmitting;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title={t('create.title', 'Create Event')}
        breadcrumbs={[
          { label: t('breadcrumb.home', 'Home'), href: '/' },
          { label: t('breadcrumb.events', 'Events'), href: '/events' },
          { label: t('breadcrumb.create', 'Create') },
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* ---- Basic Information ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('create.basicInfo', 'Basic Information')}
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
                {t('create.location', 'Location')}
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
                {t('create.dateCapacity', 'Date & Capacity')}
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

          {/* ---- Sessions (dynamic) ---- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('create.sessions', 'Sessions')}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      title: '',
                      description: '',
                      speaker: '',
                      startTime: '',
                      endTime: '',
                      capacity: 50,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  {t('create.addSession', 'Add Session')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.length === 0 && (
                <p className="text-sm text-gray-500">
                  {t('create.noSessions', 'No sessions added yet. Click "Add Session" to begin.')}
                </p>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative rounded-lg border border-gray-200 p-4 space-y-4"
                >
                  {/* Remove button */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                      {t('create.sessionNumber', `Session ${index + 1}`)}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      aria-label={t('create.removeSession', 'Remove session')}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={control}
                      name={`sessions.${index}.title`}
                      render={({ field: f }) => (
                        <div>
                          <FormLabel>{t('fields.sessionTitle', 'Title')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('fields.sessionTitlePlaceholder', 'Session title')}
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`sessions.${index}.speaker`}
                      render={({ field: f }) => (
                        <div>
                          <FormLabel>{t('fields.speaker', 'Speaker')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('fields.speakerPlaceholder', 'Speaker name')}
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={control}
                      name={`sessions.${index}.startTime`}
                      render={({ field: f }) => (
                        <div>
                          <FormLabel>{t('fields.startTime', 'Start Time')}</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...f} />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`sessions.${index}.endTime`}
                      render={({ field: f }) => (
                        <div>
                          <FormLabel>{t('fields.endTime', 'End Time')}</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...f} />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`sessions.${index}.capacity`}
                      render={({ field: f }) => (
                        <div>
                          <FormLabel>{t('fields.sessionCapacity', 'Capacity')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="50"
                              {...f}
                              onChange={(e) => f.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ---- Submit ---- */}
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
            >
              {t('create.submit', 'Create Event')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
