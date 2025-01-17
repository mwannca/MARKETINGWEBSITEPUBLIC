'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    fetchUserProfile,
    updateUserProfile,
    fetchPaymentMethods,
    deletePaymentMethod,
    addPaymentMethod,
    fetchCurrentPlan,
    getProductsWithPrices,
    createSubscription, createStripeCustomer, createPaymentMethod
} from '../../auth/actions'; // Adjust import paths as necessary
import { UserProfile, PaymentMethod, Subscription, ProductWithPrices } from '@/app/auth/types'; // Adjust import paths
import { ClipLoader } from 'react-spinners';
import { CardElement, useElements, useStripe, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './profileSettings.css';
import SubscriptionPlan from "@/components/ui/SubscriptionPlan";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

 function ProfileSettingsForm() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
     const [currentSubscriptions, setCurrentSubscriptions] = useState<string>('');
    const [products, setProducts] = useState<ProductWithPrices[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState<string>('');
    const [newFirstName, setNewFirstName] = useState<string>('');
    const [newLastName, setNewLastName] = useState<string>('');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
    const [showCardElement, setShowCardElement] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
     const getCurrentSubscriptionProduct = (products:any, currentSubscriptions:any) => {
         return products.find((product: { priceId: any; }) => product.priceId === currentSubscriptions);
     };
     const loadUserProfile = async () => {
         const profile = await fetchUserProfile();
         const user = profile.user;
         const methods = await fetchPaymentMethods(user.id);
         setUserProfile(user);
         try {

             if (user) {
                 setPaymentMethods(methods);

                 setNewEmail(user.email);
                 setNewFirstName(user.firstName || '');
                 setNewLastName(user.LastName || '');
             }
         } catch (error) {
             toast.error('Failed to load user profile');
         } finally {
             setLoading(false);
         }
     };
    useEffect(() => {


        loadUserProfile();
    }, []);
    useEffect(() => {
        const loadSubscriptions = async () => {
            try {
                const subs = await fetchCurrentPlan();
                setCurrentSubscriptions(subs.subscription.plan.id);
            } catch (error) {
                toast.error('Failed to load subscriptions');
            }
        };

        loadSubscriptions();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await getProductsWithPrices();
                setProducts(products);
            } catch (error) {
                toast.error('Failed to load products');
            }
        };

        loadProducts();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            await updateUserProfile({ email: newEmail, firstName: newFirstName, lastName: newLastName });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };
     const handleSelectPaymentMethod = (paymentMethodId: string) => {
         setSelectedPaymentMethodId(paymentMethodId);
     };

    const handleDeletePaymentMethod = async (paymentMethodId: string) => {
        try {
            await deletePaymentMethod(paymentMethodId);
            setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
            toast.success('Payment method deleted successfully');
        } catch (error) {
            toast.error('Failed to delete payment method');
        }
    };

    const handleSelectSubscription = (productId: string) => {
        setSelectedProductId(productId);
        setShowCardElement(true); // Only show one CardElement at a time
    };
     const handleSubscribe = async () => {
         if (!stripe || !elements) {
             toast.error('Stripe has not loaded properly. Please try again.');
             return;
         }

         try {
             let customerId = userProfile?.stripeCustomerId || '';

             if (!customerId) {
                 // Ensure userProfile email is not undefined
                 const userEmail = userProfile?.email;
                 if (!userEmail) {
                     toast.error('User email is required to create a Stripe customer.');
                     return;
                 }

                 // Create new Stripe customer if not already set
                 const createCustomerResponse = await createStripeCustomer(userEmail);
                 customerId = createCustomerResponse.customer.id;

                 // Update user profile with new Stripe customer ID
                 setUserProfile(prev => prev ? { ...prev, stripeCustomerId: customerId } : prev);
                 await updateUserProfile({ userProfile });

                 // Update local user profile state to reflect new customer ID
             }

             const cardElement = elements.getElement(CardElement);
             if (!cardElement) {
                 toast.error('Please enter your card details.');
                 return;
             }

             // Create a new payment method using the card element
             const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
                 type: 'card',
                 card: cardElement,
             });

             if (paymentError || !paymentMethod) {
                 toast.error(paymentError?.message || 'Failed to create payment method');
                 return;
             }

             // Attach the new payment method to the Stripe customer
             await createPaymentMethod({
                 stripeCustomerId: customerId,
                 paymentMethodId: paymentMethod.id,
             });

             // Proceed with subscription
             const subscriptionResponse = await createSubscription(
                 customerId,
                 selectedProductId!,
                 paymentMethod.id
             );

             if (subscriptionResponse?.error) {
                 toast.error(subscriptionResponse.error);
             } else {
                 toast.success('Subscription created successfully');
             }
         } catch (error) {
             console.error('Error during subscription process:', error);
             toast.error('An error occurred during subscription. Please try again.');
         }
     };
     return (
         <div className="profile-settings p-4 max-w-2xl mx-auto space-y-6">
             <h1 className="text-3xl font-bold text-center mb-6">Profile Settings</h1>

             <section className="my-0" style={{width:'900px'}}>
                 <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Subscription Plans</h2>
                 {products.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-16">
                         {products.map((product, index) => (
                             <SubscriptionPlan
                                 key={product.priceId || index}
                                 product={product}
                                 selectedProductId={selectedProductId}
                                 handleSelectSubscription={handleSelectSubscription}
                                 currentSubscription={currentSubscriptions} // Pass the current subscription
                             />

                         ))}
                     </div>
                 ) : (
                     <p className="text-gray-500">No subscription plans available.</p>
                 )}
             </section>

             <section>
                 <h2 className="text-xl font-semibold">Select Payment Method</h2>
                 {paymentMethods.length > 0 ? (
                     <div className="payment-methods-container">
                         {paymentMethods.map((method) => (
                             <div key={method.id} className="payment-method-card">
                                 <p>{`${method.card?.brand} ending in ${method.card?.last4}`}</p>
                                 <Button
                                     onClick={() => handleSelectPaymentMethod(method.id)}
                                     className={selectedPaymentMethodId === method.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                 >
                                     {selectedPaymentMethodId === method.id ? 'Selected' : 'Select'}
                                 </Button>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <p>No saved payment methods. Enter card details below.</p>
                 )}
                 {showCardElement && (
                     <div className="card-element-container mt-4">
                         <CardElement className="border p-2 rounded"/>
                     </div>
                 )}
                 <Button onClick={handleSubscribe} className="mt-4 submit-button">
                     Confirm Subscription
                 </Button>
             </section>
         </div>
     );
 }

export default function SubscriptionSettings() {
    return (
        <Elements stripe={stripePromise}>
            <ProfileSettingsForm/>
        </Elements>
    );
}
