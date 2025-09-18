import { IEntity, IField } from '../types';

interface PendingOptions {
  orcid?: string;
  entity?: IEntity;
  field?: IField;
}

export type { PendingOptions };
