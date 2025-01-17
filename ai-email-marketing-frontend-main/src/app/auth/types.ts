// types/types.ts

// User Profile Interface
export interface UserProfile {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
    email: string;
    stripeCustomerId?: string; // Optional: Stripe Customer ID for subscriptions
    // Add other fields from the User model as necessary
}

// Payment Method Interface (based on Stripe's PaymentMethod object)
export interface PaymentMethod {
    id: string;
    type: string; // e.g., 'card'
    card?: {
        brand: string;         // e.g., 'Visa', 'MasterCard'
        last4: string;         // Last four digits of the card
        exp_month: number;     // Expiration month
        exp_year: number;      // Expiration year
        fingerprint?: string;  // Card fingerprint
        country?: string;      // Country of the card
        funding?: string;      // e.g., 'credit', 'debit'
    };
    billing_details?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
            line1?: string;
            line2?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
        };
    };
    created?: number; // Timestamp in seconds
    customer?: string; // Stripe Customer ID
    metadata?: { [key: string]: string }; // Any additional metadata
    // Add other fields as necessary
}

// Subscription Interface
export interface Subscription {
    id: string;
    userId: string;                // Corresponds to user_id in your Prisma schema
    stripeSubscriptionId?: string; // Optional
    status: string;                // Subscription status (active, canceled, etc.)
    currentPeriodEnd: Date;        // Date when the current period ends
    plan?: SubscriptionPlan;       // Associated subscription plan
    createdAt: Date;
    updatedAt: Date;
    productName: string;
    // Add other fields as necessary
}

// Subscription Plan Interface
export interface SubscriptionPlan {
    id: string;
    stripeProductId?: string;   // Optional: Stripe Product ID
    stripePriceId?: string;     // Optional: Stripe Price ID
    name: string;               // Subscription plan name
    description?: string;
    price: number;              // Price in cents
    createdAt: Date;
    updatedAt: Date;
    // Add other fields as necessary
}

export interface ProductWithPrices {
    priceId: string;
    productName: string;
    prices: Price[]; // This array must have the unit_amount property
    metadata: {
        brand_limit: string;
        credits: string;
        features: string;
    };
}


// Price Interface
export interface Price {
    id: string;
    unit_amount: number; // Price ID (could be Stripe Price ID)
    productId: string;         // Associated product ID
    unitAmount: number;        // Price amount in cents
    currency: string;          // Currency code, e.g., 'usd'
    recurring?: {
        interval: string;      // e.g., 'month', 'year'
        intervalCount: number; // e.g., 1
    };
    // Add other fields as necessary
}

// Brand Interface
export interface Brand {
    id: string;
    userId: string;            // Corresponds to user_id in your Prisma schema
    brandName: string;         // Corresponds to brand_name
    logos: string[];
    colors?: any;              // JSON field, adjust type as necessary
    fonts?: any;               // JSON field, adjust type as necessary
    brandUrl?: string;         // Corresponds to brand_url
    createdAt: Date;           // Corresponds to created_at
    // Add other fields as necessary
}

// Product Interface
export interface Product {
    id: string;
    brandId: string;           // Corresponds to brand_id
    price?: string;
    productUrl?: string;       // Corresponds to product_url
    productName?: string;      // Corresponds to product_name
    images: string[];
    description: string;
    createdAt: Date;           // Corresponds to created_at
    // Add other fields as necessary
}

// Editor Session Interface
export interface EditorSession {
    id: string;
    sessionName: string;       // Corresponds to session_name
    userId: string;            // Corresponds to user_id
    brandId?: string;          // Optional, corresponds to brand_id
    productId?: string;        // Optional, corresponds to product_id
    emailSaves: any[];         // JSON array, corresponds to email_saves
    previewImageSrc?: string;
    assets: string[];
    createdAt: Date;           // Corresponds to created_at
    // Add other fields as necessary
}

// Template Interface
export interface Template {
    id: string;
    template: string;
    category: string;
    createdAt: Date;           // Corresponds to created_at
    // Add other fields as necessary
}

// ESP Interface
export interface ESP {
    id: string;
    apiKey: string;            // Corresponds to api_key
    label: string;
    userId: string;            // Corresponds to user_id
    provider: string;
    createdAt: Date;           // Corresponds to created_at
    // Add other fields as necessary
}

// Klaviyo Template Interface
export interface KlaviyoTemplate {
    id: string;
    templateId: string;        // Corresponds to template_id
    userId: string;            // Corresponds to user_id
    createdAt: Date;           // Corresponds to created_at
    // Add other fields as necessary
}

// Klaviyo Campaign Interface
export interface KlaviyoCampaign {
    id: string;
    userId: string;            // Corresponds to user_id
    campaignId: string;        // Corresponds to campaign_id
    createdAt: Date;           // Corresponds to created_at
    // Add other fields as necessary
}
