import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Video, Plus, Trash2, ExternalLink, Copy, CheckCircle, AlertCircle, RefreshCw, PlayCircle, StopCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { Helmet } from "react-helmet";
import { Alert, AlertDescription } from "@/components/ui/alert";

const streamFormSchema = z.object({
  name: z.string().min(1, "Stream name is required"),
  catalogId: z.string().optional(),
  recordingMode: z.enum(["automatic", "off"]).default("automatic"),
  deleteRecordingAfterDays: z.number().min(1).max(365).default(30),
});

type StreamFormValues = z.infer<typeof streamFormSchema>;

interface LiveStream {
  id: number;
  name: string;
  catalogId: string | null;
  catalogName: string | null;
  cloudflareUid: string;
  rtmpsUrl: string;
  streamKey: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
}

interface AuctionCatalog {
  id: string;
  name: string;
  status: string;
}

export default function LiveStreamsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const form = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      name: "",
      catalogId: "",
      recordingMode: "automatic",
      deleteRecordingAfterDays: 30,
    },
  });

  const { data: streams = [], isLoading } = useQuery<LiveStream[]>({
    queryKey: ["/api/live-streams"],
  });

  useEffect(() => {
    if (!streams || streams.length === 0) {
      console.log("⏸️ No streams to poll");
      return;
    }

    console.log(`🔄 Starting status polling for ${streams.length} stream(s)`);

    const checkAllStreamsStatus = async () => {
      console.log(`📡 Polling ${streams.length} stream(s) for status updates...`);
      for (const stream of streams) {
        if (!stream || !stream.id) {
          console.warn("⚠️ Skipping stream with invalid ID:", stream);
          continue;
        }
        try {
          await apiRequest("GET", `/api/live-streams/${stream.id}/status`);
        } catch (error) {
          console.error(`Failed to check status for stream ${stream.id}:`, error);
        }
      }
      await queryClient.refetchQueries({ 
        queryKey: ["/api/live-streams"],
        type: 'active'
      });
    };

    const intervalId = setInterval(checkAllStreamsStatus, 10000);

    return () => {
      console.log("🛑 Stopping status polling");
      clearInterval(intervalId);
    };
  }, [streams.length, streams.map(s => s?.id).join(',')]);

  const { data: catalogs = [] } = useQuery<AuctionCatalog[]>({
    queryKey: ["/api/admin/auction-catalogues"],
  });

  const { data: config } = useQuery({
    queryKey: ["/api/live-streams/check-config"],
  });

  const createStreamMutation = useMutation({
    mutationFn: async (data: StreamFormValues) => {
      const payload = {
        ...data,
        catalogId: data.catalogId && data.catalogId !== "none" ? data.catalogId : null,
      };
      return apiRequest("POST", "/api/live-streams", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-streams"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Live stream created successfully. Copy the OBS connection details below.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create stream",
        variant: "destructive",
      });
    },
  });

  const deleteStreamMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/live-streams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-streams"] });
      toast({
        title: "Success",
        description: "Live stream deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete stream",
        variant: "destructive",
      });
    },
  });

  const checkStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiRequest("GET", `/api/live-streams/${id}/status`);
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-streams"] });
      
      const statusMessage = data.status === "live" 
        ? `Stream is LIVE! 🎉` 
        : `Stream is offline. Cloudflare status: ${data.cloudflareStatus?.state || 'unknown'}`;
      
      toast({
        title: "Status Updated",
        description: statusMessage,
        variant: data.status === "live" ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to check status",
        description: error.message || "Could not reach Cloudflare",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StreamFormValues) => {
    createStreamMutation.mutate(data);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-green-500"><PlayCircle className="w-3 h-3 mr-1" /> Live</Badge>;
      case "offline":
        return <Badge variant="secondary"><StopCircle className="w-3 h-3 mr-1" /> Offline</Badge>;
      case "error":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeCatalogs = catalogs.filter((c: AuctionCatalog) => 
    c.status === "active" || c.status === "upcoming" || c.status === "scheduled"
  );

  return (
    <>
      <Helmet>
        <title>Live Streams - Admin | LANORA HOUSE</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <AdminNavigation />
        
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Live Stream Management</h1>
              <p className="text-slate-600 mt-1">Manage Cloudflare Stream integration for live auctions</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Live Stream
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Live Stream</DialogTitle>
                  <DialogDescription>
                    This will create a new live input in Cloudflare Stream. You'll receive OBS connection details after creation.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Saturday Auction Stream" {...field} data-testid="input-stream-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="catalogId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Associate with Auction Catalog (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-catalog">
                                <SelectValue placeholder="Select an auction catalog (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No catalog</SelectItem>
                              {activeCatalogs.map((catalog: AuctionCatalog) => (
                                <SelectItem key={catalog.id} value={catalog.id}>
                                  {catalog.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recordingMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recording Mode</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="automatic">Automatic (Record all streams)</SelectItem>
                              <SelectItem value="off">Off (Don't record)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deleteRecordingAfterDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delete Recordings After (Days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="365" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 justify-end pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createStreamMutation.isPending} data-testid="button-create-stream">
                        {createStreamMutation.isPending ? "Creating..." : "Create Stream"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {!config?.configured && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Cloudflare Stream is not configured. Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" />
              <p className="text-slate-600 mt-4">Loading streams...</p>
            </div>
          ) : streams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Video className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Live Streams</h3>
                <p className="text-slate-600 mb-4">Create your first live stream to get started with live auctions.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Live Stream
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {streams.map((stream) => (
                <Card key={stream.id} className="overflow-hidden">
                  <CardHeader className="bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{stream.name}</CardTitle>
                          {getStatusBadge(stream.status)}
                        </div>
                        {stream.catalogName && (
                          <CardDescription className="flex items-center gap-2">
                            <span>Auction Catalog: {stream.catalogName}</span>
                          </CardDescription>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-slate-600">
                          {stream.lastConnectedAt && (
                            <span>Last Connected: {new Date(stream.lastConnectedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkStatusMutation.mutate(stream.id)}
                          disabled={checkStatusMutation.isPending}
                          data-testid={`button-refresh-${stream.id}`}
                        >
                          <RefreshCw className={`w-4 h-4 ${checkStatusMutation.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStream(selectedStream?.id === stream.id ? null : stream)}
                          data-testid={`button-toggle-details-${stream.id}`}
                        >
                          {selectedStream?.id === stream.id ? "Hide Details" : "OBS Details"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this stream? This will also delete it from Cloudflare.")) {
                              deleteStreamMutation.mutate(stream.id);
                            }
                          }}
                          data-testid={`button-delete-${stream.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {selectedStream?.id === stream.id && (
                    <CardContent className="pt-6 space-y-4 bg-slate-50">
                      <Alert>
                        <Video className="h-4 w-4" />
                        <AlertDescription>
                          Use these credentials to configure OBS. Keep the Stream Key private!
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Server URL (RTMPS)</Label>
                          <div className="flex gap-2 mt-1">
                            <Input 
                              value={stream.rtmpsUrl} 
                              readOnly 
                              className="font-mono text-sm"
                              data-testid={`input-rtmps-url-${stream.id}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(stream.rtmpsUrl, "Server URL")}
                              data-testid={`button-copy-rtmps-${stream.id}`}
                            >
                              {copiedField === "Server URL" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700">Stream Key (Keep Secret!)</Label>
                          <div className="flex gap-2 mt-1">
                            <Input 
                              value={stream.streamKey} 
                              readOnly 
                              type="password"
                              className="font-mono text-sm"
                              data-testid={`input-stream-key-${stream.id}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(stream.streamKey, "Stream Key")}
                              data-testid={`button-copy-key-${stream.id}`}
                            >
                              {copiedField === "Stream Key" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border mt-4">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            OBS Setup Instructions
                          </h4>
                          <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                            <li>Open OBS Studio → Settings → Stream</li>
                            <li>Service: Select "Custom"</li>
                            <li>Server: Paste the Server URL above</li>
                            <li>Stream Key: Paste the Stream Key above</li>
                            <li>Click OK and then "Start Streaming"</li>
                          </ol>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <a 
                              href={`https://customer-m033z5x00ks6nunl.cloudflarestream.com/${stream.cloudflareUid}/iframe`}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid={`link-preview-${stream.id}`}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Preview in Cloudflare
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
