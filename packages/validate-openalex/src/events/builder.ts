import { v7 } from 'uuid';
import { IEvent, IField } from './types';

const buildEvent = (
  partial: Partial<IEvent> & {
    orcid: string;
    entity: string;
    field: string;
    value: string;
    label?: string;
    status: string;
  },
): IEvent => ({
  uuid: v7(),
  orcid: partial.orcid,
  entity: partial.entity,
  field: partial.field,
  value: partial.value,
  label: partial.label,
  status: partial.status,
  updated_at: new Date().toISOString(),
});

const buildPendingAuthorEvent = (
  partial: Partial<IEvent> & { orcid: string; field: IField; value: string; label?: string },
): IEvent =>
  buildEvent({
    ...partial,
    orcid: partial.orcid,
    entity: 'author',
    field: partial.field,
    value: partial.value,
    label: partial.label,
    status: 'pending',
  });

export { buildEvent, buildPendingAuthorEvent };
