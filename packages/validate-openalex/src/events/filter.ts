import type { PendingOptions } from '../actions/types';
import type { IState } from '../store/types';
import type { IEvent } from './types';

const filtered_list_by_attributes = (state: IState, opts: Partial<IEvent>): IEvent[] =>
  state.events
    .map(item => {
      if (opts.openalex_id && item.openalex_id !== opts.openalex_id) return;
      if (opts.status && item.status !== opts.status) return;
      if (opts.orcid && item.orcid !== opts.orcid) return;
      if (opts.entity && item.entity !== opts.entity) return;
      if (opts.field && item.field !== opts.field) return;
      return item;
    })
    .filter(item => item !== undefined);

const filter_pending = (state: IState, opts: PendingOptions): IEvent[] =>
  filtered_list_by_attributes(state, {
    ...opts,
    status: 'pending',
  });

const author_display_name_alternatives_accepted = (state: IState): IEvent[] =>
  filtered_list_by_attributes(state, {
    orcid: state.context.id,
    entity: 'author',
    field: 'display_name_alternatives',
    status: 'accepted',
  });

export { filtered_list_by_attributes, filter_pending, author_display_name_alternatives_accepted };
