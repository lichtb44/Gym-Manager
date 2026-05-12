import { Form, Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-slate-950">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="Enter your email"
                                        className="h-14 rounded-lg border-slate-200 pr-12 text-base"
                                    />
                                    <Mail className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-slate-400" />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-slate-950">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-violet-700 no-underline hover:text-violet-800"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="h-14 rounded-lg border-slate-200 text-base"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 text-sm text-slate-600">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 h-14 w-full rounded-lg bg-gradient-to-r from-violet-500 to-violet-700 text-base text-white shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-violet-800"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Sign In
                            </Button>

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm text-slate-400">
                                <span className="h-px bg-slate-200" />
                                <span>or</span>
                                <span className="h-px bg-slate-200" />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-14 rounded-lg border-slate-200 text-base text-slate-600"
                            >
                                <span className="mr-3 text-xl font-semibold text-blue-600">
                                    G
                                </span>
                                Sign in with Google
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-slate-500">
                                Don't have an account?{' '}
                                <TextLink
                                    href={register()}
                                    className="text-violet-700 no-underline hover:text-violet-800"
                                    tabIndex={5}
                                >
                                    Contact your admin
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Sign in to your account',
    description: 'Enter your credentials to access the dashboard',
};
