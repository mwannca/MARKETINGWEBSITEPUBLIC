'use client';

import { useLoadScript, Autocomplete, Libraries } from '@react-google-maps/api'; // Import Library type
import React, { useRef } from 'react';
import {Library} from "@googlemaps/js-api-loader";

const libraries: Library[] = ['places']; // Explicitly type libraries as Library[]

const AddressForm: React.FC<{ onPlaceSelected: (place: google.maps.places.PlaceResult) => void }> = ({ onPlaceSelected }) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '', // Ensure the key is available
        libraries, // Correctly typed
    });

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    // Trigger the onPlaceSelected callback directly when a place is selected
    const onPlaceChanged = () => {
        const place = autocompleteRef.current?.getPlace();
        if (place) {
            onPlaceSelected(place);  // Directly call the passed function
        }
    };

    if (!isLoaded) {
        return <p>Loading Google Maps...</p>;
    }

    return (
        <div>
            <label htmlFor="address">Address</label>
            <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} // Store the autocomplete instance
                onPlaceChanged={onPlaceChanged} // Call the passed callback on place change
            >
                <input
                    id="address"
                    placeholder="Enter your address"
                    className="mt-1 block w-full border rounded-md p-2"
                    style={{
                        backgroundColor: '#fff',
                        color: '#000',
                        border: '1px solid #ccc',
                        padding: '10px',
                    }}
                />
            </Autocomplete>
        </div>
    );
};

export default AddressForm;
