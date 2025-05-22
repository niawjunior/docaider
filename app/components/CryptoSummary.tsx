"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react"; // For consistent loading spinner

interface CoinInfo {
  symbol: string;
  volume: number; // volume seems unused in the original template, but kept for type consistency
}

interface CryptoSummaryProps {
  data?: {
    total: number;
    coins: CoinInfo[];
  };
}

export default function CryptoSummary({ data }: CryptoSummaryProps) {
  return (
    <div className="w-full mx-auto mt-6">
      {data ? (
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-semibold text-white">
              <Image
                src="/icons/bitkub.svg" // Assuming this path is correct
                alt="Bitkub"
                width={28} // Adjusted size
                height={28}
                loading="lazy"
              />
              Bitkub Crypto Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-400 mb-3 text-sm">
              {" "}
              {/* Increased margin-bottom slightly */}
              Bitkub currently lists <strong>{data.total}</strong> unique
              cryptocurrencies.
            </p>
            <div className="flex flex-wrap gap-2">
              {data.coins.map((coin, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="flex items-center gap-2 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  <Image
                    src={`/icons/${coin.symbol.toUpperCase()}.png`}
                    alt={coin.symbol}
                    width={16} // Adjusted size for badge
                    height={16}
                    loading="lazy"
                    className="rounded-full" // Ensure icon within badge is also rounded if needed
                  />
                  {coin.symbol}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center gap-2 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-white text-sm">Fetching market summary...</p>
        </div>
      )}
    </div>
  );
}
