import type { IEvent, IState } from '../types';
import { PendingOptions } from './types';

const listPending = (state: IState, opts: PendingOptions): IEvent[] => {
  const events = state.events
    .map(item => {
      if (item.status !== 'pending') return;
      if (opts.orcid && item.orcid !== opts.orcid) return;
      if (opts.entity && item.entity !== opts.entity) return;
      if (opts.field && item.field !== opts.field) return;
      return item;
    })
    .filter(item => item !== undefined);
  return events;
};

const hasPending = (state: IState, opts: PendingOptions): boolean => {
  const events = listPending(state, opts);
  return events.length > 0;
};

export { hasPending, listPending };
