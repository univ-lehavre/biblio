import { actions } from '.';
import type { IEventData } from '../events/types';
import type { Action } from './types';

const active_actions = (events: IEventData[]): Action[] =>
  actions.filter(action => action.visible(events));

export { active_actions };
