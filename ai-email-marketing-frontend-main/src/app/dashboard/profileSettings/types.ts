interface SubscriptionPlanProps {
    product: {
        priceId: string;
        productName: string;
        prices: { unit_amount: number }[];
        metadata: {
            brand_limit: string;
            credits: string;
            features: string;
        };
    };
    selectedProductId: string | null;
    handleSelectSubscription: (priceId: string) => void;
    currentSubscription: string;
}