import type { IEntity, IField, IState } from '../types';

interface HasPendingOptions {
  orcid?: string;
  entity?: IEntity;
  field?: IField;
}

const hasPending = (state: IState, opts: HasPendingOptions): boolean => {
  const events = state.events
    .map(item => {
      if (item.status !== 'pending') return;
      if (opts.orcid && item.orcid !== opts.orcid) return;
      if (opts.entity && item.entity !== opts.entity) return;
      if (opts.field && item.field !== opts.field) return;
      return item;
    })
    .filter(item => item !== undefined);
  return events.length > 0;
};

export { hasPending };
