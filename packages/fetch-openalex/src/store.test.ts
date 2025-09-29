import { describe, it, expect } from '@effect/vitest';
import { assertEquals, assertTrue } from '@effect/vitest/utils';
import { Effect, Ref } from 'effect';
import { initialState, Store } from './store';

interface Dummy {
  value: number;
}

describe('Store', () => {
  it('initialize', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));
      expect(store).toBeDefined();
      assertEquals(yield* store.page, 0);
    }));

  it('incPage increments the page', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));
      expect(store).toBeDefined();
      yield* store.incPage();
      assertEquals(yield* store.page, 1);
    }));

  it('addNewItems updates totalCount once and increases fetchedCount', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));

      const items = {
        meta: { count: 100, page: 1, per_page: 10 },
        results: Array.from({ length: 10 }, (_, i) => ({ value: i }) as Dummy),
      };

      yield* store.addNewItems(items);
      const state1 = yield* store.current;
      // totalCount is computed as Math.ceil(count / per_page) => 10
      assertEquals(state1.totalCount, 10);
      assertEquals(state1.fetchedCount, 10);

      const more = {
        meta: { count: 100, page: 2, per_page: 10 },
        results: Array.from({ length: 5 }, (_, i) => ({ value: i }) as Dummy),
      };
      yield* store.addNewItems(more);
      const state2 = yield* store.current;
      assertEquals(state2.totalCount, 10);
      assertEquals(state2.fetchedCount, 15);
    }));

  it('hasMorePages returns true while page <= totalPages (default Infinite)', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));
      assertTrue(yield* store.hasMorePages());
    }));
});
