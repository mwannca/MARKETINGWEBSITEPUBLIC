/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    env: {
        BACKEND_URL: process.env.BACKEND_URL,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_S3_REGION: process.env.AWS_S3_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        JWT_SECRET:process.env.JWT_SECRET,
        NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    },
};

export default nextConfig;
