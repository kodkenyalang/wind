import { useGetCurrentPrices, useGetPriceBenchmarks } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PriceCards() {
  const { data: currentPrices, isLoading: pricesLoading } = useGetCurrentPrices();
  const { data: benchmarks, isLoading: benchmarksLoading } = useGetPriceBenchmarks();

  const solBenchmark = benchmarks?.find(([key]) => key === 'SOL')?.[1] || 0;
  const btcBenchmark = benchmarks?.find(([key]) => key === 'BTC')?.[1] || 0;

  const calculateChange = (current: number, benchmark: number) => {
    if (!benchmark) return 0;
    return ((current - benchmark) / benchmark) * 100;
  };

  const solChange = currentPrices ? calculateChange(currentPrices.solPrice, solBenchmark) : 0;
  const btcChange = currentPrices ? calculateChange(currentPrices.btcPrice, btcBenchmark) : 0;

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  if (pricesLoading || benchmarksLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/generated/sol-coin-icon-transparent.dim_128x128.png" alt="SOL" className="w-12 h-12" />
              <div>
                <CardTitle className="text-2xl">Solana</CardTitle>
                <CardDescription>SOL/USD</CardDescription>
              </div>
            </div>
            {solChange >= 30 && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                Reward Triggered!
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPrices ? (
            <>
              <div>
                <p className="text-4xl font-bold">${currentPrices.solPrice.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  {solChange >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-lg font-semibold ${solChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {solChange >= 0 ? '+' : ''}{solChange.toFixed(2)}%
                  </span>
                  <span className="text-sm text-muted-foreground">from benchmark</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Benchmark:</span>
                  <span className="font-medium">${solBenchmark.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target for Reward:</span>
                  <span className="font-medium text-primary">+30%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Updated: {formatTimestamp(currentPrices.timestamp)}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No price data available</p>
              <p className="text-sm mt-2">Admin needs to fetch initial prices</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/generated/btc-coin-icon-transparent.dim_128x128.png" alt="BTC" className="w-12 h-12" />
              <div>
                <CardTitle className="text-2xl">Bitcoin</CardTitle>
                <CardDescription>BTC/USD</CardDescription>
              </div>
            </div>
            {btcChange >= 10 && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                Reward Triggered!
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPrices ? (
            <>
              <div>
                <p className="text-4xl font-bold">${currentPrices.btcPrice.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  {btcChange >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-lg font-semibold ${btcChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
                  </span>
                  <span className="text-sm text-muted-foreground">from benchmark</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Benchmark:</span>
                  <span className="font-medium">${btcBenchmark.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target for Reward:</span>
                  <span className="font-medium text-primary">+10%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Updated: {formatTimestamp(currentPrices.timestamp)}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No price data available</p>
              <p className="text-sm mt-2">Admin needs to fetch initial prices</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
