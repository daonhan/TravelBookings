import { Search, Menu } from 'lucide-react';
import { useAuth } from '@/shared/auth';
import { useUIStore } from '@/shared/stores';
import { Avatar } from '@/shared/ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/ui';
import { LogOut, User } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { NotificationDropdown } from './notification-dropdown';

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/*  Fixed application header bar (h-16, z-50)                                 */
/* -------------------------------------------------------------------------- */

export function Header() {
  const { user, logout } = useAuth();
  const { toggleSidebar, openGlobalSearch } = useUIStore();

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-gray-200 bg-white px-4',
      )}
    >
      {/* Left: Menu toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            Px
          </div>
          <span className="hidden text-lg font-semibold text-gray-900 sm:inline">
            TravelBookings
          </span>
        </div>
      </div>

      {/* Center: Global search trigger */}
      <div className="mx-4 flex flex-1 justify-center">
        <button
          type="button"
          onClick={openGlobalSearch}
          className={cn(
            'flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500',
            'transition-colors hover:border-gray-300 hover:bg-gray-100',
          )}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-400 sm:inline">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Notification bell + User avatar dropdown */}
      <div className="flex items-center gap-2">
        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label="User menu"
            >
              <Avatar name={user?.displayName ?? 'User'} size="sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900">
                  {user?.displayName ?? 'User'}
                </p>
                <p className="text-xs leading-none text-gray-500">
                  {user?.email ?? ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => {
                // Navigate to profile/settings if needed
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onSelect={() => void logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
