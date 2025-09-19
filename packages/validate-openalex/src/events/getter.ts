import type { PendingOptions } from '../actions/types';
import type { IState } from '../store/types';
import type { IEvent } from './types';

const filtered_list_by_attributes = (state: IState, opts: PendingOptions): IEvent[] =>
  state.events
    .map(item => {
      if (opts.status && item.status !== opts.status) return;
      if (opts.orcid && item.orcid !== opts.orcid) return;
      if (opts.entity && item.entity !== opts.entity) return;
      if (opts.field && item.field !== opts.field) return;
      return item;
    })
    .filter(item => item !== undefined);

const listPending = (state: IState, opts: PendingOptions): IEvent[] =>
  filtered_list_by_attributes(state, {
    ...opts,
    status: 'pending',
  });

export { listPending };
