import { listPending } from './getter';
import type { PendingOptions } from '../actions/types';
import type { IState } from '../store/types';

const hasPending = (state: IState, opts: PendingOptions): boolean =>
  listPending(state, opts).length > 0;

export { hasPending };
