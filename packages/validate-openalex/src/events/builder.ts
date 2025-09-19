import { v7 } from 'uuid';
import type { IEvent, IField } from './types';
import { AuthorsResult } from '../fetch/types';

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

const create_events_from_author_results = (orcid: string, authors: AuthorsResult[]): IEvent[] => {
  const items: IEvent[] = [];

  authors.forEach(author => {
    items.push(
      buildPendingAuthorEvent({ orcid, field: 'display_name', value: author.display_name }),
    );
    items.push(buildPendingAuthorEvent({ orcid, field: 'id', value: author.id }));
  });

  authors
    .flatMap(author => author.display_name_alternatives ?? [])
    .forEach(alternative =>
      items.push(
        buildPendingAuthorEvent({
          orcid,
          field: 'display_name_alternatives',
          value: alternative,
        }),
      ),
    );

  authors
    .flatMap(author => author.affiliations ?? [])
    .flatMap(aff => [aff.institution])
    .forEach(institution =>
      items.push(
        buildPendingAuthorEvent({
          orcid,
          field: 'affiliation',
          value: institution.id,
          label: institution.display_name,
        }),
      ),
    );

  return items;
};

export { buildEvent, buildPendingAuthorEvent, create_events_from_author_results };
