import { Effect, Ref } from 'effect';
import { IEvent } from '../events/types';
import { MetricsStore } from '../store';

export const getMetrics = (): Effect.Effect<IEvent[], never, MetricsStore> =>
  Effect.gen(function* () {
    const store: Ref.Ref<IEvent[]> = yield* MetricsStore;
    const metrics: IEvent[] = yield* Ref.get(store) ?? [];
    return metrics;
  });
