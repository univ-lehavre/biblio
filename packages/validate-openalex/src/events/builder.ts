import { v5 } from 'uuid';
import type { IEvent, IField } from './types';
import { AuthorsResult } from '../fetch/types';
import stringify from 'json-stable-stringify';

const NAMESPACE = '66cb0f35-b38d-4d37-8cc4-f2c9eb2d1071';

const uuid = (event: Partial<IEvent>): string => {
  const str = stringify(event.data);
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const digest = v5(data, NAMESPACE);
  return digest;
};

const buildEvent = (
  partial: Partial<IEvent> & {
    meta: {
      label?: string;
      status: string;
    }
    data: {
      openalex_id: string;
      official_id: string;
      entity: string;
      field: string;
      value: string;
    }
  },
): IEvent => ({
  meta: {
    uuid: uuid(partial),
    label: partial.meta.label,
    status: partial.meta.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  data: {
    openalex_id: partial.data.openalex_id,
    official_id: partial.data.official_id,
    entity: partial.data.entity,
    field: partial.data.field,
    value: partial.data.value,
  }
});

const buildPendingAuthorEvent = (
  partial: Partial<IEvent> & {
    openalex_id: string;
  field: partial.field,
  value: partial.value,
  label: partial.label,
  status: partial.status,
  updated_at: new Date().toISOString(),
});

const buildPendingAuthorEvent = (
  partial: Partial<IEvent> & {
    openalex_id: string;
    orcid: string;
    field: IField;
    value: string;
    label?: string;
  },
): IEvent =>
  buildEvent({
    ...partial,
    openalex_id: partial.openalex_id,
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
    const openalex_id = author.id;
    items.push(
      buildPendingAuthorEvent({
        openalex_id,
        orcid,
        field: 'id',
        value: openalex_id,
        label: author.display_name,
      }),
    );
    items.push(
      buildPendingAuthorEvent({
        openalex_id,
        orcid,
        field: 'display_name',
        value: author.display_name,
      }),
    );
    author.display_name_alternatives?.forEach(alternative =>
      items.push(
        buildPendingAuthorEvent({
          openalex_id,
          orcid,
          field: 'display_name_alternatives',
          value: alternative,
        }),
      ),
    );
  });

  authors.forEach(author => {
    const openalex_id = author.id;
    author.affiliations
      .flatMap(aff => [aff.institution])
      .forEach(institution =>
        items.push(
          buildPendingAuthorEvent({
            openalex_id,
            orcid,
            field: 'affiliation',
            value: institution.id,
            label: institution.display_name,
          }),
        ),
      );
  });

  return items;
};

export { buildEvent, buildPendingAuthorEvent, create_events_from_author_results };
