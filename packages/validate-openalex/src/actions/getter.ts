import { actions } from '.';
import { Store } from '../store';
import { Effect, Ref } from 'effect';

const build_actions_list = () =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const available_actions = actions
      .filter(action => action.isActive(state))
      .map(action => ({ value: action.name, label: action.name }));
    return available_actions;
  });

export { build_actions_list };
