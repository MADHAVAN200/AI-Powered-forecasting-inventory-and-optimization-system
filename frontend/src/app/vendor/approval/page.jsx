"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, DollarSign, Package, Leaf, MapPin, MessageSquare, BarChart3 } from "lucide-react";
export default function VendorApprovalPage() {
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const pendingSubmissions = [
        {
            id: "sub-003",
            vendor: "Green Valley Farms",
            product: "Organic Carrots",
            type: "vegetables",
            harvestDate: "2025-01-12",
            shelfLife: "14 days",
            quantity: "136 kg",
            location: "Maharashtra",
            certifications: ["Organic", "Non-GMO"],
            aiScore: 92,
            suggestedPrice: 205,
            images: 3,
            submittedDate: "2025-01-13",
            vendorRating: 4.8,
        },
        {
            id: "sub-004",
            vendor: "Ocean Fresh Seafood",
            product: "Wild Caught Cod",
            type: "seafood",
            harvestDate: "2025-01-13",
            shelfLife: "3 days",
            quantity: "68 kg",
            location: "Kerala",
            certifications: ["Wild Caught", "Sustainable"],
            aiScore: 88,
            suggestedPrice: 1045,
            images: 5,
            submittedDate: "2025-01-13",
            vendorRating: 4.6,
        },
        {
            id: "sub-005",
            vendor: "Sunrise Dairy Co.",
            product: "Artisan Cheese",
            type: "dairy",
            harvestDate: "2025-01-10",
            shelfLife: "21 days",
            quantity: "36 kg",
            location: "Punjab",
            certifications: ["Grass-Fed", "Artisan"],
            aiScore: 85,
            suggestedPrice: 649,
            images: 4,
            submittedDate: "2025-01-12",
            vendorRating: 4.9,
        },
    ];
    const handleApproval = (submissionId, action, reason) => {
        console.log("Action:", action, "Submission:", submissionId, "Reason:", reason);
        // Here you would implement the actual approval/rejection logic
    };
    const getScoreColor = (score) => {
        if (score >= 90)
            return "text-green-600 bg-green-50";
        if (score >= 80)
            return "text-blue-600 bg-blue-50";
        if (score >= 70)
            return "text-yellow-600 bg-yellow-50";
        return "text-red-600 bg-red-50";
    };
    return (<div className="min-h-screen bg-gray-50 pt-16">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Approval Panel</h1>
          <p className="text-gray-600">Review and approve vendor product submissions</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Recently Approved</TabsTrigger>
            <TabsTrigger value="analytics">Vendor Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingSubmissions.map((submission) => (<Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{submission.product}</CardTitle>
                        <p className="text-sm text-gray-600">by {submission.vendor}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1"/>
                            {submission.submittedDate}
                          </Badge>
                          <Badge className={getScoreColor(submission.aiScore)}>AI Score: {submission.aiScore}%</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₹{submission.suggestedPrice}</div>
                        <div className="text-xs text-gray-500">per kg</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Harvest Date:</span>
                        <div className="font-medium">{submission.harvestDate}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Shelf Life:</span>
                        <div className="font-medium">{submission.shelfLife}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <div className="font-medium">{submission.quantity}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <div className="font-medium flex items-center">
                          <MapPin className="w-3 h-3 mr-1"/>
                          {submission.location}
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <span className="text-sm text-gray-600">Certifications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {submission.certifications.map((cert, index) => (<Badge key={index} variant="outline" className="text-xs">
                            <Leaf className="w-3 h-3 mr-1"/>
                            {cert}
                          </Badge>))}
                      </div>
                    </div>

                    {/* Vendor Rating */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700">Vendor Rating</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-blue-800">{submission.vendorRating}</span>
                        <span className="text-sm text-blue-600">/5.0</span>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-green-600"/>
                        <span className="text-sm font-medium text-green-800">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-green-700">
                        High quality product with excellent freshness potential. Recommended for immediate store
                        distribution.
                      </p>
                    </div>

                    {/* Price Adjustment */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Adjust Price (optional)</label>
                      <div className="flex items-center space-x-2">
                        <Input type="number" step="0.01" defaultValue={submission.suggestedPrice} className="flex-1"/>
                        <span className="text-sm text-gray-500">per kg</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApproval(submission.id, "approve")}>
                        <CheckCircle className="w-4 h-4 mr-2"/>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-600 hover:bg-red-50 bg-transparent" onClick={() => handleApproval(submission.id, "reject")}>
                        <XCircle className="w-4 h-4 mr-2"/>
                        Reject
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2"/>
                        Request Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recently Approved Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
            {
                id: "sub-001",
                vendor: "Fresh Fields Farm",
                product: "Organic Tomatoes",
                approvedPrice: 252,
                quantity: "227 kg",
                approvedDate: "2025-01-11",
                destination: "Flash Sale",
            },
            {
                id: "sub-002",
                vendor: "Pacific Catch",
                product: "Fresh Salmon",
                approvedPrice: 864,
                quantity: "45 kg",
                approvedDate: "2025-01-10",
                destination: "Store Distribution",
            },
        ].map((item) => (<div key={item.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.product}</h4>
                        <p className="text-sm text-gray-600">
                          {item.vendor} • {item.quantity} • Approved: {item.approvedDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{item.approvedPrice}/kg</div>
                        <div className="text-sm text-gray-600">{item.destination}</div>
                      </div>
                    </div>))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approval Rate</p>
                      <p className="text-2xl font-bold">94%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600"/>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Processing Time</p>
                      <p className="text-2xl font-bold">2.3h</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600"/>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Revenue Generated</p>
                      <p className="text-2xl font-bold">₹32.5L</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600"/>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Vendors</p>
                      <p className="text-2xl font-bold">127</p>
                    </div>
                    <Package className="w-8 h-8 text-purple-600"/>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
            { name: "Green Valley Farms", rating: 4.9, submissions: 45, revenue: "₹9.0L" },
            { name: "Ocean Fresh Seafood", rating: 4.8, submissions: 32, revenue: "₹13.1L" },
            { name: "Sunrise Dairy Co.", rating: 4.7, submissions: 28, revenue: "₹6.4L" },
        ].map((vendor, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-gray-600">
                            {vendor.submissions} submissions • Rating: {vendor.rating}/5
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{vendor.revenue}</div>
                        </div>
                      </div>))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
            { category: "Vegetables", count: 45, percentage: 35 },
            { category: "Seafood", count: 32, percentage: 25 },
            { category: "Dairy", count: 28, percentage: 22 },
            { category: "Meat", count: 23, percentage: 18 },
        ].map((item, index) => (<div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-gray-600">{item.count} submissions</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}
