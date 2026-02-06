import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { serializeComposition, deserializeComposition } from '../audio/serializeComposition';
import type { CompositionState } from '../audio/audioTypes';
import type { CompositionId } from '../backend';

export function useListCompositions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['compositions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCompositions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveComposition() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, composition }: { name: string; composition: CompositionState }) => {
      if (!actor) throw new Error('Actor not available');
      const data = serializeComposition(composition);
      return actor.saveComposition(name, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
    },
  });
}

export function useLoadComposition() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: CompositionId) => {
      if (!actor) throw new Error('Actor not available');
      const data = await actor.loadComposition(id);
      return deserializeComposition(data);
    },
  });
}

export function useDeleteComposition() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: CompositionId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComposition(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
    },
  });
}
