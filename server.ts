import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const MODEL_NAME = "gemini-3.5-flash";

// Utility for exponential backoff retries
async function withRetry(fn: () => Promise<any>, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.message?.includes("429") || error.status === 429 || error.statusText === "Too Many Requests";
      if (!isRateLimit) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// Utility to clean markdown format from JSON before parsing
function cleanAndParseJson(text: string) {
  let cleaned = text.trim();
  if (cleaned.includes("```")) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }
  }
  return JSON.parse(cleaned);
}

function unescapeHtml(safe: string) {
  return safe
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#124;/g, "|");
}

async function fallbackSearch(query: string) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    if (!response.ok) throw new Error(`DDG returned status ${response.status}`);
    const html = await response.text();
    
    const results: any[] = [];
    const blocks = html.split('class="result__body"');
    
    for (let i = 1; i < blocks.length && results.length < 8; i++) {
      const block = blocks[i];
      const linkMatch = block.match(/href="([^"]+)"/);
      const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      
      if (linkMatch && titleMatch) {
        let link = linkMatch[1];
        if (link.includes('uddg=')) {
          const parts = link.split('uddg=');
          if (parts[1]) {
            link = decodeURIComponent(parts[1].split('&')[0]);
          }
        }
        
        let title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        let desc = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : "No description available.";
        
        results.push({
          title: unescapeHtml(title),
          link: link,
          desc: unescapeHtml(desc),
          source: "Google Search"
        });
      }
    }
    return results;
  } catch (err) {
    console.error("Fallback search scraping failed:", err);
    return [];
  }
}

async function fetchRealTimeWeather(city?: string, lat?: number, lon?: number) {
  let finalLat = lat;
  let finalLon = lon;
  let finalCity = city || "San Francisco";
  let countryCode = "US";

  // If a city is provided, look up coordinates using the free Geocoding API
  if (city) {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results[0]) {
          const result = geoData.results[0];
          finalLat = result.latitude;
          finalLon = result.longitude;
          finalCity = result.name;
          countryCode = result.country_code || "US";
        }
      }
    } catch (err) {
      console.error("Geocoding failed for city:", city, err);
    }
  }

  // If we don't have lat/lon yet, fallback to San Francisco coords
  if (finalLat === undefined || finalLon === undefined) {
    finalLat = 37.7749;
    finalLon = -122.4194;
    finalCity = "San Francisco";
    countryCode = "US";
  }

  // Fetch forecast / current weather in metric units (Celsius, km/h)
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    throw new Error(`Weather API returned ${weatherRes.status}`);
  }
  const weatherData = await weatherRes.json();
  const current = weatherData.current;
  const daily = weatherData.daily;

  // Map WMO weather code to condition string
  const code = current.weather_code;
  let condition = "Sunny";
  if (code === 0) condition = "Sunny";
  else if (code >= 1 && code <= 3) condition = "Partly Cloudy";
  else if (code === 45 || code === 48) condition = "Foggy";
  else if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) condition = "Rainy";
  else if ((code >= 61 && code <= 67)) condition = "Rainy";
  else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) condition = "Snowy";
  else if (code >= 95 && code <= 99) condition = "Stormy";

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const forecast: any[] = [];
  if (daily && daily.time) {
    for (let i = 1; i < 5 && i < daily.time.length; i++) {
      const date = new Date(daily.time[i] + "T00:00:00");
      forecast.push({
        day: dayNames[date.getDay()],
        temp: Math.round(daily.temperature_2m_max[i])
      });
    }
  }

  return {
    temp: Math.round(current.temperature_2m),
    condition: condition,
    location: `${finalCity}, ${countryCode.toUpperCase()}`,
    high: Math.round(daily.temperature_2m_max[0]),
    low: Math.round(daily.temperature_2m_min[0]),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    forecast: forecast
  };
}

