import type { IEntity, IField, Status } from '../events/types';
import type { IState } from '../store/types';

interface PendingOptions {
  orcid?: string;
  entity?: IEntity;
  field?: IField;
  status?: Status;
}

interface Action {
  name: string;
  isActive: (state: IState) => boolean;
}

export type { Action, PendingOptions };
