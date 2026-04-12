import { useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/ui/input';
import { DatePicker } from '@/shared/ui/date-picker';
import { Button } from '@/shared/ui/button';
import type { CreateBookingInput } from '@/shared/validation/booking-schemas';

/* -------------------------------------------------------------------------- */
/*  PassengerFormRow                                                          */
/*  Single row in the dynamic passengers field array.                         */
/* -------------------------------------------------------------------------- */

interface PassengerFormRowProps {
  index: number;
  onRemove: () => void;
  showRemove: boolean;
}

export function PassengerFormRow({ index, onRemove, showRemove }: PassengerFormRowProps) {
  const { t } = useTranslation('bookings');
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateBookingInput>();

  const prefix = `passengers.${index}` as const;
  const fieldErrors = errors.passengers?.[index];

  return (
    <div className="relative grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Row header */}
      <div className="col-span-full flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {t('createBooking.passenger', { defaultValue: 'Passenger' })} {index + 1}
        </span>
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={t('createBooking.removePassenger', {
              defaultValue: `Remove passenger ${index + 1}`,
              index: index + 1,
            })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* First Name */}
      <Input
        label={t('createBooking.firstName', { defaultValue: 'First Name' })}
        placeholder="Jane"
        error={fieldErrors?.firstName?.message}
        {...register(`${prefix}.firstName`)}
      />

      {/* Last Name */}
      <Input
        label={t('createBooking.lastName', { defaultValue: 'Last Name' })}
        placeholder="Doe"
        error={fieldErrors?.lastName?.message}
        {...register(`${prefix}.lastName`)}
      />

      {/* Passport Number */}
      <Input
        label={t('createBooking.passportNumber', { defaultValue: 'Passport Number' })}
        placeholder="AB1234567"
        error={fieldErrors?.passportNumber?.message}
        {...register(`${prefix}.passportNumber`)}
      />

      {/* Date of Birth */}
      <DatePicker
        label={t('createBooking.dateOfBirth', { defaultValue: 'Date of Birth' })}
        value={watch(`${prefix}.dateOfBirth`) ?? ''}
        onChange={(val) => setValue(`${prefix}.dateOfBirth`, val, { shouldValidate: true })}
        error={fieldErrors?.dateOfBirth?.message}
      />
    </div>
  );
}
