    'use client'
    import { useRouter } from 'next/navigation';
    import React, { useEffect, useState } from 'react';
    import InputMask from 'react-input-mask';
    import './signup.css';
    import {
        signUp,
        createStripeCustomer,
        createPaymentMethod,
        createSubscription,
        getProductsWithPrices,
    } from '../actions';
    import { toast } from 'sonner';
    import AddressForm from "@/components/ui/AddressForm";
    import AuthInput from './auth-input';
    import { Button } from '@/components/ui/button';
    import { loadStripe } from '@stripe/stripe-js';
    import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
    import SubscriptionPlan from "@/components/ui/SubscriptionPlan";

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

    function SignupForm() {
        const [isDisable, setIsDisable] = useState<boolean>(true);
        const [firstName, setFirstName] = useState<null | string>(null);
        const [lastName, setLastName] = useState<null | string>(null);
        const [email, setEmail] = useState<null | string>(null);
        const [password, setPassword] = useState<null | string>(null);
        const [confirmPassword, setConfirmPassword] = useState<null | string>(null);
        const [selectedProductId, setSelectedProductId] = useState<'' | string>('');
        const [phoneNumber, setPhoneNumber] = useState<string>('');
        const [Address, setAddress] = useState<null | string>(null);
        const [products, setProducts] = useState<any[]>([]);
        const [userAgreementChecked, setUserAgreementChecked] = useState(false);
        const [refundPolicyChecked, setRefundPolicyChecked] = useState(false);
        const router = useRouter();

        const stripe = useStripe();
        const elements = useElements();

        useEffect(() => {
            if (firstName && lastName && email && password && confirmPassword && selectedProductId && userAgreementChecked && refundPolicyChecked) {
                setIsDisable(false);
            } else {
                setIsDisable(true);
            }
        }, [firstName, lastName, email, password, confirmPassword, selectedProductId, userAgreementChecked, refundPolicyChecked]);

        useEffect(() => {
            const fetchPlans = async () => {
                try {
                    const data = await getProductsWithPrices();
                    if (data) {
                        setProducts(data);
                    }
                } catch (error) {
                    console.error('Error fetching subscription plans:', error);
                    toast.error('Failed to fetch subscription plans');
                }
            };

            fetchPlans();
        }, []);

        const handleSelectSubscription = (priceId: string) => {
            setSelectedProductId(priceId);
        };

        const handleAddressSelect = (place: any) => {
            setAddress(place.formatted_address);
        };

        const handleSubmit = async () => {
            if (password !== confirmPassword) {
                toast.error('Passwords must match');
                return;
            }

            if (!stripe || !elements) {
                toast.error('Stripe has not loaded properly. Please try again.');
                return;
            }

            if (!firstName || !lastName || !email || !password || !phoneNumber || !Address) {
                toast.error('All fields are required');
                return;
            }

            const response = await signUp(firstName, lastName, email, password, phoneNumber, Address);
            const stripeCustomerId = response.stripeCustomerId;
            if (!stripeCustomerId || response?.error) {
                toast.error(response?.error || 'Error signing up');
                return;
            }

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                toast.error('Please enter your card information.');
                return;
            }

            try {
                const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                });

                if (paymentError || !paymentMethod) {
                    toast.error(paymentError?.message || 'Failed to create payment method');
                    return;
                }

                await createPaymentMethod({
                    stripeCustomerId,
                    paymentMethodId: paymentMethod.id,
                });

                const subscriptionResponse = await createSubscription(
                    stripeCustomerId,
                    selectedProductId,
                    paymentMethod.id,
                );

                if (subscriptionResponse?.error) {
                    toast.error(subscriptionResponse.error);
                } else {
                    toast.success('Subscription created successfully');
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error during signup process:', error);
                toast.error('An error occurred during signup. Please try again.');
            }
        };

        return (
            <div style={{minWidth:'80em', marginTop:'5em'}} className="border border-zinc-700 rounded-xl bg-zinc-900 p-6 max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-lime-400">Sign Up</h1>
                    <p className="text-gray-400 text-sm mt-1">Sign up to continue to Mail Spark AI</p>
                </div>
                <div className="flex flex-col gap-3">
                    <AuthInput type="text" placeholder="First Name" name="First Name" onChange={(e) => setFirstName(e.target.value)} />
                    <AuthInput type="text" placeholder="Last Name" name="Last Name/ Surname" onChange={(e) => setLastName(e.target.value)} />
                    <AuthInput type="email" placeholder="Email" name="Email" onChange={(e) => setEmail(e.target.value)} />
                    <AuthInput type="password" placeholder="Password" name="Password" onChange={(e) => setPassword(e.target.value)} />
                    <AuthInput type="password" placeholder="Confirm Password" name="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
                    <AuthInput type="tel" placeholder="Phone Number" name="Phone number" onChange={(e) => setPhoneNumber(e.target.value)} />
                    <AddressForm onPlaceSelected={handleAddressSelect} />
                    <div className="text-white mt-2">Selected Address: {Address}</div>

                    {/* Subscription plan section */}
                    <section className="my-8">
                        <h2 className="text-2xl font-semibold text-lime-400 mb-4">Available Subscription Plans</h2>
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product, index) => (
                                    <SubscriptionPlan
                                        key={product.priceId || index}
                                        product={product}
                                        selectedProductId={selectedProductId}
                                        handleSelectSubscription={handleSelectSubscription}
                                        currentSubscription=""
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No subscription plans available.</p>
                        )}
                    </section>

                    {/* Card input for Stripe payment */}
                    <div className="mt-4 text-white">Enter your Payment Information:</div>
                    <CardElement className="mt-4 border p-2 rounded bg-zinc-800" options={{
                        style: {
                            base: {color: '#ffffff', '::placeholder': {color: '#ffffff'}},
                            invalid: {color: '#ff6961'},
                        },
                    }} />

                    {/* User Agreement and Refund Policy checkboxes */}
                    <div className="mt-4">
                        <label className="flex items-center text-white">
                            <input
                                type="checkbox"
                                checked={userAgreementChecked}
                                onChange={() => setUserAgreementChecked(!userAgreementChecked)}
                            />
                            <span className="ml-2 text-sm">
              I have read and agree to the{' '}
                                <a href="/MailSpark%20Terms%20Of%20Service.pdf" target="_blank" className="text-lime-400">
                User Agreement
              </a>.
            </span>
                        </label>
                        <label className="flex items-center mt-2 text-white">
                            <input
                                type="checkbox"
                                checked={refundPolicyChecked}
                                onChange={() => setRefundPolicyChecked(!refundPolicyChecked)}
                            />
                            <span className="ml-2 text-sm">
              I have read and agree to the{' '}
                                <a href="/MailSpark%20Refund%20Policy.pdf" target="_blank" className="text-lime-400">
                Refund Policy
              </a>.
            </span>
                        </label>
                    </div>

                    <Button disabled={isDisable} onClick={handleSubmit} className="w-full mt-6 bg-lime-400 text-black py-2 rounded hover:bg-lime-300 transition-all">
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    export default function Signup() {
        return (
            <Elements stripe={stripePromise}>
                <SignupForm />
            </Elements>
        );
    }
