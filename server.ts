import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser with increased limit for base64 image uploads
  app.use(express.json({ limit: "25mb" }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      model: "gemini-flash-latest",
      time: new Date().toISOString()
    });
  });

  // AI Object Detection Endpoint
  app.post("/api/detect", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", confidenceThreshold = 0.25 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 payload" });
      }

      const client = getAIClient();
      if (!client) {
        return res.json({
          success: true,
          fallback: true,
          message: "Gemini API key is not configured. Switching to OpenCV Computer Vision Engine.",
          boxes: []
        });
      }

      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      const prompt = `You are a precision retail inventory scanner and shelf object detector.
Analyze this store shelf, beverage cooler, produce bin, or warehouse inventory image.
CRITICAL MANDATES:
1. ONLY DETECT OBJECTS ACTUALLY VISIBLE IN THE IMAGE. NEVER hallucinate, guess, or invent items! For example, if the image shows crates of apples and oranges, do NOT detect pears, bananas, or grapes. ONLY detect what is clearly visible.
2. DETECT EVERY INDIVIDUAL OBJECT: Put an individual 2D bounding box around EACH physical product unit present. Each separate can, bottle, cereal box, or individual fruit unit (each apple, each orange, etc.) must have its own tight bounding box enclosing that specific unit.
3. CLASSIFY DETECTED PRODUCTS INTO THEIR TRUE CATEGORY:
   - "soft drinks": Canned carbonated beverages, sodas, colas, flavored sparkling cans, energy sodas.
   - "juices": Bottled fruit juices, orange juice, smoothies, cold-pressed juices.
   - "water": Bottled water.
   - "cereal box": Breakfast cereal and oats boxes.
   - "apple": Fresh red or green apples in produce bins or crates.
   - "orange": Fresh oranges, mandarins, or citrus fruits in produce crates.
   - "banana": Fresh bananas or banana bunches (ONLY if bananas are actually present!).
   - "pear": Fresh pears (ONLY if pears are actually present!).
   - "grapes": Bunches of grapes (ONLY if grapes are actually present!).
   - "milk carton": Refrigerated milk cartons or dairy containers.
   - "canned goods": Canned beans, soups, or preserved foods.
4. Coordinates must be percentages (0-100) representing x, y, width, height.`;

      // Helper function to invoke Gemini with timeout
      async function callModel(modelName: string, timeoutMs: number) {
        const generatePromise = client!.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64
                  }
                },
                { text: prompt }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      width: { type: Type.NUMBER },
                      height: { type: Type.NUMBER }
                    },
                    required: ["label", "confidence", "x", "y", "width", "height"]
                  }
                }
              },
              required: ["items"]
            }
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini AI (${modelName}) detection timeout`)), timeoutMs)
        );

        return (await Promise.race([generatePromise, timeoutPromise])) as any;
      }

      let response: any = null;
      // Primary: gemini-3.1-flash-lite (rapid vision inference, high availability)
      try {
        response = await callModel("gemini-3.1-flash-lite", 25000);
      } catch (primaryErr: any) {
        console.warn("Primary AI detection model (gemini-3.1-flash-lite) unavailable or timed out, trying fallback model:", primaryErr?.message || primaryErr);
        try {
          response = await callModel("gemini-flash-latest", 15000);
        } catch (secondaryErr: any) {
          console.warn("Fallback AI detection model unavailable:", secondaryErr?.message || secondaryErr);
          return res.json({
            success: true,
            fallback: true,
            message: "AI cloud service experiencing peak demand. Seamlessly fallen back to local Computer Vision.",
            boxes: []
          });
        }
      }

      const responseText = response?.text || '{"items": []}';
      let parsed = { items: [] };
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = { items: [] };
      }

      // Map labels to user-requested retail standards
      const colorMap: Record<string, string> = {
        "soft drinks": "#10b981",
        "soft drink": "#10b981",
        "juices": "#0ea5e9",
        "juice": "#0ea5e9",
        "cereal box": "#f59e0b",
        "cereal": "#f59e0b",
        "apple": "#ef4444",
        "orange": "#f97316",
        "banana": "#eab308",
        "pear": "#84cc16",
        "grapes": "#a855f7",
        "grape bunch": "#a855f7",
        "milk carton": "#06b6d4",
        "milk": "#06b6d4",
        "canned goods": "#14b8a6"
      };

      const filtered = (parsed.items || [])
        .filter((item: any) => item.confidence >= confidenceThreshold)
        .map((item: any, idx: number) => {
          let rawLabel = item.label.toLowerCase().trim();
          if (rawLabel.includes("apple")) rawLabel = "apple";
          else if (rawLabel.includes("orange") || rawLabel.includes("citrus")) rawLabel = "orange";
          else if (rawLabel.includes("banana")) rawLabel = "banana";
          else if (rawLabel.includes("pear")) rawLabel = "pear";
          else if (rawLabel.includes("grape")) rawLabel = "grapes";
          else if (rawLabel === "can" || rawLabel === "cans" || rawLabel === "soda" || rawLabel === "soft drink") rawLabel = "soft drinks";
          else if (rawLabel === "bottle" || rawLabel === "bottles" || rawLabel === "smoothie" || rawLabel === "juice") rawLabel = "juices";
          else if (rawLabel === "box" || rawLabel === "cereal") rawLabel = "cereal box";
          else if (rawLabel === "milk" || rawLabel === "dairy" || rawLabel === "carton") rawLabel = "milk carton";
          else if (rawLabel.includes("canned") || rawLabel.includes("soup") || rawLabel.includes("bean")) rawLabel = "canned goods";

          let rawX = Number(item.x) || 0;
          let rawY = Number(item.y) || 0;
          let rawW = Number(item.width) || 5;
          let rawH = Number(item.height) || 5;

          // If coordinates are on a 0-1000 scale, normalize down to 0-100 percentage
          if (rawX > 100 || rawY > 100 || rawW > 100 || rawH > 100) {
            rawX = rawX / 10;
            rawY = rawY / 10;
            rawW = rawW / 10;
            rawH = rawH / 10;
          }

          const x = Math.max(0, Math.min(96, Math.round(rawX * 10) / 10));
          const y = Math.max(0, Math.min(96, Math.round(rawY * 10) / 10));
          const width = Math.max(2, Math.min(100 - x, Math.round(rawW * 10) / 10));
          const height = Math.max(2, Math.min(100 - y, Math.round(rawH * 10) / 10));

          return {
            id: `det-${Date.now()}-${idx}`,
            label: rawLabel,
            confidence: Number(item.confidence.toFixed(2)),
            x,
            y,
            width,
            height,
            color: colorMap[rawLabel] || "#10b981"
          };
        });

      // Group counts
      const counts: Record<string, number> = {};
      filtered.forEach((box: any) => {
        counts[box.label] = (counts[box.label] || 0) + 1;
      });

      return res.json({
        success: true,
        boxes: filtered,
        counts,
        totalItems: filtered.length
      });
    } catch (err: any) {
      console.warn("Notice in /api/detect (switching to local CV):", err?.message || err);
      return res.json({
        success: true,
        fallback: true,
        error: err?.message || "Switched to local computer vision",
        boxes: []
      });
    }
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
