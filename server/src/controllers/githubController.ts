import { Request, Response } from "express";
import Groq from "groq-sdk";

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  return new Groq({ apiKey });
};

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

// GET /api/github/auth — redirect to GitHub OAuth
export const githubAuth = (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID || "",
    redirect_uri: process.env.GITHUB_REDIRECT_URI || "",
    scope: "read:user repo",
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

// GET /api/github/callback — GitHub redirects here after auth
export const githubCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );
    const tokenData = (await tokenRes.json()) as any;
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("GitHub did not return an access token");
    }

    // Redirect to frontend with token
    res.redirect(
      `${getClientUrl()}/github-callback?token=${encodeURIComponent(accessToken)}`,
    );
  } catch {
    res.redirect(`${getClientUrl()}/dashboard?error=github_auth_failed`);
  }
};

// GET /api/github/repos — fetch user repos
export const getRepos = async (req: Request, res: Response) => {
  const githubToken = req.headers["x-github-token"] as string;

  if (!githubToken) {
    res.status(400).json({ message: "GitHub token required" });
    return;
  }

  try {
    const reposRes = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=20&type=owner",
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );
    const repos = (await reposRes.json()) as any[];

    res.status(200).json({
      repos: repos.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        url: r.html_url,
        updatedAt: r.updated_at,
      })),
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch repos" });
  }
};

// POST /api/github/generate-bullets — AI generates resume bullets from repo
export const generateRepoBullets = async (req: Request, res: Response) => {
  const { repoName, repoDescription, language, githubToken } = req.body;

  if (!repoName) {
    res.status(400).json({ message: "repoName is required" });
    return;
  }

  try {
    // Fetch README if available
    let readmeContent = "";
    if (githubToken) {
      try {
        const readmeRes = await fetch(
          `https://api.github.com/repos/${repoName}/readme`,
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3.raw",
            },
          },
        );
        if (readmeRes.ok) {
          readmeContent = (await readmeRes.text()).substring(0, 500);
        }
      } catch {
        /* README not available */
      }
    }

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Always respond with valid JSON only — no markdown, no backticks.",
        },
        {
          role: "user",
          content: `Generate 3 strong resume bullet points for this GitHub project.

Project name: ${repoName}
Description: ${repoDescription || "No description"}
Language: ${language || "Unknown"}
README excerpt: ${readmeContent || "Not available"}

Return ONLY this JSON:
{
  "bullets": [
    "Strong bullet point 1 with action verb and impact",
    "Strong bullet point 2 with technical details",
    "Strong bullet point 3 with outcome or metric"
  ]
}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 512,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    res.status(200).json(parsed);
  } catch {
    res.status(500).json({ message: "Failed to generate bullets" });
  }
};
