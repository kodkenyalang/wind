import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, PriceData, RewardEvent } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetCurrentPrices() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PriceData | null>({
    queryKey: ['currentPrices'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCurrentPrices();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useGetPriceBenchmarks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, number]>>({
    queryKey: ['priceBenchmarks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPriceBenchmarks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetRewardHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RewardEvent[]>({
    queryKey: ['rewardHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRewardHistory();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

export function useFetchPriceData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const response = await actor.fetchPriceData();
      return JSON.parse(response);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentPrices'] });
      toast.success('Price data fetched successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(`Failed to fetch prices: ${error.message}`);
    },
  });
}

export function useUpdateCurrentPrices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ solPrice, btcPrice }: { solPrice: number; btcPrice: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCurrentPrices(solPrice, btcPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPrices'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update prices: ${error.message}`);
    },
  });
}

export function useUpdatePriceBenchmarks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ solPrice, btcPrice }: { solPrice: number; btcPrice: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePriceBenchmarks(solPrice, btcPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceBenchmarks'] });
      toast.success('Price benchmarks updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update benchmarks: ${error.message}`);
    },
  });
}

export function useRecordRewardEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: RewardEvent) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordRewardEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardHistory'] });
      toast.success('Reward event recorded');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record reward: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}
