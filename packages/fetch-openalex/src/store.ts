import { Effect, Ref } from 'effect';

interface APIResponse<T> {
  meta: {
    count: number;
    page: number;
    per_page: number;
  };
  results: T[];
}

interface IState {
  page: number;
  maxPages?: number;
  totalPages: number;
  fetchedItems: number;
}

const initialState: IState = {
  page: 1,
  totalPages: Infinity,
  fetchedItems: 0,
};

class Store<T> {
  constructor(private state: Ref.Ref<IState>) {}

  get page(): Effect.Effect<number, never, never> {
    return Effect.gen(this, function* () {
      const s = yield* Ref.get(this.state);
      return s.page;
    });
  }

  get current(): Effect.Effect<IState, never, never> {
    return Ref.get(this.state);
  }

  private updateTotalPages(items: APIResponse<T>): Effect.Effect<void, never, never> {
    return Ref.update(this.state, (s: IState) => ({
      ...s,
      totalPages: Math.ceil(items.meta.count / items.meta.per_page),
    }));
  }

  private updateCounts(items: APIResponse<T>): Effect.Effect<void, never, never> {
    return Ref.update(this.state, (s: IState) => ({
      ...s,
      fetchedItems: s.fetchedItems + items.results.length,
    }));
  }

  incPage(): Effect.Effect<void, never, never> {
    return Ref.update(this.state, (s: IState) => ({
      ...s,
      page: s.page + 1,
    }));
  }

  addNewItems(items: APIResponse<T>): Effect.Effect<void, never, never> {
    return Effect.gen(this, function* () {
      const s = yield* Ref.get(this.state);
      if (s.totalPages === Infinity) yield* this.updateTotalPages(items);
      yield* this.updateCounts(items);
    });
  }

  hasMorePages(): Effect.Effect<boolean, never, never> {
    return Effect.gen(this, function* () {
      const s = yield* Ref.get(this.state);
      const max = s.maxPages ?? Infinity;
      const min = Math.min(s.totalPages, max);
      return s.page <= min;
    });
  }
}

export { Store, initialState, type IState, type APIResponse };
