import { Effect } from 'effect';
import { Store } from '../store';
import type { IEntity, IField, Status } from '../events/types';
import type { IState } from '../store/types';

interface PendingOptions {
  openalex_id?: string;
  orcid?: string;
  entity?: IEntity;
  field?: IField;
  status?: Status;
}

interface Action {
  name: string;
  visible: (state: IState) => boolean;
  group?: {
    name: string;
    index: number;
  };
  action: () => Effect.Effect<void, unknown, Store>;
}

export type { Action, PendingOptions };
