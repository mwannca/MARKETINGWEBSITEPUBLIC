'use client'
import React, { FormEvent } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { StripeCardElement, StripeCardElementOptions } from '@stripe/stripe-js'

// Load the Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

const CheckoutForm: React.FC = () => {
    const stripe = useStripe()
    const elements = useElements()

    // Function to handle the form submission
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!stripe || !elements) {
            return // Stripe.js hasn't loaded yet
        }

        const cardElement = elements.getElement(CardElement)

        if (!cardElement) {
            return // Ensure card element is loaded
        }

        // Create a payment method using the card info
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement as StripeCardElement,
        })

        if (error) {
            console.error(error)
        } else {
            // Send the payment method id to the backend to create a payment intent
            const res = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
            })

            const paymentResult = await res.json()
            if (paymentResult.error) {
                console.error(paymentResult.error)
            } else {
                console.log('Payment Successful!', paymentResult)
            }
        }
    }

    // Custom options for CardElement
    const cardElementOptions: StripeCardElementOptions = {
        style: {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    }

    return (
        <form onSubmit={handleSubmit}>
        <CardElement options={cardElementOptions} />
    <button type="submit" disabled={!stripe}>
    Pay
    </button>
    </form>
)
}

// Wrap the form in Elements provider
const StripeCheckout: React.FC = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
            </Elements>
    )
}

export default StripeCheckout
