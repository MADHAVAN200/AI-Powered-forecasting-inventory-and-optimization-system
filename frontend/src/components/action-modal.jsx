"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Tag, Trash2, CheckCircle } from "lucide-react";
export function ActionModal({ product, actionType, onClose }) {
    const [selectedOption, setSelectedOption] = useState("");
    const [reason, setReason] = useState("");
    const [customAction, setCustomAction] = useState(false);
    const getActionConfig = () => {
        switch (actionType) {
            case "transfer":
                return {
                    title: "Transfer Product",
                    icon: <Truck className="w-5 h-5 text-blue-600"/>,
                    color: "bg-blue-50",
                    suggestions: [
                        {
                            id: "store-002",
                            title: "Transfer to Store #002 (Pune)",
                            description: "High demand area, 15% markup potential",
                            recommended: true,
                        },
                        {
                            id: "store-003",
                            title: "Transfer to Store #003 (Austin)",
                            description: "Medium demand, standard pricing",
                            recommended: false,
                        },
                    ],
                };
            case "flash-sale":
                return {
                    title: "Create Flash Sale",
                    icon: <Tag className="w-5 h-5 text-green-600"/>,
                    color: "bg-green-50",
                    suggestions: [
                        {
                            id: "online-30",
                            title: "Online Flash Sale - 30% Off",
                            description: "Recommended for 72% freshness score",
                            recommended: true,
                        },
                        {
                            id: "store-40",
                            title: "In-Store Flash Sale - 40% Off",
                            description: "Higher discount for immediate sale",
                            recommended: false,
                        },
                    ],
                };
            case "remove":
                return {
                    title: "Remove Product",
                    icon: <Trash2 className="w-5 h-5 text-red-600"/>,
                    color: "bg-red-50",
                    suggestions: [
                        {
                            id: "donate",
                            title: "Donate to Food Bank",
                            description: "Still safe for consumption, tax benefit",
                            recommended: true,
                        },
                        {
                            id: "compost",
                            title: "Send to Composting",
                            description: "Sustainable disposal option",
                            recommended: false,
                        },
                    ],
                };
            default:
                return {
                    title: "Product Action",
                    icon: <CheckCircle className="w-5 h-5"/>,
                    color: "bg-gray-50",
                    suggestions: [],
                };
        }
    };
    const config = getActionConfig();
    const handleConfirm = () => {
        // Here you would implement the actual action
        console.log("Action confirmed:", {
            product: product.id,
            action: actionType,
            option: selectedOption,
            reason,
            customAction,
        });
        onClose();
    };
    return (<Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {config.icon}
            <span>{config.title}</span>
          </DialogTitle>
          <DialogDescription>
            Taking action on <strong>{product.name}</strong> (Freshness: {product.freshness}%)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <Card className={config.color}>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Location:</span>
                  <div className="font-medium">{product.location}</div>
                </div>
                <div>
                  <span className="text-gray-600">Shelf Life:</span>
                  <div className="font-medium">{product.shelfLife}</div>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <div className="font-medium">{product.quantity}</div>
                </div>
                <div>
                  <span className="text-gray-600">Risk Level:</span>
                  <Badge className={product.risk === "low"
            ? "bg-green-100 text-green-800"
            : product.risk === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"}>
                    {product.risk}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600"/>
              AI Recommendations
            </h3>
            {config.suggestions.map((suggestion) => (<Card key={suggestion.id} className={`cursor-pointer transition-all ${selectedOption === suggestion.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-sm"}`} onClick={() => setSelectedOption(suggestion.id)}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        {suggestion.recommended && (<Badge variant="outline" className="text-green-600 border-green-600">
                            Recommended
                          </Badge>)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                    <div className="ml-4">
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedOption === suggestion.id ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>))}
          </div>

          {/* Custom Action Toggle */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="custom-action" checked={customAction} onChange={(e) => setCustomAction(e.target.checked)} className="rounded"/>
            <label htmlFor="custom-action" className="text-sm text-gray-700">
              Override AI recommendation with custom action
            </label>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Reason for Action <span className="text-red-500">*</span>
            </label>
            <Textarea placeholder="e.g., Freshness dropping rapidly, no sales in 3 days, customer complaints..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-20"/>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedOption || !reason.trim()} className="flex-1">
              Confirm Action
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);
}
