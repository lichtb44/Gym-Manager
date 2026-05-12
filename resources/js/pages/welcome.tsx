import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="GymFit - Premium Fitness Membership" />
            <div className="min-h-screen bg-white">
                <header className="sticky top-0 z-50 bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
                                        <span className="text-xl font-bold text-white">GF</span>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">GymFit</span>
                                </Link>
                                <nav className="hidden gap-8 md:flex">
                                    <a href="#membership" className="font-medium text-gray-700 hover:text-red-600">MEMBERSHIP</a>
                                    <a href="#why" className="font-medium text-gray-700 hover:text-red-600">WHY US</a>
                                </nav>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link href={dashboard()} className="inline-block rounded-md bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={login()} className="text-sm font-medium text-gray-700 hover:text-red-600">
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link href={register()} className="inline-block rounded-md bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                                Join Online
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
                    <div className="relative mx-auto max-w-7xl px-4 py-40 sm:px-6 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-red-400">BEST GYM MEMBERSHIP DEAL</p>
                            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl">GET UP TO 4 MONTHS FREE</h1>
                            <p className="mb-8 text-lg text-gray-100">Join us to enjoy unlimited access to our state-of-the-art gym facilities, 300+ group fitness classes, swimming pool, and more!</p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Link href={canRegister ? register() : login()} className="inline-block rounded-md bg-red-600 px-8 py-3 text-lg font-semibold text-white hover:bg-red-700">Get Offer Now</Link>
                                <Link href={login()} className="inline-block rounded-md border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-red-600">Learn More</Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="membership" className="bg-gray-50 py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Membership Plans</h2>
                            <p className="text-lg text-gray-600">Choose the perfect plan for your fitness journey</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
                                <h3 className="mb-2 text-2xl font-bold text-gray-900">Silver</h3>
                                <p className="mb-6 text-gray-600">Perfect for beginners</p>
                                <div className="mb-6"><span className="text-4xl font-bold text-gray-900">$29</span><span className="text-gray-600">/month</span></div>
                                <ul className="mb-8 space-y-3">
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Gym access</span></li>
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Standard equipment</span></li>
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Basic support</span></li>
                                </ul>
                                <Link href={canRegister ? register() : login()} className="block w-full rounded-md border-2 border-red-600 bg-white px-6 py-2 text-center font-semibold text-red-600 hover:bg-red-50">Get Started</Link>
                            </div>

                            <div className="relative rounded-lg border-2 border-red-600 bg-red-50 p-8 shadow-lg">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1 text-sm font-bold text-white">POPULAR</div>
                                <h3 className="mb-2 text-2xl font-bold text-gray-900">Gold</h3>
                                <p className="mb-6 text-gray-600">Most popular choice</p>
                                <div className="mb-6"><span className="text-4xl font-bold text-gray-900">$49</span><span className="text-gray-600">/month</span></div>
                                <ul className="mb-8 space-y-3">
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Unlimited gym access</span></li>
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">All group classes</span></li>
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Pool access</span></li>
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Priority support</span></li>
                                </ul>
                                <Link href={canRegister ? register() : login()} className="block w-full rounded-md bg-red-600 px-6 py-2 text-center font-semibold text-white hover:bg-red-700">Get Started</Link>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
                                <h3 className="mb-2 text-2xl font-bold text-gray-900">Platinum</h3>
                                <p className="mb-6 text-gray-600">Premium experience</p>
                                <div className="mb-6"><span className="text-4xl font-bold text-gray-900">$79</span><span className="text-gray-600">/month</span></div>
                                <ul className="mb-8 space-y-3">
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Everything in Gold</span></li>
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Personal training</span></li>
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">Nutrition coaching</span></li>
                                    <li className="flex items-center gap-2"><svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span className="text-gray-700">VIP lounge access</span></li>
                                </ul>
                                <Link href={canRegister ? register() : login()} className="block w-full rounded-md border-2 border-red-600 bg-white px-6 py-2 text-center font-semibold text-red-600 hover:bg-red-50">Get Started</Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="why" className="bg-white py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Why Choose GymFit?</h2>
                            <p className="text-lg text-gray-600">Everything you need for your fitness journey</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="rounded-lg bg-gray-50 p-8">
                                <h3 className="mb-2 text-xl font-bold text-gray-900">State-of-the-Art Equipment</h3>
                                <p className="text-gray-600">Latest fitness equipment and technology</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-8">
                                <h3 className="mb-2 text-xl font-bold text-gray-900">Expert Trainers</h3>
                                <p className="text-gray-600">Certified personal trainers ready to guide you</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-8">
                                <h3 className="mb-2 text-xl font-bold text-gray-900">300+ Group Classes</h3>
                                <p className="text-gray-600">Yoga, HIIT, dance, swimming and more</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-red-600 py-16">
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-4 text-4xl font-bold text-white">Ready to Transform Your Fitness?</h2>
                        <Link href={canRegister ? register() : login()} className="inline-block rounded-md bg-white px-8 py-3 text-lg font-semibold text-red-600 hover:bg-red-50">Get Started Today</Link>
                    </div>
                </section>

                <footer className="bg-gray-900 py-12">
                    <div className="mx-auto max-w-7xl px-4 text-center text-gray-400 sm:px-6 lg:px-8">
                        <p>&copy; 2026 GymFit. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
