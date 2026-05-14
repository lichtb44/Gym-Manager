import { Form, Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Plan {
    id: number;
    name: string;
    duration: string;
    price: number;
    description: string;
    status: string;
}

export default function MemberRegister({ plans }: { plans: Plan[] }) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        if (!selectedPlan) {
            e.preventDefault();
            alert('Please select a plan');
        }
    };

    return (
        <>
            <Head title="Join FitCore Gym" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-black/30" />

                <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center text-white">
                        <h1 className="mb-4 text-5xl font-bold tracking-tight">Join FitCore Gym</h1>
                        <p className="text-xl opacity-90">Select a membership plan and start your fitness journey today</p>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-3">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden transition ${selectedPlan?.id === plan.id ? 'ring-2 ring-indigo-600' : ''}`}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{plan.name}</span>
                                        <span className="text-sm font-normal text-slate-500">{plan.duration}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <div className="mb-4 text-3xl font-bold text-indigo-600">${plan.price}</div>
                                        <p className="mb-6 text-sm text-slate-600">{plan.description}</p>
                                    </div>
                                    <Button
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`w-full ${selectedPlan?.id === plan.id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                                    >
                                        {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {selectedPlan && (
                        <Card className="mt-12">
                            <CardHeader>
                                <CardTitle>Complete Your Registration</CardTitle>
                                <p className="mt-2 text-sm text-slate-600">
                                    Register as a new member with the {selectedPlan.name} plan
                                </p>
                            </CardHeader>
                            <CardContent>
                                <Form method="post" action="/join" onSubmit={handleRegister} className="space-y-6">
                                    <input type="hidden" name="plan_id" value={selectedPlan.id} />
                                    <input type="hidden" name="method" value="Credit Card" />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange('name')}
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange('email')}
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange('phone')}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <h3 className="mb-2 font-semibold text-slate-900">Order Summary</h3>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-600">Plan:</span>
                                            <span className="font-semibold text-slate-900">{selectedPlan.name}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-200 py-2 pt-4">
                                            <span className="font-semibold text-slate-900">Total:</span>
                                            <span className="text-lg font-bold text-indigo-600">
                                                ${selectedPlan.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => setSelectedPlan(null)}
                                        >
                                            Back to Plans
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                                            disabled={!selectedPlan}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Complete Registration
                                        </Button>
                                    </div>
                                </Form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
