import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import AddLogoModal from './addLogoModal';
import DeleteLogoModal from './deleteLogoModal';
import { Brand } from '../../../../../types/types';
import { updateBrands, uploadToS3 } from '../actions';
import "./logos.css"

interface Logos {
    images: string[];
    brandId: string;
    brand: Brand;
    handleAddImage: (newImage: string) => void;
    handleDelete: (index: number) => void;
}

export default function ImageCarouselLogos({ images, brandId, brand, handleAddImage, handleDelete }: Logos) {
    const [isShow, setShow] = useState<boolean>(false);
    const [isDeleteModalShow, setDeleteModalShow] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<null | number>(null);
    const [arrayOfLogos, setArrayOfLogos] = useState<string[]>([]);

    useEffect(() => {
        setArrayOfLogos(images);
    }, [images]);

    const handleDeleteImage = async (index: number) => {
        handleDelete(index);
        const updatedLogos = arrayOfLogos.filter((_, i) => i !== index);
        setArrayOfLogos(updatedLogos);
        await updateBrands(brand.id, brand.brand_name, brand.colors, brand.fonts, updatedLogos);
    };

    const handleAddNewImage = async (newImageUrl: string) => {
        handleAddImage(newImageUrl);
        const updatedLogos = [...arrayOfLogos, newImageUrl];
        setArrayOfLogos(updatedLogos);
        await updateBrands(brand.id, brand.brand_name, brand.colors, brand.fonts, updatedLogos);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            const imageUrl = await uploadToS3(formData);
            if (imageUrl) {
                console.log("Uploaded image URL:", imageUrl);
                handleAddNewImage(imageUrl);
            }
        }
    };

    return (
        <div>
            <div className='flex items-center justify-between'>
                <h1 className='text-lg font-md mt-3'>Logos</h1>
                <Button onClick={() => {
                    setShow(true);
                }} className='text-xs h-7'>
                    Add Logo<PlusIcon className='h-5 w-5'/>
                </Button>
            </div>
            <div className='logo-grid'>
                <div
                    className='logo-grid-item bg-zinc-700 flex justify-center items-center rounded-xl cursor-pointer hover:opacity-30'>
                    <label className='w-full h-full flex items-center justify-center'>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        <PlusIcon className='w-10 h-10 sm:w-16 sm:h-16'/>
                    </label>
                </div>
                {arrayOfLogos.map((logo, index) => (
                    <div
                        onClick={() => {
                            setSelectedImage(index);
                            setDeleteModalShow(true);
                        }}
                        className='logo-grid-item bg-zinc-700 border cursor-pointer hover:opacity-30 border-zinc-500 rounded-xl flex justify-center items-center'
                        key={index}>
                        <Image src={logo} alt={`logo ${index}`} width={200} height={200} objectFit="contain"/>
                    </div>
                ))}
            </div>
            <DeleteLogoModal deleteImage={(index: number) => {
                handleDeleteImage(index);
            }} isShow={isDeleteModalShow} imageIndex={selectedImage!} setShow={(value: boolean) => {
                setDeleteModalShow(value);
            }}/>
            <AddLogoModal addImage={handleAddImage} isShow={isShow} setShow={(value: boolean) => {
                setShow(value);
            }} brandId={brandId}/>
        </div>
    );
}
