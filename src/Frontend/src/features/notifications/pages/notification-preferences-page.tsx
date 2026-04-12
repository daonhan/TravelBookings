import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  Button,
  Input,
  Select,
  Switch,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Spinner,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/ui';
import {
  updatePreferencesSchema,
  type UpdatePreferencesInput,
} from '@/shared/validation';
import { useNotificationPreferences } from '@/features/notifications/hooks/use-notification-preferences';
import { useUpdatePreferences } from '@/features/notifications/hooks/use-update-preferences';
import type { NotificationChannel } from '@/shared/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CHANNEL_OPTIONS = [
  { value: 'Email', label: 'Email' },
  { value: 'Sms', label: 'SMS' },
  { value: 'Push', label: 'Push' },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export function NotificationPreferencesPage() {
  const { t } = useTranslation('notifications');
  const { data: prefs, isLoading: isLoadingPrefs } =
    useNotificationPreferences();
  const updateMutation = useUpdatePreferences();

  /* ----- Form setup ----- */
  const methods = useForm<UpdatePreferencesInput>({
    resolver: zodResolver(updatePreferencesSchema),
    defaultValues: {
      userId: '',
      preferredChannel: 'Email',
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: false,
      email: '',
      phoneNumber: '',
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isDirty },
  } = methods;

  /* Populate form when server data arrives */
  useEffect(() => {
    if (prefs) {
      reset({
        userId: prefs.userId,
        preferredChannel: prefs.preferredChannel as NotificationChannel,
        emailEnabled: prefs.emailEnabled,
        smsEnabled: prefs.smsEnabled,
        pushEnabled: prefs.pushEnabled,
        email: prefs.email ?? '',
        phoneNumber: prefs.phoneNumber ?? '',
      });
    }
  }, [prefs, reset]);

  const emailEnabled = watch('emailEnabled');
  const smsEnabled = watch('smsEnabled');

  /* ----- Submit ----- */
  const onSubmit = handleSubmit((values) => {
    const { userId: _userId, ...rest } = values;
    updateMutation.mutate(rest);
  });

  /* ----- Loading state ----- */
  if (isLoadingPrefs) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  /* ----- Render ----- */
  return (
    <div>
      <PageHeader
        title={t('preferences.title', 'Notification Preferences')}
        description={t(
          'preferences.description',
          'Choose how and when you receive notifications.',
        )}
      />

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
          {/* Preferred channel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('preferences.preferredChannel', 'Preferred Channel')}
              </CardTitle>
              <CardDescription>
                {t(
                  'preferences.preferredChannelDesc',
                  'Select the default channel for new notifications.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="preferredChannel"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <FormLabel>
                      {t('preferences.channel', 'Channel')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        options={CHANNEL_OPTIONS}
                        value={field.value}
                        onValueChange={field.onChange}
                        className="w-48"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* Email notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('preferences.emailNotifications', 'Email Notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="emailEnabled"
                render={({ field }) => (
                  <div>
                    <FormControl>
                      <Switch
                        label={t(
                          'preferences.enableEmail',
                          'Enable email notifications',
                        )}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                )}
              />

              {emailEnabled && (
                <FormField
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <FormLabel>
                        {t('preferences.emailAddress', 'Email address')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          error={fieldState.error?.message}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* SMS notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('preferences.smsNotifications', 'SMS Notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="smsEnabled"
                render={({ field }) => (
                  <div>
                    <FormControl>
                      <Switch
                        label={t(
                          'preferences.enableSms',
                          'Enable SMS notifications',
                        )}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                )}
              />

              {smsEnabled && (
                <FormField
                  control={control}
                  name="phoneNumber"
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <FormLabel>
                        {t('preferences.phoneNumber', 'Phone number')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          error={fieldState.error?.message}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Push notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('preferences.pushNotifications', 'Push Notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="pushEnabled"
                render={({ field }) => (
                  <div>
                    <FormControl>
                      <Switch
                        label={t(
                          'preferences.enablePush',
                          'Enable push notifications',
                        )}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <CardFooter className="justify-end px-0">
            <Button
              type="submit"
              loading={updateMutation.isPending}
              disabled={!isDirty}
            >
              {t('preferences.save', 'Save Preferences')}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </div>
  );
}
