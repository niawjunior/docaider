"use client";

import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  if (!result) {
    return null; // Or some loading/error state if preferred
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 text-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2 font-semibold text-white">
            <Image
              src={`/icons/${result.name.toUpperCase()}.png`}
              alt={result.name}
              width={24} // Slightly larger icon
              height={24}
              loading="lazy"
            />
            {result.name || "Crypto"} Price Overview
          </CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              24h Vol ({result.name}):{" "}
              {result.baseVolume?.toLocaleString() ?? "-"}
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              24h Vol ({result.fiat || "THB"}):{" "}
              {result.quoteVolume?.toLocaleString() ?? "-"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-zinc-800 my-0" />{" "}
      {/* Adjusted margin if CardContent adds padding */}
      <CardContent className="pt-6">
        {" "}
        {/* Added padding-top for content after separator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-400 block mb-1">Date</span>
            <div className="text-blue-400 text-xl font-bold">
              {new Date(result.date).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-zinc-400 block mb-1">Current Price</span>
            <div className="text-orange-400 text-xl font-bold">
              ฿ {result.price?.toLocaleString() ?? "-"}
            </div>
          </div>
          <div>
            <span className="text-zinc-400 block mb-1">24h Change</span>
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
            <span className="text-zinc-400 block mb-1">Previous Close</span>
            <div>฿ {result.prevClose?.toLocaleString() ?? "-"}</div>
          </div>
          <div>
            <span className="text-zinc-400 block mb-1">Previous Open</span>
            <div>฿ {result.prevOpen?.toLocaleString() ?? "-"}</div>
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-zinc-400 block mb-1">High 24hr</span>
              <div>{result.high?.toLocaleString() ?? "-"}</div>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1">Low 24hr</span>
              <div>{result.low?.toLocaleString() ?? "-"}</div>
            </div>
          </div>
        </div>
      </CardContent>
      {result.insights && (
        <>
          <Separator className="bg-zinc-800 my-0" />
          <CardFooter className="pt-6">
            <div className="text-sm text-zinc-300 w-full">
              <h3 className="font-semibold text-white mb-2">💡 Insight</h3>
              <p className="leading-relaxed">{result.insights}</p>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
