import { useState } from 'react';
import {
  useFetchPriceData,
  useUpdateCurrentPrices,
  useUpdatePriceBenchmarks,
  useGetCurrentPrices,
  useGetPriceBenchmarks,
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, RefreshCw, TrendingUp, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPanel() {
  const [solPrice, setSolPrice] = useState('');
  const [btcPrice, setBtcPrice] = useState('');

  const { mutate: fetchPrices, isPending: isFetching } = useFetchPriceData();
  const { mutate: updatePrices, isPending: isUpdatingPrices } = useUpdateCurrentPrices();
  const { mutate: updateBenchmarks, isPending: isUpdatingBenchmarks } = useUpdatePriceBenchmarks();
  const { data: currentPrices } = useGetCurrentPrices();
  const { data: benchmarks } = useGetPriceBenchmarks();

  const handleFetchPrices = async () => {
    fetchPrices(undefined, {
      onSuccess: (data) => {
        if (data?.solana?.usd && data?.bitcoin?.usd) {
          const solPrice = data.solana.usd;
          const btcPrice = data.bitcoin.usd;
          
          updatePrices({ solPrice, btcPrice }, {
            onSuccess: () => {
              toast.success(`Prices updated: SOL $${solPrice.toFixed(2)}, BTC $${btcPrice.toLocaleString()}`);
            },
          });
        }
      },
    });
  };

  const handleManualUpdate = () => {
    const sol = parseFloat(solPrice);
    const btc = parseFloat(btcPrice);

    if (isNaN(sol) || isNaN(btc) || sol <= 0 || btc <= 0) {
      toast.error('Please enter valid prices');
      return;
    }

    updatePrices({ solPrice: sol, btcPrice: btc }, {
      onSuccess: () => {
        setSolPrice('');
        setBtcPrice('');
      },
    });
  };

  const handleSetBenchmarks = () => {
    if (!currentPrices) {
      toast.error('No current prices available. Fetch prices first.');
      return;
    }

    updateBenchmarks({
      solPrice: currentPrices.solPrice,
      btcPrice: currentPrices.btcPrice,
    });
  };

  const solBenchmark = benchmarks?.find(([key]) => key === 'SOL')?.[1];
  const btcBenchmark = benchmarks?.find(([key]) => key === 'BTC')?.[1];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription>Manage price data and benchmarks</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Fetch Live Prices
              </h3>
              <p className="text-sm text-muted-foreground">Get latest prices from CoinGecko API</p>
            </div>
            <Button onClick={handleFetchPrices} disabled={isFetching}>
              {isFetching ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Fetch Prices
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Database className="w-4 h-4" />
                Manual Price Update
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sol-price">SOL Price (USD)</Label>
                  <Input
                    id="sol-price"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 150.00"
                    value={solPrice}
                    onChange={(e) => setSolPrice(e.target.value)}
                    disabled={isUpdatingPrices}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="btc-price">BTC Price (USD)</Label>
                  <Input
                    id="btc-price"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 45000.00"
                    value={btcPrice}
                    onChange={(e) => setBtcPrice(e.target.value)}
                    disabled={isUpdatingPrices}
                  />
                </div>
              </div>
              <Button
                onClick={handleManualUpdate}
                disabled={isUpdatingPrices || !solPrice || !btcPrice}
                className="mt-4 w-full sm:w-auto"
              >
                {isUpdatingPrices ? 'Updating...' : 'Update Prices'}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Set Price Benchmarks
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Set current prices as new benchmarks for reward calculations
              </p>
              {solBenchmark !== undefined && btcBenchmark !== undefined && (
                <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-1 text-sm">
                  <p>Current Benchmarks:</p>
                  <p className="font-medium">SOL: ${solBenchmark.toFixed(2)} | BTC: ${btcBenchmark.toLocaleString()}</p>
                </div>
              )}
              <Button
                onClick={handleSetBenchmarks}
                disabled={isUpdatingBenchmarks || !currentPrices}
                variant="outline"
              >
                {isUpdatingBenchmarks ? 'Setting...' : 'Set Current Prices as Benchmarks'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
