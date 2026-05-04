import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Recycle, TreePine, Save } from "lucide-react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

const environmentalImpactSchema = z.object({
  totalItemsCollected: z.number().min(0, "Must be 0 or greater"),
  totalTonnesDiverted: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Must be a valid number 0 or greater"
  }),
  treesEquivalentSaved: z.number().min(0, "Must be 0 or greater"),
  yearlyTarget: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Must be a valid number greater than 0"
  }),
  currentProgress: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Must be a valid number 0 or greater"
  }),
  wasteBreakdown: z.object({
    fridgeCollected: z.number().min(0, "Must be 0 or greater"),
    tvElectronics: z.number().min(0, "Must be 0 or greater"),
    mixedWaste: z.number().min(0, "Must be 0 or greater"),
    woodMaterials: z.number().min(0, "Must be 0 or greater"),
    paperWaste: z.number().min(0, "Must be 0 or greater"),
    cardboard: z.number().min(0, "Must be 0 or greater"),
    ceramicRubble: z.number().min(0, "Must be 0 or greater"),
    textiles: z.number().min(0, "Must be 0 or greater"),
  })
});

type EnvironmentalImpactFormData = z.infer<typeof environmentalImpactSchema>;

interface EnvironmentalImpactData extends EnvironmentalImpactFormData {
  id: number;
  progressPercentage: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminEnvironmentalImpact() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: environmentalData, isLoading } = useQuery<EnvironmentalImpactData>({
    queryKey: ['/api/environmental-impact'],
  });

  const form = useForm<EnvironmentalImpactFormData>({
    resolver: zodResolver(environmentalImpactSchema),
    defaultValues: {
      totalItemsCollected: 0,
      totalTonnesDiverted: "0",
      treesEquivalentSaved: 0,
      yearlyTarget: "150",
      currentProgress: "0",
      wasteBreakdown: {
        fridgeCollected: 0,
        tvElectronics: 0,
        mixedWaste: 0,
        woodMaterials: 0,
        paperWaste: 0,
        cardboard: 0,
        ceramicRubble: 0,
        textiles: 0,
      }
    }
  });

  // Update form when data loads
  React.useEffect(() => {
    if (environmentalData) {
      form.reset({
        totalItemsCollected: environmentalData.totalItemsCollected,
        totalTonnesDiverted: environmentalData.totalTonnesDiverted,
        treesEquivalentSaved: environmentalData.treesEquivalentSaved,
        yearlyTarget: environmentalData.yearlyTarget,
        currentProgress: environmentalData.currentProgress,
        wasteBreakdown: environmentalData.wasteBreakdown
      });
    }
  }, [environmentalData, form]);

  const updateMutation = useMutation({
    mutationFn: (data: EnvironmentalImpactFormData) =>
      apiRequest('PUT', '/api/environmental-impact', data),
    onSuccess: () => {
      // Invalidate all queries that use environmental impact data
      queryClient.invalidateQueries({ queryKey: ['/api/environmental-impact'] });
      // Force refetch to ensure immediate updates across the site
      queryClient.refetchQueries({ queryKey: ['/api/environmental-impact'] });
      toast({
        title: "Success",
        description: "Environmental impact data updated successfully - homepage will update automatically",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update environmental impact data",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EnvironmentalImpactFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progressPercent = environmentalData ? parseFloat(environmentalData.progressPercentage) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Environmental Impact Management</h1>
        <p className="text-gray-600">Update waste collection statistics and environmental impact metrics</p>
      </div>

      {/* Current Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Items Collected</p>
                <p className="text-2xl font-bold text-gray-900">{environmentalData?.totalItemsCollected || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Recycle className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tonnes Diverted</p>
                <p className="text-2xl font-bold text-blue-600">{environmentalData?.totalTonnesDiverted || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TreePine className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trees Saved</p>
                <p className="text-2xl font-bold text-green-600">{environmentalData?.treesEquivalentSaved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracker */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Yearly Progress Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress to {environmentalData?.yearlyTarget || 150} tonnes</span>
              <span>{progressPercent.toFixed(1)}% of target</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {environmentalData?.currentProgress && environmentalData?.yearlyTarget ? 
              `${(parseFloat(environmentalData.yearlyTarget) - parseFloat(environmentalData.currentProgress)).toFixed(1)} tonnes remaining to reach target` :
              'Set your targets to track progress'
            }
          </p>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Metric */}
          <Card>
            <CardHeader>
              <CardTitle>Total Tonnes Diverted</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="totalTonnesDiverted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Tonnes Diverted</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Waste Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="wasteBreakdown.fridgeCollected"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fridges Collected (units)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wasteBreakdown.tvElectronics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TVs & Electronics (units)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wasteBreakdown.mixedWaste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mixed Waste (tonnes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wasteBreakdown.woodMaterials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wood Materials (tonnes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wasteBreakdown.paperWaste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paper Waste (tonnes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wasteBreakdown.cardboard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardboard (tonnes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wasteBreakdown.ceramicRubble"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ceramic & Rubble (tonnes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wasteBreakdown.textiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Textiles (tonnes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="min-w-[200px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}