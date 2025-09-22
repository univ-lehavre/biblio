import { Effect } from 'effect';
import { getEventsData } from './events';
import { actions, active_actions } from './actions';
import { action2option, print_title, select } from './prompt';
import { loadStores, saveStores, provideContextStore, provideEventsStore } from './store';
import type { IEventData } from './events/types';
import type { Action } from './actions/types';

const start = () =>
  Effect.gen(function* () {
    yield* loadStores();
    yield* print_title();
    yield* Effect.forever(ask());
  });

const ask = () =>
  Effect.gen(function* () {
    const events: IEventData[] = yield* getEventsData();
    const options = active_actions(events).map(action2option);
    const selected_action_value = yield* select('Que souhaitez-vous faire ?', options);
    const action: Action | undefined = actions.find(
      action => action.name === selected_action_value.toString(),
    );
    if (action) yield* action.action();
    yield* saveStores();
  });

Effect.runPromiseExit(start().pipe(provideContextStore(), provideEventsStore()));
