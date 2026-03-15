"use client";

import React from 'react';
import { ShieldCheck, Target, CheckCircle2, AlertTriangle, FileText, Upload, Plus, FileSignature } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import VendorSidebar from '@/components/VendorSidebar';

const COMPLIANCE_DATA = [
  { id: "C-001", metric: "Quality Check Pass Rate", status: "Healthy", value: "98.5%", target: "98.0%" },
  { id: "C-002", metric: "Expiry Compliance", status: "Healthy", value: "99.2%", target: "99.0%" },
  { id: "C-003", metric: "Packaging Compliance", status: "Warning", value: "92.0%", target: "95.0%" },
  { id: "C-004", metric: "Certification Validity", status: "Healthy", value: "100%", target: "100%" },
];

const REQUIRED_DOCUMENTS = [
  { name: 'ISO 9001 Certification', validUntil: 'Dec 2025', status: 'Active', category: 'Operational' },
  { name: 'Organic Produce Certificate', validUntil: 'Nov 2025', status: 'Expiring Soon', category: 'Product Quality' },
  { name: 'Liability Insurance Policy', validUntil: 'Mar 2026', status: 'Active', category: 'Financial' },
  { name: 'Food Safety Audit (GFSI)', validUntil: 'Oct 2025', status: 'Active', category: 'Product Quality' },
  { name: 'Cold Chain Compliance Log', validUntil: 'Required Monthly', status: 'Missing', category: 'Logistics' },
];

export default function VendorQualityPage() {
  return (
    <div className="flex bg-[#0a0a0a] text-foreground font-sans selection:bg-blue-500/30">
      <VendorSidebar />
      <main className="flex-1 p-8 overflow-y-auto h-screen w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               <ShieldCheck className="w-8 h-8 text-green-500" /> Quality & Compliance Center
            </h1>
            <p className="text-gray-400 mt-2 text-sm max-w-2xl">
              Monitor your compliance metrics, track audit scores, and securely upload required operational documentation.
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm border-0 flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Submit Audit Data
          </Button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {COMPLIANCE_DATA.map((item) => (
            <Card key={item.id} className="bg-[#111] border-[#333] shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-400">{item.metric}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-bold text-white">{item.value}</span>
                  <span className="text-xs text-gray-500 mb-1 flex items-center">
                    <Target className="w-3 h-3 mr-1" /> {item.target}
                  </span>
                </div>
                <Progress 
                    value={parseFloat(item.value)} 
                    className="h-2 bg-[#222]" 
                    indicatorClassName={item.status === 'Healthy' ? 'bg-green-500' : 'bg-amber-500'} 
                />
                <div className="mt-4">
                  {item.status === 'Healthy' ? (
                    <span className="inline-flex items-center text-xs font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-900/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-900/50">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Action Required
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quality Incidents & Document Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-[#111] border-[#333] shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-[#222]">
              <div className="flex justify-between items-center">
                <div>
                   <CardTitle className="text-lg font-bold text-white">Required Documents & Certificates</CardTitle>
                   <CardDescription className="text-gray-400">Upload and manage certifications required to maintain active vendor status.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="bg-[#1a1a1a] border-[#333] text-gray-300 hover:text-white hover:bg-[#222]">
                  <Upload className="w-4 h-4 mr-2" /> Upload New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#222]">
                {REQUIRED_DOCUMENTS.map((doc, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-[#1a1a1a]/50 transition-colors">
                    <div className="flex items-start mb-4 sm:mb-0">
                      <div className="w-12 h-12 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-sm flex items-center justify-center mr-4">
                        <FileSignature className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-base">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-[#222] text-gray-400 border-none px-2 py-0 text-xs">
                            {doc.category}
                          </Badge>
                          <span className="text-xs text-gray-500">Valid until: {doc.validUntil}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 pl-16 sm:pl-0">
                      <Badge variant="outline" className={`
                        ${doc.status === 'Active' ? 'bg-green-900/20 text-green-400 border-green-800' : 
                          doc.status === 'Missing' ? 'bg-red-900/20 text-red-400 border-red-800' : 
                          'bg-amber-900/20 text-amber-400 border-amber-800'} font-medium
                      `}>
                        {doc.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#222]">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
             <Card className="bg-[#111] border-[#333] shadow-sm bg-blue-900/10 border-blue-900/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
               <CardHeader>
                  <CardTitle className="text-blue-400">Quality Score Trend</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-4xl font-black text-white mb-2">A+</div>
                  <p className="text-sm text-gray-400">Your quality score places you in the <strong className="text-blue-400">top 5%</strong> of vendors in your category.</p>
               </CardContent>
             </Card>

             <Card className="bg-[#111] border-[#333] shadow-sm">
              <CardHeader className="border-b border-[#222]">
                <CardTitle className="text-lg font-bold text-white">Recent Quality Action Item</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="p-4 rounded-lg bg-amber-900/10 border border-amber-900/40 text-amber-500 mb-3">
                    <div className="flex items-start gap-3">
                       <AlertTriangle className="w-5 h-5 mt-0.5" />
                       <div>
                         <h4 className="font-bold">Packaging Non-Compliance</h4>
                         <p className="text-sm mt-1 text-amber-500/80">Batch #9928 of Avocado packaging missing sustainability logo.</p>
                       </div>
                    </div>
                 </div>
                 <Button className="w-full bg-[#1a1a1a] border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white">Respond to Incident</Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  );
}
