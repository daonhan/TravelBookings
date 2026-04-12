/* =================================================================== */
/*  Design System -- Barrel Export                                      */
/*  Re-exports every public component from the shared/ui directory.     */
/* =================================================================== */

/* --- Primitives ---------------------------------------------------- */
export { Button } from './button';
export { Input } from './input';
export { Textarea } from './textarea';
export { Select } from './select';
export { Checkbox } from './checkbox';
export { Switch } from './switch';

/* --- Data Display -------------------------------------------------- */
export { Badge } from './badge';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

/* --- Feedback & Loading -------------------------------------------- */
export { Spinner } from './spinner';
export { Separator } from './separator';
export { Tooltip } from './tooltip';
export { ScrollArea } from './scroll-area';

/* --- Overlays ------------------------------------------------------ */
export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from './modal';

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
  useToast,
} from './toast';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './dropdown-menu';

export { ConfirmDialog } from './confirm-dialog';

/* --- Navigation & Layout ------------------------------------------- */
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Avatar } from './avatar';
export { Breadcrumb } from './breadcrumb';
export { PageHeader } from './page-header';

/* --- Skeleton / Placeholder ---------------------------------------- */
export { Skeleton, SkeletonTable } from './skeleton';

/* --- Patterns ------------------------------------------------------ */
export { EmptyState } from './empty-state';
export { DataTable } from './data-table';
export { DatePicker } from './date-picker';

/* --- Error Handling ------------------------------------------------ */
export { ErrorBoundary } from './error-boundary';
export { ServiceDegradedBanner } from './service-degraded-banner';

/* --- Forms --------------------------------------------------------- */
export {
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from './form-field';
