import { describe, it, expect } from '@effect/vitest';
import { assertEquals, assertTrue } from '@effect/vitest/utils';
import { Effect, Ref } from 'effect';
import { initialState, Store } from './store';

interface Dummy {
  value: number;
}

describe('Store', () => {
  it.effect('can initialize and has "page" and "current" attributes', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));
      expect(store).toBeDefined();
      const page = yield* store.page;
      assertEquals(page, 0);
      const state = yield* store.current;
      assertEquals(state.page, 0);
      assertEquals(state.totalPages, Infinity);
      assertEquals(state.fetchedItems, 0);
    }),
  );

  it.effect('incPage increments the page', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));
      expect(store).toBeDefined();
      yield* store.incPage();
      const state = yield* store.current;
      assertEquals(state.page, 1);
    }),
  );

  it.effect('addNewItems updates totalPages once and increases fetchedItems', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));

      const items = {
        meta: { count: 250, page: 1, per_page: 10 },
        results: Array.from({ length: 10 }, (_, i) => ({ value: i }) as Dummy),
      };

      yield* store.addNewItems(items);
      const state1 = yield* store.current;

      assertEquals(state1.totalPages, 25);
      assertEquals(state1.fetchedItems, 10);

      const more = {
        meta: { count: 150, page: 2, per_page: 10 },
        results: Array.from({ length: 5 }, (_, i) => ({ value: i }) as Dummy),
      };
      yield* store.addNewItems(more);
      const state2 = yield* store.current;
      assertEquals(state2.totalPages, 25);
      assertEquals(state2.fetchedItems, 15);
    }),
  );

  it.effect('hasMorePages returns true while page <= totalPages (default Infinite)', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));
      const hasMore = yield* store.hasMorePages();
      assertTrue(hasMore);
    }),
  );

  it.effect('does not overwrite totalCount after it has been computed once', () =>
    Effect.gen(function* () {
      const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));

      const first = {
        meta: { count: 100, page: 1, per_page: 10 },
        results: Array.from({ length: 10 }, (_, i) => ({ value: i }) as Dummy),
      };

      const second = {
        meta: { count: 50, page: 2, per_page: 10 },
        results: Array.from({ length: 5 }, (_, i) => ({ value: i }) as Dummy),
      };

      yield* store.addNewItems(first);

      yield* store.addNewItems(second);

      const state = yield* store.current;
      assertEquals(state.totalPages, 10);
      assertEquals(state.fetchedItems, 15);
    }),
  );

  it.effect('hasMorePages respects a finite totalPages and flips after incPage', () =>
    Effect.gen(function* () {
      const ref = yield* Ref.make({ page: 2, totalPages: 2, fetchedItems: 0 });
      const store = new Store<Dummy>(ref);

      assertTrue(yield* store.hasMorePages());

      yield* store.incPage();
      const state = yield* store.current;
      assertEquals(state.page, 3);
      assertEquals(state.totalPages, 2);
      assertEquals(state.fetchedItems, 0);
      const hasMore = yield* store.hasMorePages();
      assertEquals(hasMore, false);
    }),
  );

  it.effect(
    'concurrent updates (addNewItems + incPage) run in parallel and result is consistent',
    () =>
      Effect.gen(function* () {
        const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<Dummy>(s));

        const itemsA = {
          meta: { count: 100, page: 1, per_page: 10 },
          results: Array.from({ length: 10 }, (_, i) => ({ value: i }) as Dummy),
        };

        const itemsB = {
          meta: { count: 100, page: 2, per_page: 10 },
          results: Array.from({ length: 5 }, (_, i) => ({ value: i }) as Dummy),
        };

        const fiber1 = yield* Effect.fork(store.addNewItems(itemsA));
        const fiber3 = yield* Effect.fork(store.addNewItems(itemsB));
        const fiber2 = yield* Effect.fork(store.incPage());
        const fiber4 = yield* Effect.fork(store.incPage());
        yield* Effect.all([fiber1, fiber2, fiber3, fiber4]);

        const finalState = yield* store.current;

        assertEquals(finalState.totalPages, 10);

        assertEquals(finalState.fetchedItems, 15);

        assertEquals(finalState.page, 2);
      }),
  );
});
