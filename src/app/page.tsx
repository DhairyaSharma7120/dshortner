"use client";

import { useState, useEffect } from "react";

type Link = {
  id: string;
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);

  async function fetchLinks() {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/links", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setLinks(await res.json());
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("/api/links", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setLinks(data); });
  }, []);

  async function handleShorten() {
    setError("");
    setShortUrl("");
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ originalUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong");
      } else {
        setShortUrl(`${window.location.origin}/site/${data.shortCode}`);
        setUrl("");
        fetchLinks();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <main className="w-full max-w-lg flex flex-col items-start gap-6 tw-w-1/2">
        {/* Header */}
        <div className="w-full flex justify-center">
          <div className="w-auto text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              URL Shortener
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Paste a long URL and get a short link instantly.
            </p>
          </div>

          {/* Input + Button */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleShorten()}
              placeholder="https://example.com/very/long/url"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={handleShorten}
              disabled={loading || !url.trim()}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition cursor-pointer"
            >
              {loading ? "Shortening…" : "Shorten URL"}
            </button>
          </div>

          {/* Result */}
          {shortUrl && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 px-4 py-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-green-700 dark:text-green-300 truncate hover:underline"
              >
                {shortUrl}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shortUrl)}
                className="shrink-0 text-xs text-green-600 dark:text-green-400 hover:underline"
              >
                Copy
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Links table */}
        {links.length > 0 && (
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Your links</h2>
            </div>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {links.map((link) => (
                <li key={link.id} className="flex items-center justify-between gap-4 px-6 py-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <a
                      href={`/site/${link.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      /site/{link.shortCode}
                    </a>
                    <span className="text-xs text-zinc-400 truncate">{link.originalUrl}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2.5 py-1">
                    {link.clickCount} {link.clickCount === 1 ? "click" : "clicks"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </main>
    </div>
  );
}

