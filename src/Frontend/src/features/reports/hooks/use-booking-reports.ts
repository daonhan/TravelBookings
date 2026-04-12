import { useQuery } from '@tanstack/react-query';
import { getBookingReports } from '@/shared/api';
import { reportKeys } from '@/shared/api/query-keys';

interface UseBookingReportsParams {
  page: number;
  pageSize: number;
}

export function useBookingReports({ page, pageSize }: UseBookingReportsParams) {
  return useQuery({
    queryKey: reportKeys.bookings({ page, pageSize }),
    queryFn: () => getBookingReports({ page, pageSize }),
    placeholderData: (previousData) => previousData,
  });
}