// API Routes
app.post("/api/browser/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    let results: any[] = [];
    let text = "";

    try {
      // First try Gemini's googleSearch grounding
      const response = await withRetry(() => ai.models.generateContent({
        model: MODEL_NAME,
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      }));

      text = response.text || "";
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const chunks = groundingMetadata?.groundingChunks;
      const supports = groundingMetadata?.groundingSupports;

      results = (chunks || []).map((chunk: any, index: number) => ({
        title: chunk.web?.title || `Result ${index + 1}`,
        link: chunk.web?.uri || "#",
        desc: supports?.find((s: any) => s.groundingChunkIndices.includes(index))?.segment?.text || "No description available.",
        source: "Google Search"
      }));
    } catch (groundingError) {
      console.warn("Gemini Google Search grounding failed. Falling back to scraper:", groundingError);
      
      // Fallback: scrape DuckDuckGo for real-time organic search results
      results = await fallbackSearch(query);
      
      if (results.length > 0) {
        // Feed real results into Gemini as context for a beautifully customized AI overview!
        const contextText = results.map(r => `Title: ${r.title}\nLink: ${r.link}\nSnippet: ${r.desc}`).join('\n\n');
        const aiPrompt = `You are a helpful search assistant. A user searched for: "${query}".
We retrieved the following real-time web results:
${contextText}

Generate a concise, elegant, and modern AI Overview (SGE summary) answering the user query based on these search results.
Use markdown formatting beautifully. Ensure you are highly informative, professional, and clear. Do not mention that you scraped these or that the system failed, keep it perfectly professional.`;

        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: aiPrompt,
        });
        text = response.text || "AI search synthesis is currently offline.";
      } else {
        // Absolute local fallback if DDG scraper fails too
        text = `Here is what I know about "${query}":

It looks like we are having trouble connecting to live web streams. However, based on my knowledge base:
- Please check your query or verify your virtual network.
- Ensure that the requested terms are spelled correctly.`;
        results = [
          { title: `Learn about ${query} on Wikipedia`, link: `https://wikipedia.org/wiki/${encodeURIComponent(query)}`, desc: `Detailed educational resources and community-sourced history about ${query}.`, source: "Wikipedia" },
          { title: `Search for ${query} on Google News`, link: `https://news.google.com/search?q=${encodeURIComponent(query)}`, desc: `Read current live articles, breaking news, and perspectives on ${query}.`, source: "Google News" }
        ];
      }
    }

    res.json({ text, results });
  } catch (error: any) {
    console.error("Search Error:", error);
    res.status(500).json({ error: error.message || "Failed to perform search" });
  }
});

// Real-time Weather Endpoint (using Open-Meteo as primary, Gemini as backup)
app.get("/api/weather", async (req, res) => {
  const { lat, lon, city } = req.query;
  try {
    const weatherInfo = await fetchRealTimeWeather(
      city ? String(city) : undefined,
      lat ? Number(lat) : undefined,
      lon ? Number(lon) : undefined
    );
    res.json(weatherInfo);
  } catch (error) {
    console.error("Open-Meteo failed, trying Gemini grounding:", error);
    try {
      let weatherPrompt = "Search Google for the current actual weather in San Francisco. Return ONLY a JSON object with: temp (number in Celsius), condition (string), location (string, e.g. 'San Francisco, CA'), high (number in Celsius), low (number in Celsius), humidity (number), windSpeed (number in km/h). Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.";
      if (city) {
        weatherPrompt = `Search Google for the current real weather in "${city}". Return ONLY a JSON object with: temp (number in Celsius), condition (string), location (string, e.g. 'Miami, FL'), high (number in Celsius), low (number in Celsius), humidity (number), windSpeed (number in km/h). Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.`;
      } else if (lat && lon) {
        weatherPrompt = `Search Google for the city name nearest to latitude ${lat} and longitude ${lon}. Then, search Google for the current real weather of that city. Return ONLY a JSON object with: temp (number in Celsius), condition (string), location (string, e.g. 'Miami, FL'), high (number in Celsius), low (number in Celsius), humidity (number), windSpeed (number in km/h). Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.`;
      }

      const response = await withRetry(() => ai.models.generateContent({
        model: MODEL_NAME,
        contents: weatherPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        },
      }));

      res.json(cleanAndParseJson(response.text || ""));
    } catch (geminiError) {
      console.error("Weather API Gemini Error:", geminiError);
      res.json({ 
        temp: 20, 
        condition: "Sunny", 
        location: city ? String(city) : "San Francisco, CA", 
        high: 22, 
        low: 14, 
        humidity: 45, 
        windSpeed: 15,
        forecast: [
          { day: "MON", temp: 18 },
          { day: "TUE", temp: 21 },
          { day: "WED", temp: 22 },
          { day: "THU", temp: 24 }
        ]
      });
    }
  }
});

