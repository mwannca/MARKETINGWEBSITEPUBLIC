    // actions.ts
    'use server';

    import { cookies } from 'next/headers';
    import * as Console from 'node:console';
    import {jwtDecode} from "jwt-decode";
    import {toast} from "sonner";

    // Fetch user details
    export async function fetchUserDetails() {
        const token = cookies().get('Token')?.value;

        if (!token) {
            throw new Error('Authorization token is missing');
        }

        const response = await fetch(`${process.env.BACKEND_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        return response.json();
    }
    // Fetch user profile


    export async function fetchUserProfile() {

        // Use js-cookie to get the token from client-side cookies
        const token = cookies().get('Token')?.value; // Ensure this matches the cookie name set by your backend;

        if (!token) {
            throw new Error('Authorization token is missing');
        }

        // Decode the JWT token to extract the user ID
        try {
            const decodedToken = jwtDecode(token);

            const userId = decodedToken.sub;

            if (!userId) {
                throw new Error('User ID not found in token');
            }

            // Make the API call using the token, not the userId in the URL
            const response = await fetch(`${process.env.BACKEND_URL}/users/getUser`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch user profile');
            }

            const data = await response.json();
            return data; // Adjust based on your backend response structure
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }


    // Update user profile
    export async function updateUserProfile(userDetails: any) {
        const token = cookies().get('Token')?.value;

        if (!token) {
            throw new Error('Authorization token is missing');
        }

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/auth/update`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userDetails),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user profile');
            }

            const data = await response.json();
            return data; // Adjust based on your backend response structure
        } catch (error) {
            Console.error('Error updating user profile:', error);
            throw error;
        }
    }

    // Get products with prices
    export async function getProductsWithPrices() {
        // If the endpoint doesn't require authentication, you can omit the token
        const token = cookies().get('Token')?.value;

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/stripe/products`, {
                method: 'GET',
                headers: token ? {
                    'Authorization': `Bearer ${token}`,
                } : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch products with prices');
            }

            const data = await response.json();
            return data.products; // Adjust based on your backend response structure
        } catch (error) {
            Console.error('Error fetching products with prices:', error);
            throw error;
        }
    }


    // Sign in an existing user
    export async function logIn(email : string, password : string) {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/auth/signin`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email: email, password: password})
            });
            const parsedRes = await response.json();
            if (!response.ok) return {error: parsedRes.message};
            const setCookieHeader = response.headers.get('Set-Cookie');
            if (setCookieHeader) {
                const token = setCookieHeader.split(';')[0].split('=')[1];
                cookies().set({
                    name: 'Token',
                    value: token,
                    secure: true,
                    httpOnly: true,
                })
            }

            return {redirect: '/dashboard'}

        } catch (error) {
            console.log(error)
        }
    }
    // Sign up a new user
    export async function signUp(firstName: string, lastName: string, email: string, password: string, phoneNumber: string, address: string) {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password, phoneNumber, address}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to sign up');
            }

            // If the backend sets a token cookie upon signup
            const setCookieHeader = response.headers.get('Set-Cookie');
            if (setCookieHeader) {
                const token = setCookieHeader.split(';')[0].split('=')[1];
                cookies().set({
                    name: 'Token',
                    value: token,
                    secure: true,
                    httpOnly: true,
                });
            }

            return data;
        } catch (error) {
            Console.error('Error during sign up:', error);
            throw error;
        }
    }

    // Update user details
    export async function updateUserDetails(userDetails: any) {
        const token = cookies().get('Token')?.value;

        if (!token) {
            throw new Error('Authorization token is missing');
        }

        const response = await fetch(`${process.env.BACKEND_URL}/users/update`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userDetails),
        });

        if (!response.ok) {
            throw new Error('Failed to update user details');
        }

        return response.json();
    }

    // Fetch payment methods
    export async function fetchPaymentMethods(userId: string) {
        const token = cookies().get('Token')?.value;

        if (!token) {
            throw new Error('Authorization token is missing');
        }

        const response = await fetch(`${process.env.BACKEND_URL}/stripe/payment-methods?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        // if (!response.ok) {
        //     throw new Error('Failed to fetch payment methods'+ response.status);
        // }

        return response.json();
    }

    // Add a new payment method
    export async function addPaymentMethod(stripeCustomerId: string, paymentMethodId: string) {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/stripe/paymentMethods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ stripeCustomerId, paymentMethodId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add payment method');
            }

            const data = await response.json();
            return data; // Adjust based on your backend response structure
        } catch (error) {
            console.error('Error adding payment method:', error);
            throw error;
        }
    }


    // Delete an existing payment method
    export async function deletePaymentMethod(paymentMethodId: string) {
        const token = cookies().get('Token')?.value;

        if (!token) {
            throw new Error('Authorization token is missing');
        }

        const response = await fetch(`${process.env.BACKEND_URL}/stripe/payment-methods/${paymentMethodId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete payment method');
        }

        return response.json();
    }


    // Create a Stripe customer
    // Create a Stripe customer
    export async function createStripeCustomer(email: string) {
        const token = cookies().get('Token')?.value;

        if (!token) {
            throw new Error('Authorization token is missing');
        }

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/stripe/create-customer`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Failed to create Stripe customer: ${errorMessage}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating Stripe customer:', error);
            throw error;
        }
    }


    // Create a payment method
    export async function createPaymentMethod(paymentMethodDetails: { stripeCustomerId: string; paymentMethodId: string }) {
        try {
            // Make the request to the backend to add a payment method to the customer
            const response = await fetch(`${process.env.BACKEND_URL}/stripe/paymentMethods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentMethodDetails),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create payment method');
            }

            return response.json();
        } catch (error) {
            console.error('Error adding payment method:', error);
            throw error;
        }
    }


    // Log out the user
    export async function logOut() {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/auth/signout`, {
                method: 'POST',
                credentials: 'include', // Ensures cookies are included in the request
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to log out');
            }

            // Clear the token from cookies
            cookies().delete('Token');

        } catch (error) {
            Console.error('Error during log out:', error);
            throw error;
        }
    }

    // Get a specific cookie
    export async function getCookie(name: string) {
        const cookieValue = cookies().get(name)?.value;
        if (!cookieValue) {
            Console.error(`Cookie with name "${name}" not found`);
        }
        return cookieValue || null;
    }

    // Fetch subscription plans
    export async function fetchCurrentPlan() {
        try {
            const token = cookies().get('Token')?.value;
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${process.env.BACKEND_URL}/stripe/subscriptions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            //
            // if (!response.ok) {
            //     throw new Error(`Failed to fetch subscription plans: ${response.statusText}`);
            // }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            throw error;
        }
    }



    // Create a subscription
    export async function createSubscription(stripeCustomerId: string, priceId: string, paymentMethodId: string) {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/stripe/createSubscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ stripeCustomerId, priceId, paymentMethodId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create subscription');
            }

            const data = await response.json();
            return data.subscription; // Adjust based on your backend response structure
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }


