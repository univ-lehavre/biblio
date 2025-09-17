import { Effect, Ref } from 'effect';
import type { IEntity, IField } from '../types';
import { State } from '.';

const hasPending = (entity: IEntity, field: IField, orcid?: string) =>
  Effect.gen(function* () {
    const state = yield* State;
    const current = yield* Ref.get(state);
    const events = current.events.map(item => {
      if (orcid && item.orcid !== orcid) return;
      if (item.status === 'pending' && item.entity === entity && item.field === field) return item;
    });
    return events.length > 0;
  });

export { hasPending };