// Proxy endpoint to load web pages securely and bypass iframe restriction headers
app.get("/api/browser/proxy", async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send("URL parameter is required");
  }
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      throw new Error(`Target site returned ${response.status} ${response.statusText}`);
    }

    let html = await response.text();
    
    // Inject a <base href="..."> so relative links, images, styles resolve correctly!
    const baseTag = `<base href="${targetUrl}">`;
    const interceptScript = `
      <script>
        document.addEventListener('click', function(e) {
          const target = e.target.closest('a');
          if (target && target.href) {
            const url = target.href;
            if (url.startsWith('http://') || url.startsWith('https://')) {
              e.preventDefault();
              window.location.href = '/api/browser/proxy?url=' + encodeURIComponent(url);
            }
          }
        });
        document.addEventListener('submit', function(e) {
          const form = e.target;
          const action = form.action || window.location.href;
          const method = (form.method || 'GET').toUpperCase();
          if (method === 'GET') {
            e.preventDefault();
            const formData = new FormData(form);
            const params = new URLSearchParams(formData);
            const targetUrl = action + (action.includes('?') ? '&' : '?') + params.toString();
            window.location.href = '/api/browser/proxy?url=' + encodeURIComponent(targetUrl);
          }
        });
      </script>
    `;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}${interceptScript}`);
    } else if (html.includes('<html>')) {
      html = html.replace('<html>', `<html><head>${baseTag}${interceptScript}</head>`);
    } else {
      html = baseTag + interceptScript + html;
    }
    
    // Remove frame-busting scripts and other potentially breaking scripts
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove security headers that might cause issues in the iframe
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    console.error("Proxy Error:", error);
    res.status(500).send(`
      <html>
        <body style="font-family:sans-serif; background:#0f172a; color:#f8fafc; padding:3rem; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="background:rgba(255,255,255,0.05); padding:2rem; border-radius:1.5rem; border:1px solid rgba(255,255,255,0.1); max-width:400px;">
            <div style="font-size:3rem; margin-bottom:1rem;">🌐</div>
            <h2 style="margin:0 0 1rem 0; font-weight:900; letter-spacing:-0.025em;">Connection Blocked</h2>
            <p style="opacity:0.6; font-size:0.9rem; line-height:1.5; margin-bottom:2rem;">
              The website <b>${targetUrl}</b> has strict security protocols that prevent it from being loaded inside an emulator.
            </p>
            <a href="${targetUrl}" target="_blank" style="background:#3b82f6; color:white; text-decoration:none; padding:0.75rem 1.5rem; border-radius:0.75rem; font-weight:700; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em;">Open in New Tab</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Real-time Stocks Endpoint
app.get("/api/stocks", async (req, res) => {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Get current prices for AAPL, TSLA, and GOOG. Return ONLY a JSON array of objects with: s (symbol), p (price), c (change percentage with + or -). Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.",
      config: {
        tools: [{ googleSearch: {} }]
      },
    }));
    res.json(cleanAndParseJson(response.text || ""));
  } catch (error) {
    res.json([{ s: 'AAPL', p: '192.42', c: '+1.2%' }, { s: 'TSLA', p: '238.10', c: '-0.4%' }, { s: 'GOOG', p: '141.80', c: '+0.8%' }]);
  }
});

// Real-time News Endpoint
app.get("/api/news", async (req, res) => {
  try {
    const { category, lat, lon, city } = req.query;
    let contents = "";
    if (category === 'Local' && city) {
      contents = `Search Google News for the top 8 current news headlines in or around the city of "${city}". Return ONLY a JSON array of objects with: title, desc, link, source, time. Ensure it is actual news from today. Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.`;
    } else if (category === 'Local' && lat && lon) {
      contents = `Search Google News for the top 5 current news headlines near latitude ${lat}, longitude ${lon}. Return ONLY a JSON array of objects with: title, desc, link, source, time. Ensure it is actual news from today. Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.`;
    } else if (category) {
      contents = `Get the top 8 ${category} news headlines today. Return ONLY a JSON array of objects with: title, desc, link, source, time. Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.`;
    } else {
      contents = "Get the top 8 global breaking news headlines today. Return ONLY a JSON array of objects with: title, desc, link, source, time. Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.";
    }

    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        tools: [{ googleSearch: {} }]
      },
    }));
    
    let newsData = cleanAndParseJson(response.text || "");
    if (!Array.isArray(newsData)) newsData = [];
    
    res.json(newsData.map((item: any) => ({
      title: item.title || "Untitled Report",
      desc: item.desc || "No summary available for this item.",
      link: item.link || "https://news.google.com",
      source: item.source || "Global Feed",
      time: item.time || "Recently"
    })));
  } catch (error) {
    console.error("News Error:", error);
    res.json([
      { title: "Network Synchronization Active", desc: "The global news feed is currently updating. Please refresh in a moment.", link: "#", source: "System", time: "Now" },
      { title: "Market Volatility Reported", desc: "Traders are closely watching global indices as new economic data emerges.", link: "#", source: "Reuters", time: "1h ago" }
    ]);
  }
});

