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
  totalPages: number;
  fetchedCount: number;
  totalCount: number;
}

const initialState: IState = {
  page: 0,
  totalPages: Infinity,
  fetchedCount: 0,
  totalCount: Infinity,
};

class Store<T> {
  constructor(private state: Ref.Ref<IState>) {}

  get page(): Effect.Effect<number, never, never> {
    return Effect.gen(function* (this: Store<T>) {
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
      totalCount: Math.ceil(items.meta.count / items.meta.per_page),
    }));
  }

  private updateCounts(items: APIResponse<T>): Effect.Effect<void, never, never> {
    return Ref.update(this.state, (s: IState) => ({
      ...s,
      fetchedCount: s.fetchedCount + items.results.length,
    }));
  }

  incPage(): Effect.Effect<void, never, never> {
    return Ref.update(this.state, (s: IState) => ({
      ...s,
      page: s.page + 1,
    }));
  }

  addNewItems(items: APIResponse<T>): Effect.Effect<void, never, never> {
    return Effect.gen(function* (this: Store<T>) {
      const s = yield* Ref.get(this.state);
      if (s.totalCount === Infinity) yield* this.updateTotalPages(items);
      yield* this.updateCounts(items);
    });
  }

  hasMorePages(): Effect.Effect<boolean, never, never> {
    return Effect.gen(function* (this: Store<T>) {
      const s = yield* Ref.get(this.state);
      return s.page <= s.totalPages;
    });
  }
}

export { Store, initialState, type IState, type APIResponse };
