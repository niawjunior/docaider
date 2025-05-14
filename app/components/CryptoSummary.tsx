"use client";

import Image from "next/image";

interface CoinInfo {
  symbol: string;
  volume: number;
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg flex items-center gap-2 font-semibold text-white mb-4">
            <Image
              src="/icons/bitkub.svg"
              alt="Bitkub"
              width={70}
              height={70}
              loading="lazy"
            />
            Bitkub Crypto Summary
          </h2>
          <p className="text-orange-400 mb-2 text-sm">
            Bitkub currently lists <strong>{data.total}</strong> unique
            cryptocurrencies.
          </p>
          <div className="text-sm text-zinc-400 flex flex-wrap gap-2">
            {data.coins.map((coin, i) => (
              <div key={i} className="flex items-center gap-2">
                <Image
                  src={`/icons/${coin.symbol.toUpperCase()}.png`}
                  alt={coin.symbol}
                  width={20}
                  height={20}
                  loading="lazy"
                />
                <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded text-xs">
                  {coin.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-white text-sm">Fetching market summary...</p>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      )}
    </div>
  );
}