// Real-time Reddit Endpoint using Gemini Search Grounding
app.get("/api/reddit", async (req, res) => {
  const subreddit = String(req.query.subreddit || "all");
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search Google for current popular Reddit posts in the subreddit "${subreddit}" (or overall popular posts on Reddit if "all"). Return ONLY a JSON array of 6-8 objects representing these Reddit posts. Each post MUST have these fields exactly:
- title (string)
- subreddit (string, e.g. "r/technology")
- author (string, e.g. "u/red_coder")
- score (number, e.g. 5420)
- numComments (number, e.g. 312)
- created (string, e.g. "3h ago")
- content (string, the body text of the post or summary)
- comments (array of 3-5 objects with author, body, score (number), created (string))
Do not add any other conversational text, only the raw JSON or wrapped in a standard markdown code block.`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    }));
    res.json(cleanAndParseJson(response.text || ""));
  } catch (error) {
    console.error("Reddit Error:", error);
    // Dynamic mock posts based on the requested subreddit
    const mockPosts: Record<string, any[]> = {
      all: [
        {
          title: "NASA's James Webb Space Telescope discovers a pristine solar system",
          subreddit: "r/science",
          author: "u/stargazer_astro",
          score: 18450,
          numComments: 540,
          created: "2h ago",
          content: "The newly discovered system contains three rocky planets in the habitable zone of their star, with biosignatures currently under verification.",
          comments: [
            { author: "u/quantum_mechanic", body: "This is unbelievable! The biosignatures would be a massive breakthrough.", score: 1450, created: "1h ago" },
            { author: "u/void_gazer", body: "Can JWST analyze the atmospheric composition of all three?", score: 620, created: "45m ago" }
          ]
        },
        {
          title: "Show r/technology: A fully responsive desktop emulator built in React and Tailwind",
          subreddit: "r/technology",
          author: "u/antigravity_dev",
          score: 12100,
          numComments: 432,
          created: "4h ago",
          content: "I spent the last 3 months building a virtual OS called VirtualOS. It runs entirely in the browser and supports a terminal, browser with search grounding, code editor, paint, music composer, and various simulations!",
          comments: [
            { author: "u/web_wizard", body: "The browser proxy and local system design is absolutely incredible. Stellar craft!", score: 980, created: "3h ago" },
            { author: "u/css_god", body: "This looks better than my real operating system layout, the gradients are so clean.", score: 450, created: "2h ago" }
          ]
        },
        {
          title: "What is a fact that sounds completely fake but is 100% true?",
          subreddit: "r/askreddit",
          author: "u/curious_mind",
          score: 8740,
          numComments: 1205,
          created: "5h ago",
          content: "AskReddit thread of the day. Post your most unbelievable facts!",
          comments: [
            { author: "u/history_buff", body: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.", score: 3200, created: "4h ago" },
            { author: "u/nature_lover", body: "Sharks existed before trees. Also, before Saturn got its rings!", score: 1890, created: "3h ago" }
          ]
        }
      ],
      technology: [
        {
          title: "New AI standard announced for multi-agent local execution on everyday hardware",
          subreddit: "r/technology",
          author: "u/ai_expert",
          score: 4320,
          numComments: 185,
          created: "1h ago",
          content: "A consortium of developers has released a highly optimized library for coordinating local agents running on entry-level consumer GPUs.",
          comments: [
            { author: "u/hardware_hacker", body: "Finally! We don't need gigabytes of VRAM to get smart agent coordination.", score: 340, created: "30m ago" }
          ]
        }
      ],
      gaming: [
        {
          title: "The highly anticipated open-world RPG indie project is officially releasing early next year!",
          subreddit: "r/gaming",
          author: "u/game_reviewer",
          score: 9540,
          numComments: 620,
          created: "6h ago",
          content: "The gameplay trailer showcases dynamic environmental physics and rich lore mechanics.",
          comments: [
            { author: "u/pixel_knight", body: "Visually, this looks absolutely outstanding. Count me in on day one!", score: 850, created: "5h ago" }
          ]
        }
      ]
    };
    res.json(mockPosts[subreddit] || mockPosts.all);
  }
});

// Real-time Crypto Endpoint
app.get("/api/crypto", async (req, res) => {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Get current prices for BTC, ETH, SOL, and DOGE. Return ONLY a JSON array of objects with: name, symbol, price (number), change (string like +2.4%), color (string 'text-emerald-400' or 'text-red-400').",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    }));
    res.json(JSON.parse(response.text));
  } catch (error) {
    res.json([
      { name: 'Bitcoin', symbol: 'BTC', price: 64230.50, change: '+2.4%', color: 'text-emerald-400' },
      { name: 'Ethereum', symbol: 'ETH', price: 3450.20, change: '+1.8%', color: 'text-emerald-400' }
    ]);
  }
});

// Proxy-ish endpoint to check if a URL is iframeable
app.get("/api/browser/peek", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // In a real app, you might fetch the page and check X-Frame-Options
    // For now, we'll just return success and let the client try
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ error: "Failed to peek URL" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
