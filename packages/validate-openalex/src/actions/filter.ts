import { Effect } from 'effect';
import { actions } from '.';
import { ContextStore, EventsStore } from '../store';
import type { Action } from './types';

const active_actions = (): Effect.Effect<Action[], unknown, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const items: Action[] = [];
    for (const action of actions) {
      if (!action.visible) {
        items.push(action);
      } else {
        const visible = yield* action.visible();
        if (visible) items.push(action);
      }
    }
    return items;
  });

export { active_actions };
