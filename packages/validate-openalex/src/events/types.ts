import type { OpenAlexID, ORCID } from '@univ-lehavre/biblio-openalex-types';

type Status = 'pending' | 'accepted' | 'rejected';

type IEntity = 'author' | 'institution' | 'work';

type IField = 'id' | 'display_name_alternatives' | 'affiliation' | 'work';

interface IEventMeta {
  createdAt: string;
  updatedAt: string;
  hasBeenExtendedAt: string | null;
  label?: string;
  status: Status;
  dataIntegrity: string;
}

interface IEventData {
  /** Source des données : OpenAlexID */
  from: OpenAlexID;
  /** ORCID, ROR, DOI relatif à l'entité définie */
  id: ORCID;
  entity: IEntity;
  field: IField;
  value: string;
}

interface IEvent extends IEventMeta, IEventData {}

export type { Status, IEvent, IEventMeta, IEventData, IField, IEntity };
