'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { fetchBrandById, deleteBrand } from '../actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Products from './products';
import Logos from './logos';
import FontsColors from './fontsColors';
import { Brand as B } from '../../../../../types/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Brand() {
    const [brandName, setBrandName] = useState<null | string>(null);
    const [brand, setBrand] = useState<null | B>(null);
    const [loading, setLoading] = useState<boolean>(true); // New loading state
    const searchParams = useSearchParams();
    const brandId = searchParams.get('id') || "";
    const router = useRouter();

    const fetchData = async () => {
        if (brandId) {
            setLoading(true); // Set loading to true when fetching starts
            try {
                const response = await fetchBrandById(brandId);
                if (response) {
                    setBrandName(response.brand_name);
                    setBrand(response);
                    console.log("brandresponse", response.logos);
                }
            } catch (error) {
                console.error('Error fetching brand data:', error);
            } finally {
                setLoading(false); // Set loading to false once the fetching is done
            }
        }
    };

    const handleDelete = async () => {
        try {
            await deleteBrand(brandId);
            console.log('Brand deleted successfully');
            router.back();
        } catch (error) {
            console.error('Error deleting brand:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [brandId]);

    if (loading) {
        return <div>Loading...</div>; // Display a loading message or spinner
    }

    if (brandId && brand) {
        return (
            <div className=''>
                <div className=''>
                    <div  style={{background:'#111111', borderRadius:'2em'}} className='bg-zinc-800 border border-zinc-700 shadow-2xl ml-5 mr-20 rounded-xl'>
                        <div className='p-5'>
                            <div className='flex justify-between'>
                                <h1 className='text-3xl font-semibold'>{brandName}</h1>
                                <Button onClick={handleDelete} className='bg-red-600 text-white'>
                                    Delete Brand
                                </Button>
                            </div>
                            <Tabs defaultValue="products" className="w-full mt-4">
                                <TabsList className="grid w-[400px] grid-cols-3">
                                    <TabsTrigger value="products">Products</TabsTrigger>
                                    <TabsTrigger value="logos">Logos</TabsTrigger>
                                    <TabsTrigger value="fonts & colors">Fonts & Colors</TabsTrigger>
                                </TabsList>
                                <TabsContent value='products'>
                                    <Products brandId={brandId} />
                                </TabsContent>
                                <TabsContent value='logos'>
                                    <Logos logos={brand.logos} brand={brand} brandId={brandId} />
                                </TabsContent>
                                <TabsContent value='fonts & colors'>
                                    <FontsColors brand={brand} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <div>No brand data available</div>;
}
