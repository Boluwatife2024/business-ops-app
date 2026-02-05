'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface TopBarProps {
    title: string
}

export function TopBar({ title }: TopBarProps) {
    const { data: session } = useSession()

    const getInitials = (name?: string | null, email?: string) => {
        if (name) {
            return name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return email?.charAt(0).toUpperCase() || 'U'
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <div className="flex h-16 items-center justify-between border-b bg-white px-6">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                            <AvatarFallback className="bg-blue-600 text-white">
                                {getInitials(session?.user?.name, session?.user?.email)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{session?.user?.email}</p>
                            <p className="text-xs text-gray-400">{session?.user?.businessName}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
