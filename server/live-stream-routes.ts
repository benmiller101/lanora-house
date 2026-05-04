import express, { Request, Response } from "express";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  liveStreams,
  streamRecordings,
  LiveStream,
  InsertLiveStream,
  insertLiveStreamSchema,
  auctionCatalogues,
} from "../shared/schema";
import { requireAdmin } from "./middleware/security";

const router = express.Router();

interface CloudflareStreamResponse {
  success: boolean;
  result: {
    uid: string;
    rtmps: {
      url: string;
      streamKey: string;
    };
    srt?: {
      url: string;
      streamId: string;
    };
    webRTC?: {
      url: string;
    };
    meta?: {
      name: string;
    };
    created: string;
    modified: string;
    status?: {
      state: string;
    };
  };
  errors?: Array<{ code: number; message: string }>;
}

class CloudflareStreamService {
  private apiToken: string;
  private accountId: string;
  private baseUrl: string;

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
  }

  isConfigured(): boolean {
    return !!(this.apiToken && this.accountId);
  }

  private async makeRequest(
    endpoint: string,
    method: string = "GET",
    body?: any
  ): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error("Cloudflare Stream is not configured. Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Authorization": `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.errors?.[0]?.message || `Cloudflare API error: ${response.statusText}`
      );
    }

    return data;
  }

  async createLiveInput(name: string, options: {
    recordingMode?: string;
    deleteRecordingAfterDays?: number;
  } = {}): Promise<CloudflareStreamResponse> {
    const body = {
      meta: { name },
      recording: {
        mode: options.recordingMode || "automatic",
        timeoutSeconds: 10,
      },
      ...(options.deleteRecordingAfterDays && {
        deleteRecordingAfterDays: options.deleteRecordingAfterDays,
      }),
    };

    return this.makeRequest("/live_inputs", "POST", body);
  }

  async getLiveInput(uid: string): Promise<CloudflareStreamResponse> {
    return this.makeRequest(`/live_inputs/${uid}`, "GET");
  }

  async deleteLiveInput(uid: string): Promise<void> {
    await this.makeRequest(`/live_inputs/${uid}`, "DELETE");
  }

  async listLiveInputs(): Promise<{ result: any[] }> {
    return this.makeRequest("/live_inputs", "GET");
  }
}

const cloudflareService = new CloudflareStreamService();

router.get("/api/live-streams", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allStreams = await db.query.liveStreams.findMany({
      orderBy: [desc(liveStreams.createdAt)],
    });

    // Manually fetch catalog names for each stream
    const streamsWithCatalogs = await Promise.all(
      allStreams.map(async (stream) => {
        let catalogName = null;
        if (stream.catalogId) {
          const catalog = await db.query.auctionCatalogues.findFirst({
            where: eq(auctionCatalogues.id, stream.catalogId),
          });
          catalogName = catalog?.name || null;
        }
        return {
          ...stream,
          catalogName,
        };
      })
    );

    console.log("📡 Live streams response:", JSON.stringify(streamsWithCatalogs, null, 2));
    res.json(streamsWithCatalogs);
  } catch (error: any) {
    console.error("Error fetching live streams:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/live-streams/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const streamId = parseInt(req.params.id);
    const stream = await db.query.liveStreams.findFirst({
      where: eq(liveStreams.id, streamId),
    });

    if (!stream) {
      return res.status(404).json({ error: "Live stream not found" });
    }

    res.json(stream);
  } catch (error: any) {
    console.error("Error fetching live stream:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/auction-catalogs/:catalogId/live-stream", async (req: Request, res: Response) => {
  try {
    const catalogId = req.params.catalogId;
    
    const stream = await db.query.liveStreams.findFirst({
      where: and(
        eq(liveStreams.catalogId, catalogId),
        eq(liveStreams.isActive, true)
      ),
    });

    if (!stream) {
      return res.status(404).json({ error: "No active live stream found for this auction catalog" });
    }

    let currentStatus = stream.status;
    
    try {
      console.log(`🔍 [Public] Checking Cloudflare status for catalog ${catalogId}, stream ${stream.cloudflareUid}...`);
      const cloudflareStatus = await cloudflareService.getLiveInput(stream.cloudflareUid);
      const cloudflareState = cloudflareStatus.result.status?.current?.state || "unknown";
      const isLive = cloudflareState === "connected" || cloudflareState === "reconnected";
      const newStatus = isLive ? "live" : "offline";

      console.log(`📡 [Public] Cloudflare state: "${cloudflareState}" → DB status: ${stream.status} → New status: ${newStatus}`);

      if (stream.status !== newStatus) {
        const updateData: any = { status: newStatus };
        
        if (newStatus === "live") {
          updateData.lastConnectedAt = new Date();
          console.log(`✅ [Public] Stream went LIVE!`);
        } else {
          updateData.lastDisconnectedAt = new Date();
          console.log(`📴 [Public] Stream went OFFLINE`);
        }

        await db
          .update(liveStreams)
          .set(updateData)
          .where(eq(liveStreams.id, stream.id));
        
        currentStatus = newStatus;
      }
    } catch (statusError) {
      console.error("Error checking Cloudflare status (continuing with DB status):", statusError);
    }

    const publicStream = {
      id: stream.id,
      name: stream.name,
      cloudflareUid: stream.cloudflareUid,
      status: currentStatus,
      webrtcUrl: stream.webrtcUrl,
    };

    res.json(publicStream);
  } catch (error: any) {
    console.error("Error fetching auction catalog live stream:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/live-streams", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, catalogId, recordingMode, deleteRecordingAfterDays } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Stream name is required" });
    }

    if (catalogId) {
      const catalog = await db.query.auctionCatalogues.findFirst({
        where: eq(auctionCatalogues.id, catalogId),
      });

      if (!catalog) {
        return res.status(404).json({ error: "Auction catalog not found" });
      }

      const existingStream = await db.query.liveStreams.findFirst({
        where: and(
          eq(liveStreams.catalogId, catalogId),
          eq(liveStreams.isActive, true)
        ),
      });

      if (existingStream) {
        return res.status(400).json({ 
          error: "This auction catalog already has an active live stream" 
        });
      }
    }

    const cloudflareResponse = await cloudflareService.createLiveInput(name, {
      recordingMode,
      deleteRecordingAfterDays,
    });

    const streamData: any = {
      name,
      catalogId: catalogId || null,
      cloudflareUid: cloudflareResponse.result.uid,
      rtmpsUrl: cloudflareResponse.result.rtmps.url,
      streamKey: cloudflareResponse.result.rtmps.streamKey,
      srtUrl: cloudflareResponse.result.srt?.url || null,
      srtStreamId: cloudflareResponse.result.srt?.streamId || null,
      webrtcUrl: cloudflareResponse.result.webRTC?.url || null,
      recordingMode: recordingMode || "automatic",
      deleteRecordingAfterDays: deleteRecordingAfterDays || 30,
      metadata: cloudflareResponse.result,
    };

    const [newStream] = await db
      .insert(liveStreams)
      .values(streamData)
      .returning();

    res.status(201).json(newStream);
  } catch (error: any) {
    console.error("Error creating live stream:", error);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/live-streams/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const streamId = parseInt(req.params.id);
    const { status } = req.body;

    if (!["offline", "live", "error"].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be: offline, live, or error" 
      });
    }

    const updateData: any = { status };
    
    if (status === "live") {
      updateData.lastConnectedAt = new Date();
    } else if (status === "offline") {
      updateData.lastDisconnectedAt = new Date();
    }

    const [updatedStream] = await db
      .update(liveStreams)
      .set(updateData)
      .where(eq(liveStreams.id, streamId))
      .returning();

    if (!updatedStream) {
      return res.status(404).json({ error: "Live stream not found" });
    }

    res.json(updatedStream);
  } catch (error: any) {
    console.error("Error updating live stream status:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/live-streams/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const streamId = parseInt(req.params.id);
    
    if (isNaN(streamId)) {
      console.error("❌ Invalid stream ID:", req.params.id);
      return res.status(400).json({ error: "Invalid stream ID" });
    }
    
    const stream = await db.query.liveStreams.findFirst({
      where: eq(liveStreams.id, streamId),
    });

    if (!stream) {
      return res.status(404).json({ error: "Live stream not found" });
    }

    console.log(`🔍 Checking Cloudflare status for stream ${streamId} (${stream.cloudflareUid})...`);
    const cloudflareStatus = await cloudflareService.getLiveInput(stream.cloudflareUid);
    
    const cloudflareState = cloudflareStatus.result.status?.current?.state || "unknown";
    const isLive = cloudflareState === "connected" || cloudflareState === "reconnected";
    const newStatus = isLive ? "live" : "offline";

    console.log(`📡 Cloudflare state: "${cloudflareState}" → DB status: ${stream.status} → New status: ${newStatus}`);

    if (stream.status !== newStatus) {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "live") {
        updateData.lastConnectedAt = new Date();
        console.log(`✅ Stream ${streamId} went LIVE!`);
      } else {
        updateData.lastDisconnectedAt = new Date();
        console.log(`📴 Stream ${streamId} went OFFLINE`);
      }

      await db
        .update(liveStreams)
        .set(updateData)
        .where(eq(liveStreams.id, streamId));
    }

    res.json({
      id: stream.id,
      status: newStatus,
      cloudflareStatus: cloudflareStatus.result.status,
      lastConnectedAt: stream.lastConnectedAt,
      lastDisconnectedAt: stream.lastDisconnectedAt,
    });
  } catch (error: any) {
    console.error("Error checking live stream status:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/live-streams/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const streamId = parseInt(req.params.id);
    
    const stream = await db.query.liveStreams.findFirst({
      where: eq(liveStreams.id, streamId),
    });

    if (!stream) {
      return res.status(404).json({ error: "Live stream not found" });
    }

    try {
      await cloudflareService.deleteLiveInput(stream.cloudflareUid);
    } catch (error) {
      console.error("Error deleting from Cloudflare (continuing anyway):", error);
    }

    await db.delete(liveStreams).where(eq(liveStreams.id, streamId));

    res.json({ success: true, message: "Live stream deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting live stream:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/live-streams/check-config", requireAdmin, async (req: Request, res: Response) => {
  res.json({
    configured: cloudflareService.isConfigured(),
    message: cloudflareService.isConfigured() 
      ? "Cloudflare Stream is configured" 
      : "Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables"
  });
});

export default router;
