/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup directories
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "merch.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf8");
}

// Global middleware
app.use(express.json());

// Initialize Gemini Client Lazily
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
    }
    genAI = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// Standard data reads and writes
function readMerchItems(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading merch.json:", error);
  }
  return [];
}

function writeMerchItems(items: any[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to merch.json:", error);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// GET all items
app.get("/api/merch", (req, res) => {
  const items = readMerchItems();
  res.json(items);
});

// POST new purchase item
app.post("/api/merch", (req, res) => {
  const items = readMerchItems();
  const newItem = {
    id: `item_${Date.now()}`,
    title: req.body.title || "Unknown Kaguya Merch",
    storeName: req.body.storeName || "Unknown Store",
    sourceUrl: req.body.sourceUrl || "",
    originalPrice: Number(req.body.originalPrice) || 0,
    originalCurrency: req.body.originalCurrency || "MYR",
    priceMyr: Number(req.body.priceMyr) || 0,
    imageUrl: req.body.imageUrl || "",
    description: req.body.description || "",
    category: req.body.category || "Other",
    purchaseDate: req.body.purchaseDate || new Date().toISOString().split("T")[0],
    status: req.body.status || "received",
    notes: req.body.notes || "",
    keyFeatures: req.body.keyFeatures || [],
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  writeMerchItems(items);
  res.status(201).json(newItem);
});

// PUT update purchase item
app.put("/api/merch/:id", (req, res) => {
  const { id } = req.params;
  const items = readMerchItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Merchandise item not found" });
  }

  const updatedItem = {
    ...items[index],
    title: req.body.title !== undefined ? req.body.title : items[index].title,
    storeName: req.body.storeName !== undefined ? req.body.storeName : items[index].storeName,
    sourceUrl: req.body.sourceUrl !== undefined ? req.body.sourceUrl : items[index].sourceUrl,
    originalPrice: req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : items[index].originalPrice,
    originalCurrency: req.body.originalCurrency !== undefined ? req.body.originalCurrency : items[index].originalCurrency,
    priceMyr: req.body.priceMyr !== undefined ? Number(req.body.priceMyr) : items[index].priceMyr,
    imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : items[index].imageUrl,
    description: req.body.description !== undefined ? req.body.description : items[index].description,
    category: req.body.category !== undefined ? req.body.category : items[index].category,
    purchaseDate: req.body.purchaseDate !== undefined ? req.body.purchaseDate : items[index].purchaseDate,
    status: req.body.status !== undefined ? req.body.status : items[index].status,
    notes: req.body.notes !== undefined ? req.body.notes : items[index].notes,
    keyFeatures: req.body.keyFeatures !== undefined ? req.body.keyFeatures : items[index].keyFeatures,
  };

  items[index] = updatedItem;
  writeMerchItems(items);
  res.json(updatedItem);
});

// DELETE purchase item
app.delete("/api/merch/:id", (req, res) => {
  const { id } = req.params;
  const items = readMerchItems();
  const filtered = items.filter((item) => item.id !== id);

  if (items.length === filtered.length) {
    return res.status(404).json({ error: "Merchandise item not found" });
  }

  writeMerchItems(filtered);
  res.json({ success: true, id });
});

// POST url analyzer using Gemini
app.post("/api/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is missing. Please add Your API key in Settings > Secrets.",
    });
  }

  console.log(`Analyzing merch URL: ${url}`);

  // 1. Fetch web page metadata if possible
  let rawPageText = "";
  let successfullyFetched = false;
  let pageMetadataDetails = "";
  let extractedImageCandidates: string[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const fetchRes = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      }
    });

    clearTimeout(timeoutId);

    if (fetchRes.ok) {
      const html = await fetchRes.text();
      
      // Determine the canonical base URL attributes for resolution
      let pageOrigin = "";
      let pageProtocol = "https:";
      try {
        const parsedUrl = new URL(url);
        pageOrigin = parsedUrl.origin;
        pageProtocol = parsedUrl.protocol;
      } catch (err) {}

      // Helper to sanitize and normalize candidate image URLs
      const cleanAndAddImage = (rawImgUrl: string) => {
        if (!rawImgUrl) return;
        let resolved = rawImgUrl.trim();
        
        // Decode HTML entities
        resolved = resolved
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"');
        
        if (resolved.startsWith("//")) {
          resolved = pageProtocol + resolved;
        } else if (resolved.startsWith("/")) {
          resolved = pageOrigin + resolved;
        } else if (!resolved.startsWith("http://") && !resolved.startsWith("https://") && !resolved.startsWith("data:")) {
          resolved = pageOrigin + "/" + resolved;
        }

        const low = resolved.toLowerCase();
        const hasImgExt = low.includes(".png") || low.includes(".jpg") || low.includes(".jpeg") || low.includes(".webp") || low.includes(".gif") || low.includes("img") || low.includes("image");
        const isSpammy = low.includes("logo") || low.includes("icon") || low.includes("avatar") || low.includes("banner") || low.includes("pixel") || low.includes("spacer") || low.includes("loading") || low.includes("button") || low.includes("sprite") || low.includes("theme") || low.includes("ads") || low.includes("track");
        
        if (hasImgExt && !isSpammy) {
          if (!extractedImageCandidates.includes(resolved)) {
            extractedImageCandidates.push(resolved);
          }
        }
      };

      // Simple tag matches for robust metadata harvesting
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const mDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || 
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
      
      const titleVal = titleMatch ? titleMatch[1].trim() : "";
      const descriptionVal = mDescMatch ? mDescMatch[1].trim() : "";
      
      if (titleVal || descriptionVal) {
        pageMetadataDetails = `Parsed Directly from HTML headers: Title: "${titleVal}" | description: "${descriptionVal}" \n`;
      }

      // Meta image tags extraction (og:image, twitter:image, image)
      const metaImgRegexes = [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/gi,
        /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/gi,
        /<img[^>]+src=["']([^"']+)["']/gi
      ];

      for (const rx of metaImgRegexes) {
        let match;
        while ((match = rx.exec(html)) !== null) {
          cleanAndAddImage(match[1]);
        }
      }

      // Look at lazy loaded source indicators
      const lazyImgRegex = /(?:data-src|data-original-src|data-original|data-lazy|data-zoom|zoom-image)=["']([^"']+)["']/gi;
      let match;
      while ((match = lazyImgRegex.exec(html)) !== null) {
        cleanAndAddImage(match[1]);
      }

      // If we still have very few or no candidates, capture any img tags even simple relative ones
      const generalImgTagRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      while ((match = generalImgTagRegex.exec(html)) !== null) {
        cleanAndAddImage(match[1]);
      }

      // Simple HTML tags stripper to reduce context size and clean layout
      const cleanHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      rawPageText = cleanHtml.slice(0, 8000); // Send first 8k chars of readable text
      successfullyFetched = true;
      console.log(`Successfully fetched webpage body of size: ${rawPageText.length}, extracted image count: ${extractedImageCandidates.length}`);
    } else {
      console.log(`Failed to fetch webpage directly: HTTP ${fetchRes.status}`);
    }
  } catch (err: any) {
    console.log("Unable to pre-fetch webpage (CORS/Anti-Scraping expected):", err.message);
  }

  // 2. Query Gemini with a single consolidated, highly token-efficient structured analysis
  try {
    const aiClient = getGenAI();

    // Decode URL components to find nice English words for title synthesis if blank
    let urlTokens = "";
    try {
      const parsed = new URL(url);
      const pathnameWords = parsed.pathname
        .replace(/[-_.\/]/g, " ")
        .replace(/\d+/g, "")
        .trim();
      if (pathnameWords.length > 5) {
        urlTokens = `(URL keywords: "${pathnameWords}")`;
      }
    } catch (_) {}

    const systemPromptStructure = `You are a high-fidelity anime merchandise analyzer for collectors.
Given the product listing URL, extracted HTML title/description metadata, and raw text (if successfully fetched), analyze and construct an elegant product entry.

Source details:
- Sourced store name: MUST map strictly to one of: ["Taobao Malaysia", "Shopee Malaysia", "Kinokuniya Malaysia", "Animate Japan", "Animate Malaysia", "Others"]
- Original Currency & price: Determine if currency is MYR, CNY, JPY, USD, SGD, or EUR.
  * CRITICAL: If the site lists price or is localized to MYR/RM (e.g. Shopee / Taobao Malaysia or local store), state currency "MYR" and set priceMyr exactly to originalPrice. Avoid duplicate conversion!
  * Otherwise, apply conversion rates:
    - CNY to MYR: Multiplier 0.65
    - JPY to MYR: Multiplier 0.030
    - USD to MYR: Multiplier 4.70
    - SGD to MYR: Multiplier 3.45
- Category: Must map strictly to one of: ["Manga", "Light Novel", "Fan Book", "Keychains", "Acrylic Stands", "Badges", "Mousepad", "Photo", "Photocard", "Others"]
- Image selection: STRICTLY select one of the image URLs from the Extracted Image Candidates list whenever the list is not empty. Choose the most specific product picture, avoiding layout/banner elements. Do not invent a stock image or placeholder if candidates are present. Only utilize the default placeholder "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600" if no candidates are supplied at all.
- Key features: Provide 2-4 short, elegant tags in an array.

Be poetic yet factual. If details are sparse, creatively synthesize a highly plausible traditional lunar Princess Kaguya collector item fitting the URL context. Return strict raw JSON.`;

    const analyzePrompt = `URL: ${url}
${urlTokens}
${pageMetadataDetails}
Extracted Image Candidates: [${extractedImageCandidates.slice(0, 10).join(", ")}]
Webpage Content Context (First 8000 Chars):
${rawPageText || "Fetch failed (e.g. cloudflare 403 or anti-scraping). Please estimate based on URL structure."}`;

    console.log("Stage 1: Dispatching single consolidated Gemini analysis.");
    const finalResponse = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ text: analyzePrompt }],
      config: {
        systemInstruction: systemPromptStructure,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            storeName: { type: Type.STRING },
            originalPrice: { type: Type.NUMBER },
            originalCurrency: { type: Type.STRING },
            priceMyr: { type: Type.NUMBER },
            imageUrl: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            keyFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "storeName", "originalPrice", "originalCurrency", "priceMyr", "description", "category"]
        }
      }
    });

    const bodyText = finalResponse.text;
    if (!bodyText) {
      throw new Error("Empty structured response received from Gemini.");
    }

    const resultData = JSON.parse(bodyText.trim());
    console.log("Successfully extracted product metadata from Gemini:", resultData);
    res.json(resultData);

  } catch (geminiErr: any) {
    console.error("Gemini analysis error:", geminiErr);
    // Graceful fallback with high usability: parse basics from URL and estimate
    const isTaobao = url.toLowerCase().includes("taobao");
    const isShopee = url.toLowerCase().includes("shopee");
    const isKinokuniya = url.toLowerCase().includes("kinokuniya");
    const isAnimateJapan = url.toLowerCase().includes(".co.jp") && url.toLowerCase().includes("animate");
    const isAnimateMy = url.toLowerCase().includes("animate") && !isAnimateJapan;

    let fallbackStore = "Others";
    if (isTaobao) fallbackStore = "Taobao Malaysia";
    else if (isShopee) fallbackStore = "Shopee Malaysia";
    else if (isKinokuniya) fallbackStore = "Kinokuniya Malaysia";
    else if (isAnimateJapan) fallbackStore = "Animate Japan";
    else if (isAnimateMy) fallbackStore = "Animate Malaysia";

    // Infer category from URL path keys
    let inferredCat = "Acrylic Stands";
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes("manga") || lowercaseUrl.includes("comic") || lowercaseUrl.includes("book")) {
      inferredCat = "Manga";
    } else if (lowercaseUrl.includes("novel") || lowercaseUrl.includes("ln")) {
      inferredCat = "Light Novel";
    } else if (lowercaseUrl.includes("fanbook") || lowercaseUrl.includes("artbook")) {
      inferredCat = "Fan Book";
    } else if (lowercaseUrl.includes("keychain") || lowercaseUrl.includes("strap") || lowercaseUrl.includes("acrylic-keychain")) {
      inferredCat = "Keychains";
    } else if (lowercaseUrl.includes("stand") || lowercaseUrl.includes("diorama") || lowercaseUrl.includes("acrylic-stand")) {
      inferredCat = "Acrylic Stands";
    } else if (lowercaseUrl.includes("badge") || lowercaseUrl.includes("can-badge") || lowercaseUrl.includes("pin")) {
      inferredCat = "Badges";
    } else if (lowercaseUrl.includes("mousepad") || lowercaseUrl.includes("deskmat")) {
      inferredCat = "Mousepad";
    } else if (lowercaseUrl.includes("photocard")) {
      inferredCat = "Photocard";
    } else if (lowercaseUrl.includes("photo") || lowercaseUrl.includes("bromide")) {
      inferredCat = "Photo";
    }

    // Attempt to synthesize a beautiful title from URL pathname words
    let synthTitle = "Cosmic Princess Kaguya Merch";
    try {
      const parsedUr = new URL(url);
      const niceSegments = parsedUr.pathname
        .split("/")
        .filter(s => s && !s.match(/^\d+$/))
        .pop();
      if (niceSegments) {
        const decoded = decodeURIComponent(niceSegments)
          .replace(/[-_.]/g, " ")
          .replace(/\b\w/g, c => c.toUpperCase());
        if (decoded.trim().length > 3) {
          synthTitle = decoded.trim();
        }
      }
    } catch (_) {}

    const fallbackCurrency = isShopee || isKinokuniya || isTaobao ? "MYR" : isAnimateJapan ? "JPY" : "MYR";
    const fallbackPrice = isAnimateJapan ? 2200 : isShopee ? 45 : isKinokuniya ? 75 : 50;
    const rate = fallbackCurrency === "JPY" ? 0.03 : 1.0;
    const fallbackMyr = Math.round(fallbackPrice * rate * 100) / 100;

    res.json({
      title: synthTitle,
      storeName: fallbackStore,
      originalPrice: fallbackPrice,
      originalCurrency: fallbackCurrency,
      priceMyr: fallbackMyr,
      imageUrl: extractedImageCandidates[0] || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400",
      description: `Spotted item at ${fallbackStore}. Automatically summarized offline to respect celestial rate limits. Click to edit or adjust the parameters manually below.`,
      category: inferredCat,
      keyFeatures: ["Lunar celestial seal", "Traditional Bamboo design"],
      isFallback: true
    });
  }
});

// ----------------------------------------------------
// DEV AND PRODUCTION MULTIPLEXING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
    console.log(`[Server] Kaguya Merch Tracker running on http://localhost:${PORT}`);
    console.log(`[Server] Dev environment: ${process.env.NODE_ENV !== "production"}`);
  });
}

startServer();
