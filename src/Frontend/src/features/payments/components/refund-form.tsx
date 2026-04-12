import { useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button,
  Input,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/ui';
import { formatCurrency } from '@/shared/utils/currency';
import {
  refundPaymentSchema,
  type RefundPaymentInput,
} from '@/shared/validation/payment-schemas';
import { useRefundPayment } from '../hooks/use-refund-payment';

/* -------------------------------------------------------------------------- */
/*  RefundForm                                                                 */
/*  Modal dialog for submitting a refund on a payment.                         */
/* -------------------------------------------------------------------------- */

interface RefundFormProps {
  /** The payment to refund. */
  paymentId: string;
  /** Maximum refundable amount (used for validation). */
  maxAmount: number;
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback to control dialog open/close state. */
  onOpenChange: (open: boolean) => void;
}

export function RefundForm({
  paymentId,
  maxAmount,
  open,
  onOpenChange,
}: RefundFormProps) {
  const { t } = useTranslation('payments');
  const refundMutation = useRefundPayment(paymentId);

  // Build a refined schema that includes the max amount constraint
  const schema = refundPaymentSchema.refine(
    (data) => data.refundAmount <= maxAmount,
    {
      message: `Refund amount cannot exceed ${formatCurrency(maxAmount)}`,
      path: ['refundAmount'],
    },
  );

  const form = useForm<RefundPaymentInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      refundAmount: 0,
    },
  });

  const handleSubmit = useCallback(
    (values: RefundPaymentInput) => {
      refundMutation.mutate(
        { refundAmount: values.refundAmount },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    },
    [refundMutation, form, onOpenChange],
  );

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {t('refund.title', 'Refund Payment')}
          </ModalTitle>
          <ModalDescription>
            {t(
              'refund.description',
              'Enter the amount to refund. The maximum refundable amount is shown below.',
            )}
          </ModalDescription>
        </ModalHeader>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Info: max refundable */}
            <div className="rounded-md bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {t('refund.maxRefundable', 'Max refundable')}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(maxAmount)}
                </span>
              </div>
            </div>

            {/* Refund amount field */}
            <FormField
              name="refundAmount"
              control={form.control}
              render={({ field }) => (
                <div>
                  <FormLabel>
                    {t('refund.amountLabel', 'Refund Amount')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0.01}
                      max={maxAmount}
                      step={0.01}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            />

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={refundMutation.isPending}
              >
                {t('refund.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                loading={refundMutation.isPending}
              >
                {t('refund.submit', 'Submit Refund')}
              </Button>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
}
