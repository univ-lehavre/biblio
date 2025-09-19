import { filter_pending } from './filter';
import type { PendingOptions } from '../actions/types';
import type { IState } from '../store/types';

const hasPending = (state: IState, opts: PendingOptions): boolean =>
  filter_pending(state, opts).length > 0;

const hasORCID = (state: IState, orcid: string): boolean =>
  state.events.some(e => e.orcid === orcid);

export { hasPending, hasORCID };
