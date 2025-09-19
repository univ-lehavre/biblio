import { actions } from '.';
import { IState } from '../store/types';
import { Action } from './types';

const active_actions = (state: IState): Action[] =>
  actions.filter(action => action.isActive(state));

export { active_actions };
