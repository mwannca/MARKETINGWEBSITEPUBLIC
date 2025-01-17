import { Loader2Icon, XIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../../../../../types/types';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { fetchProductById, updateProduct } from '../actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ImageCarouselLogos from "./ImageCarouselLogos";

interface SideEditProductProps {
    isShow: boolean;
    setIsShow: Function;
    selectedProduct: string;
    brand: any; // Add this line to include the brand prop
}

export default function SideEditProduct({ isShow, setIsShow, selectedProduct, brand }: SideEditProductProps) {
    const [description, setDescription] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [images, setImages] = useState<Array<string>>([]);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const sidePanelRef = useRef<HTMLDivElement | null>(null);

    const handleAddImage = (newImage: string) => {
        setImages((prevImages) => [...prevImages, newImage]);
    };

    const fetchData = async () => {
        setLoading(true);
        const prod: Product | any = await fetchProductById(selectedProduct);
        if (!prod) {
            toast.error("Product not found");
            setLoading(false);
            return;
        }
        setDescription(prod.description);
        setTitle(prod.product_name);
        setPrice(prod.price);
        setImages(prod.images);
        setLoading(false);
    };

    const handleRemoveImage = (index: number) => {
        const array = [...images];
        array.splice(index, 1);
        setImages(array);
    };

    const handleSave = async () => {
        if (price && title && description) {
            setSaveLoading(true);
            try {
                await updateProduct(selectedProduct, price, title, images, description);
                toast.success('Save Successful');
                setIsShow(false);
            } catch (error) {
                console.error("Error saving product:", error);
                toast.error('Save failed. Please try again.');
            } finally {
                setSaveLoading(false);
            }
        } else {
            toast.error('Please fill out all required fields.');
        }
    };

    useEffect(() => {
        if (selectedProduct) {
            fetchData();
        }
    }, [selectedProduct]);

    // Handle closing the panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidePanelRef.current && !sidePanelRef.current.contains(event.target as Node)) {
                setIsShow(false);
            }
        };

        if (isShow) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isShow, setIsShow]);

    return (
        <div>
            {isShow && <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-10"></div>}
            <aside
                ref={sidePanelRef} // Attach the ref here
                className={`fixed inset-y-0 right-0 transform ${isShow ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out bg-zinc-900 shadow-2xl rounded-l-lg w-[500px] z-10`}>
                <div className="relative h-5/6 overflow-auto">
                    <div className="flex justify-between items-center">
                        <div className="m-7">
                            <h1 className="text-lg font-semibold">Product</h1>
                            <p className="text-xs text-gray-300">id: {selectedProduct}</p>
                        </div>
                        <button className="m-7" onClick={() => setIsShow(false)}>
                            <XIcon />
                        </button>
                    </div>
                    {!loading ? (
                        <div className="flex flex-col gap-5 mx-10">
                            <div>
                                <h1 className="text-sm mb-1 font-medium">Product Title</h1>
                                <Input
                                    disabled={saveLoading}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        setTitle(title + e.clipboardData.getData('text'));
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="text-sm mb-1 font-medium">Product Description</h1>
                                <Textarea
                                    disabled={saveLoading}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        setDescription(description + e.clipboardData.getData('text'));
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="text-sm mb-1 font-medium">Price</h1>
                                <Input
                                    disabled={saveLoading}
                                    className="w-[80px]"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        setPrice(price + e.clipboardData.getData('text'));
                                    }}
                                />
                            </div>
                            <h1 className="text-md mb-5 font-medium">Images</h1>
                            <div className="flex flex-col items-center">
                                <ImageCarouselLogos
                                    handleAddImage={handleAddImage}
                                    handleDelete={handleRemoveImage}
                                    images={images}
                                    brandId={selectedProduct} // Use selectedProduct as brandId
                                    brand={brand} // Pass the brand prop
                                />
                            </div>
                        </div>
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
                <div className="flex justify-between items-center" style={{ padding: "2em" }}>
                    <Button
                        disabled={saveLoading}
                        variant={'outline'}
                        className="h-[28px] text-xs bg-zinc-800 hover:bg-lime-400"
                        onClick={() => setIsShow(false)} // Close panel on cancel
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={saveLoading}
                        onClick={handleSave}
                        className="h-[28px] text-xs"
                    >
                        {saveLoading ? <Loader2Icon className="animate-spin" /> : 'Save'}
                    </Button>
                </div>
            </aside>
        </div>
    );
}