'use client'

import React, { useEffect, useState } from 'react'
import { Brand } from '../../../../../types/types'
import { FaPlus } from 'react-icons/fa'
import { fetchBrands, fetchSvgFromS3 } from '../actions';
import { toast } from 'sonner';
import CreateNewBrandModal from './createNewBrandModal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function Brands() {
    const [brands, setBrands] = useState<null | Array<Brand>>(null);
    const [isShow, setIsShow] = useState<boolean>(false);
    const [svgContent, setSvgContent] = useState<Record<number, string>>({}); // To store SVG content for each brand
    const router = useRouter();

    const fetchData = async () => {
        const response = await fetchBrands();
        if (response) {
            setBrands(response);
        } else {
            toast.error('There was an error fetching brands');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to check if the logo is an SVG URL
    const isSvgUrl = (url: string) => url.endsWith('.svg');

    // Helper to modify the SVG content to add width and height
    const modifySvgSize = (svgString: string): string => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Set or update width and height attributes to 100px
        svgElement.setAttribute('width', '100');
        svgElement.setAttribute('height', '100');

        return new XMLSerializer().serializeToString(svgDoc);
    };

    // useEffect to fetch SVG content for brands with SVG logos
    useEffect(() => {
        if (brands) {
            brands.forEach((brand, index) => {
                const logo = brand.logos[0]; // Assuming first logo is to be displayed
                if (isSvgUrl(logo) && !svgContent[index]) {
                    fetchSvgFromS3(logo).then((svgText) => {
                        if (svgText) {
                            const modifiedSvg = modifySvgSize(svgText); // Modify the SVG size
                            setSvgContent((prev) => ({
                                ...prev,
                                [index]: modifiedSvg
                            }));
                        }
                    });
                }
            });
        }
    }, [brands]); // This effect runs when `brands` is updated

    return (
        <div className=''>
            <div className='m-12'>
                <h1 className='text-3xl font-semibold'>Brands</h1>
                <div className='mt-4 mx-7 grid grid-cols-4'>
                    <div onClick={() => { setIsShow(true) }} className='w-[250px] h-[150px] bg-lime-400 rounded-xl cursor-pointer hover:bg-lime-500'>
                        <div className='flex justify-center h-[150px] items-center'>
                            <FaPlus className='h-[40px] w-[40px] fill-zinc-700' />
                        </div>
                    </div>

                    {brands?.map((brand, index) => {
                        const logo = brand.logos[0]; // Assuming you are only rendering the first logo

                        // If it's an SVG and the content is fetched, render the SVG content
                        if (isSvgUrl(logo)) {
                            if (svgContent[index]) {
                                return (
                                    <div style={{backgroundColor:'#111111'}} key={index} onClick={() => { router.push(`/dashboard/brands/brand?id=${brand.id}`) }} className='glass-container hover:opacity-45 cursor-pointer rounded-xl w-[250px] h-[150px]'>
                                        <div className='flex flex-col items-center'>
                                            <div dangerouslySetInnerHTML={{ __html: svgContent[index] }} />
                                            <h1 className='text-xl font-semibold'>{brand.brand_name}</h1>
                                        </div>
                                    </div>
                                );
                            }
                            // Display a loading skeleton while SVG content is being fetched
                            return (
                                <div key={index} className='glass-container rounded-xl w-[250px] h-[150px] flex justify-center items-center'>
                                    <Skeleton className='h-[100px] w-[100px]' />
                                </div>
                            );
                        }

                        // If it's not an SVG, render the image
                        return (
                            <div  style={{backgroundColor:'#111111'}} key={index} onClick={() => { router.push(`/dashboard/brands/brand?id=${brand.id}`) }} className='glass-container hover:opacity-45 cursor-pointer rounded-xl w-[250px] h-[150px]'>
                                <div style={{margin:'2em'}} className='flex flex-col items-center'>
                                    <Image alt={`logo ${index}`} src={logo} width={100} height={100} unoptimized />
                                    <h1 className='text-xl font-semibold m-7'>{brand.brand_name}</h1>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <CreateNewBrandModal isShow={isShow} setIsShow={(value: boolean) => { setIsShow(value) }} />
        </div>
    );
}
