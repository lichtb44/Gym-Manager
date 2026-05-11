import { Head, Link } from '@inertiajs/react';
import { Palette, ShieldCheck, UserRound } from 'lucide-react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';

const settingsItems = [
    {
        title: 'Profile',
        description: 'Update your name, email address, and phone number.',
        href: '/settings/profile',
        icon: UserRound,
    },
    {
        title: 'Security',
        description: 'Change your password and manage account security.',
        href: '/settings/security',
        icon: ShieldCheck,
    },
    {
        title: 'Appearance',
        description: 'Choose how the application looks on your device.',
        href: '/settings/appearance',
        icon: Palette,
    },
];

export default function SettingsIndex() {
    return (
        <>
            <Head title="Settings" />

            <h1 className="sr-only">Settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Settings"
                    description="Choose a settings area to manage your account"
                />

                <div className="grid gap-4">
                    {settingsItems.map((item) => (
                        <Link key={item.title} href={item.href}>
                            <Card className="rounded-lg border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50">
                                <CardContent className="flex items-center gap-4 pt-6">
                                    <div className="flex size-11 items-center justify-center rounded-lg bg-blue-600 text-white">
                                        <item.icon className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-950">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

SettingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Settings',
            href: '/settings',
        },
    ],
};
