"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Thermometer, TrendingDown, TrendingUp, Shield, Truck, Tag, BarChart3, History } from "lucide-react";
export function ProductDetailModal({ product, onClose }) {
    const freshnessData = [
        { time: "6 AM", score: 95 },
        { time: "9 AM", score: 92 },
        { time: "12 PM", score: 88 },
        { time: "3 PM", score: 85 },
        { time: "6 PM", score: 82 },
        { time: "Now", score: product.freshness },
    ];
    const iotMetrics = [
        { label: "Temperature", value: product.temperature, status: "optimal", icon: Thermometer },
        { label: "Humidity", value: "65%", status: "optimal", icon: TrendingUp },
        { label: "Air Quality", value: "Good", status: "optimal", icon: Shield },
    ];
    const actions = [
        { time: "2 hours ago", action: "Temperature check", user: "System", status: "completed" },
        { time: "4 hours ago", action: "Location updated", user: "Staff #123", status: "completed" },
        { time: "6 hours ago", action: "Quality inspection", user: "Manager", status: "completed" },
    ];
    return (<Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            <Badge className={`${product.risk === "low"
            ? "bg-green-50 text-green-600"
            : product.risk === "medium"
                ? "bg-yellow-50 text-yellow-600"
                : "bg-red-50 text-red-600"}`}>
              {product.risk} risk
            </Badge>
          </DialogTitle>
          <DialogDescription>Detailed freshness analytics and IoT monitoring data</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="freshness">Freshness Graph</TabsTrigger>
            <TabsTrigger value="iot">IoT Metrics</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Freshness</span>
                    <span className="font-semibold text-xl">{product.freshness}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{product.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Temperature</span>
                    <span className="font-medium">{product.temperature}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shelf Life Remaining</span>
                    <span className="font-medium">{product.shelfLife}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Blockchain Status</span>
                    <Badge variant={product.blockchain === "verified" ? "default" : "secondary"}>
                      {product.blockchain}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Truck className="w-4 h-4 mr-2"/>
                    Transfer to Store #002 (High Demand)
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Tag className="w-4 h-4 mr-2"/>
                    Add to Flash Sale (30% off)
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <TrendingDown className="w-4 h-4 mr-2"/>
                    Mark for Clearance
                  </Button>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>AI Recommendation:</strong> Transfer to Store #002 within 6 hours for optimal revenue
                      recovery.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="freshness" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2"/>
                  Freshness Trend (Last 12 Hours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {freshnessData.map((point, index) => (<div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: `${(point.score / 100) * 200}px` }}></div>
                      <div className="text-xs mt-2 text-center">
                        <div className="font-medium">{point.score}%</div>
                        <div className="text-gray-500">{point.time}</div>
                      </div>
                    </div>))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Trend Analysis:</strong> Freshness declining at expected rate. Consider action within next 6
                    hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iot" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {iotMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (<Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{metric.label}</p>
                          <p className="text-xl font-semibold">{metric.value}</p>
                        </div>
                        <Icon className={`w-8 h-8 ${metric.status === "optimal" ? "text-green-500" : "text-red-500"}`}/>
                      </div>
                    </CardContent>
                  </Card>);
        })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2"/>
                  Recent Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {actions.map((action, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{action.action}</p>
                        <p className="text-sm text-gray-600">by {action.user}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{action.time}</p>
                        <Badge variant="outline" className="text-green-600">
                          {action.status}
                        </Badge>
                      </div>
                    </div>))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blockchain" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2"/>
                  Blockchain Freshness Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Harvest Verification</p>
                      <p className="text-sm text-green-600">Verified on blockchain</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Transport Conditions</p>
                      <p className="text-sm text-green-600">Temperature maintained 32-35°F</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Quality Inspection</p>
                      <p className="text-sm text-green-600">Passed all quality checks</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">Current Status Update</p>
                      <p className="text-sm text-yellow-600">Awaiting next verification</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Blockchain ID:</strong> 0x7f9a...3b2c
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Last Updated:</strong> 2 minutes ago
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>Take Action</Button>
        </div>
      </DialogContent>
    </Dialog>);
}
