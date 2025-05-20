"use client";

import Image from "next/image";

interface PriceData {
  name: string;
  fiat?: string;
  price: number;
  percentChange24hr: number;
  prevClose: number;
  prevOpen: number;
  high?: number;
  low?: number;
  date: string;
  insights?: string;
  baseVolume?: number;
  quoteVolume?: number;
  error?: string;
}

interface CryptoPriceOverviewProps {
  result?: PriceData;
}

export default function CryptoPriceOverview({
  result,
}: CryptoPriceOverviewProps) {
  return (
    result && (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg flex items-center gap-2 font-semibold text-white mb-4">
            <Image
              src={`/icons/${result.name.toUpperCase()}.png`}
              alt={result.name}
              width={20}
              height={20}
              loading="lazy"
            />
            {result.name || "Crypto"} Price Overview
          </h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <div className="border border-zinc-800 p-2 rounded-full">
              24h Volume: {result.baseVolume?.toLocaleString() ?? "-"} (
              {result.name})
            </div>
            <div className="border border-zinc-800 p-2 rounded-full">
              24h Volume: {result.quoteVolume?.toLocaleString() ?? "-"} (
              {result.fiat || "THB"})
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-zinc-800 my-4"></div>

        <div className="grid grid-cols-3 gap-4 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-400">Date</span>
            <div className="text-blue-400 text-xl font-bold">
              {new Date(result.date).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-zinc-400">Current Price</span>
            <div className="text-orange-400 text-xl font-bold">
              ฿ {result.price?.toLocaleString() ?? "-"}
            </div>
          </div>
          <div>
            <span className="text-zinc-400">24h Change</span>
            <div
              className={`font-semibold text-xl ${
                result.percentChange24hr >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {result.percentChange24hr?.toFixed(2) ?? "0.00"}%
            </div>
          </div>
          <div>
            <span className="text-zinc-400">Previous Close</span>
            <div>฿ {result.prevClose?.toLocaleString() ?? "-"}</div>
          </div>
          <div>
            <span className="text-zinc-400">Previous Open</span>
            <div>฿ {result.prevOpen?.toLocaleString() ?? "-"}</div>
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-zinc-400">High 24hr</span>
              <div>{result.high?.toLocaleString() ?? "-"}</div>
            </div>
            <div>
              <span className="text-zinc-400">Low 24hr</span>
              <div>{result.low?.toLocaleString() ?? "-"}</div>
            </div>
          </div>
        </div>

        {result.insights && (
          <div className="mt-6 text-sm text-zinc-300">
            <h3 className="font-semibold text-white mb-2">💡 Insight</h3>
            <p className="leading-relaxed">{result.insights}</p>
          </div>
        )}
      </div>
    )
  );
}
