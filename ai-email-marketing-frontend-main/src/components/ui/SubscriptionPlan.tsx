import React from "react";
import { Button } from "@headlessui/react";
import { AiOutlineDollarCircle, AiOutlineAppstore, AiOutlineMail, AiOutlineStar } from 'react-icons/ai';

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
                                                               product,
                                                               selectedProductId,
                                                               handleSelectSubscription,
                                                               currentSubscription,
                                                           }) => {
    const priceInCAD = (product.prices[0].unit_amount / 100).toFixed(2);

    const isFreePlan = product.productName.toLowerCase().includes("Free");
    const isCurrentPlan = currentSubscription === product.priceId;
    const isSelected = selectedProductId === product.priceId;

    const features = typeof product.metadata.features === 'string'
        ? product.metadata.features.split(", ")
        : ["No additional features"]; // Default message if no features

    return (
        <div
            key={product.priceId}
            style={{ margin: '10px' }} // Adding 10px space between cards
            className={`p-6 border rounded-xl shadow-lg bg-zinc-900 min-w-[300px] min-h-[350px] flex flex-col justify-between ${
                isCurrentPlan
                    ? "border-lime-400 bg-zinc-900" // Highlight current plan
                    : isSelected
                        ? "border-lime-400"
                        : "border-gray-700"
            }`}
        >
            <h3 className="text-lg font-semibold mb-2 flex items-center text-white">
                <AiOutlineStar className="text-lime-400 mr-2" /> {product.productName}
            </h3>
            <div className="text-sm text-zinc-400 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <AiOutlineDollarCircle className="mr-2 text-lime-400" />
                        Price:
                    </div>
                    <span className="font-medium text-lime-400">${priceInCAD} CAD</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <AiOutlineAppstore className="mr-2 text-lime-400" />
                        Brands:
                    </div>
                    <span className="font-medium text-lime-400">{product.metadata.brand_limit}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <AiOutlineMail className="mr-2 text-lime-400" />
                        A.I email Generation Credits:
                    </div>
                    <span className="font-medium text-lime-400">{product.metadata.credits}</span>
                </div>
                <div className="flex items-start">
                    <AiOutlineStar className="mr-2 text-lime-400" />
                    <div className="flex-1">
                        Features:
                        <span className="block font-medium text-lime-400">
              {features.map((feature, index) => (
                  <span key={index} className="block">
                  {feature}
                </span>
              ))}
            </span>
                    </div>
                </div>
            </div>
            <Button
                onClick={() => handleSelectSubscription(isSelected ? null : product.priceId)} // Toggle between select/unselect
                disabled={isCurrentPlan} // Prevent selection of the current plan
                className={`w-full py-2 px-4 rounded-xl ${
                    isCurrentPlan
                        ? "bg-lime-400 text-black cursor-not-allowed" // Disable button for current plan
                        : isSelected
                            ? "bg-lime-400 text-black"
                            : "bg-zinc-800 text-white hover:bg-lime-400 hover:text-black"
                }`}
            >
                {isCurrentPlan
                    ? "Current Plan"
                    : isSelected
                        ? "Unselect"
                        : "Subscribe"}
            </Button>
        </div>
    );
};

export default SubscriptionPlan;
