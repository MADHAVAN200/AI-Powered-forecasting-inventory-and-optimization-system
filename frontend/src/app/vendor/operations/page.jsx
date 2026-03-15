"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Search, Filter, ArrowUpRight, ArrowDownRight, Minus, 
  ChevronRight, Calendar, Bell, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import VendorSidebar from '@/components/VendorSidebar';

// --- MOCK DATA ---
const PRODUCTS_DATA = [
  { id: "P-101", name: "Organic Hass Avocados", sku: "SKU-9928", category: "Produce", activeStores: 142, trend: "up", stockStatus: "Low", lastUpdated: "2h ago" },
  { id: "P-102", name: "Premium Almond Milk", sku: "SKU-1029", category: "Dairy Altern.", activeStores: 89, trend: "flat", stockStatus: "Healthy", lastUpdated: "5h ago" },
  { id: "P-103", name: "Artisan Sourdough", sku: "SKU-3321", category: "Bakery", activeStores: 56, trend: "down", stockStatus: "Excess", lastUpdated: "1d ago" },
  { id: "P-104", name: "Free-Range Eggs (12ct)", sku: "SKU-5512", category: "Dairy", activeStores: 200, trend: "up", stockStatus: "Healthy", lastUpdated: "30m ago" },
  { id: "P-105", name: "Fair Trade Coffee Beans", sku: "SKU-7734", category: "Pantry", activeStores: 312, trend: "up", stockStatus: "Healthy", lastUpdated: "1h ago" },
  { id: "P-106", name: "Organic Spinach", sku: "SKU-6621", category: "Produce", activeStores: 110, trend: "flat", stockStatus: "Low", lastUpdated: "4h ago" },
  { id: "P-107", name: "Cold Pressed Orange Juice", sku: "SKU-8822", category: "Beverage", activeStores: 45, trend: "down", stockStatus: "Healthy", lastUpdated: "6h ago" },
];

const INVENTORY_DATA = [
  { product: "Organic Hass Avocados", commitment: "5000 kg/week", fulfillment: "92%", adjustments: "None", nextDelivery: "Oct 24, 2025", status: "On-time" },
  { product: "Premium Almond Milk", commitment: "2000 units/week", fulfillment: "100%", adjustments: "+500 units", nextDelivery: "Oct 25, 2025", status: "Delayed" },
  { product: "Artisan Sourdough", commitment: "1000 loaves/day", fulfillment: "95%", adjustments: "-100 loaves", nextDelivery: "Oct 23, 2025", status: "Adjustment Requested" },
  { product: "Free-Range Eggs", commitment: "1500 cartons/week", fulfillment: "98%", adjustments: "None", nextDelivery: "Oct 26, 2025", status: "On-time" },
];

export default function VendorOperationsPage() {
  const renderTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />;
    return <Minus className="w-4 h-4 text-gray-400 mr-1" />;
  };

  const renderStockBadge = (status) => {
    const styles = {
      'Healthy': 'bg-green-900/20 text-green-400 border-green-800 hover:bg-green-900/30',
      'Low': 'bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/30',
      'Excess': 'bg-blue-900/20 text-blue-400 border-blue-800 hover:bg-blue-900/30'
    };
    return <Badge variant="outline" className={`${styles[status]} font-medium`}>{status}</Badge>;
  };

  return (
    <div className="flex bg-[#0a0a0a] text-foreground font-sans selection:bg-blue-500/30">
      <VendorSidebar />
      <main className="flex-1 p-8 overflow-y-auto h-screen w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Vendor Operations Dashboard</h1>
            <p className="text-gray-400 mt-2 text-sm max-w-2xl">
              Monitor your product footprint, aggregated sales trends, and inventory health across our network.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" className="relative bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white hover:bg-[#222]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1a1a1a]"></span>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] border-0">
              <Download className="w-4 h-4 mr-2" /> Export Data
            </Button>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111] border-[#333] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{PRODUCTS_DATA.length}</div>
              <p className="text-xs text-gray-400 mt-1">Across 4 categories</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-[#333] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stores Carrying</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">412</div>
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +15 this month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-[#333] shadow-sm ring-1 ring-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fulfillment Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">94.2%</div>
              <p className="text-xs text-amber-500 mt-1 font-medium bg-amber-900/20 inline-flex px-1.5 py-0.5 rounded border border-amber-900/50">
                Below 95% target
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-[#333] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Shelf Life</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">14 Days</div>
              <p className="text-xs text-blue-500 mt-1 font-medium bg-blue-900/20 inline-flex px-1.5 py-0.5 rounded border border-blue-900/50">
                Excellent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Product Performance</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input placeholder="Search products or SKUs..." className="pl-9 bg-[#1a1a1a] border-[#333] text-white focus-visible:ring-blue-500 focus-visible:ring-offset-0 placeholder:text-gray-500" />
            </div>
            <Button variant="outline" className="bg-[#1a1a1a] border-[#333] text-gray-300 hover:text-white hover:bg-[#222]">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>

          <Card className="bg-[#111] border-[#333] shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#222] bg-[#1a1a1a]/50 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-400">Product / SKU</TableHead>
                  <TableHead className="font-semibold text-gray-400">Category</TableHead>
                  <TableHead className="font-semibold text-gray-400 text-center">Active Stores</TableHead>
                  <TableHead className="font-semibold text-gray-400">Sales Trend</TableHead>
                  <TableHead className="font-semibold text-gray-400">Stock Status</TableHead>
                  <TableHead className="font-semibold text-gray-400 text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PRODUCTS_DATA.map((prod) => (
                  <TableRow key={prod.id} className="border-[#222] hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                    <TableCell>
                      <div className="font-bold text-white">{prod.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{prod.sku}</div>
                    </TableCell>
                    <TableCell className="text-gray-300">{prod.category}</TableCell>
                    <TableCell className="text-white font-medium text-center">{prod.activeStores}</TableCell>
                    <TableCell>
                      <div className="flex items-center capitalize text-gray-300 font-medium">
                        {renderTrendIcon(prod.trend)} {prod.trend}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderStockBadge(prod.stockStatus)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm text-right flex items-center justify-end h-full">
                      {prod.lastUpdated} <ChevronRight className="w-4 h-4 ml-2 text-gray-600" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Inventory Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Inventory & Supply Lines</h2>
          <Card className="bg-[#111] border-[#333] shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#222] bg-[#1a1a1a]/50 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-400">Product</TableHead>
                  <TableHead className="font-semibold text-gray-400">Supply Commitment</TableHead>
                  <TableHead className="font-semibold text-gray-400">Fulfillment Status</TableHead>
                  <TableHead className="font-semibold text-gray-400">Recent Adjustments</TableHead>
                  <TableHead className="font-semibold text-gray-400">Next Expected Delivery</TableHead>
                  <TableHead className="font-semibold text-gray-400 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVENTORY_DATA.map((inv, idx) => (
                  <TableRow key={idx} className="border-[#222] hover:bg-[#1a1a1a] transition-colors">
                    <TableCell className="font-bold text-white">{inv.product}</TableCell>
                    <TableCell className="text-gray-300">{inv.commitment}</TableCell>
                    <TableCell className="text-white font-medium">{inv.fulfillment}</TableCell>
                    <TableCell className="text-gray-300">{inv.adjustments}</TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500"/>
                        {inv.nextDelivery}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={`
                        ${inv.status === 'On-time' ? 'bg-green-900/20 text-green-400 border-green-800' : 
                          inv.status === 'Delayed' ? 'bg-red-900/20 text-red-400 border-red-800' : 
                          'bg-amber-900/20 text-amber-400 border-amber-800'} font-medium
                      `}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
