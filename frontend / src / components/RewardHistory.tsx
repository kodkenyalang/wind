import { useGetRewardHistory } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RewardHistory() {
  const { data: rewardHistory, isLoading } = useGetRewardHistory();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Reward History</CardTitle>
            <CardDescription>Track all reward distributions and trigger events</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!rewardHistory || rewardHistory.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">No rewards distributed yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Rewards will appear here when price conditions are met
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Trigger Condition</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewardHistory.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {formatAddress(event.recipient)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Coins className="w-3 h-3" />
                        {event.amount} SOL
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {event.triggerCondition}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimestamp(event.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
