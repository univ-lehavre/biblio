type Status = 'pending' | 'accepted' | 'rejected';

type IEntity = 'author' | 'institution' | 'work';

type IField = 'id' | 'display_name' | 'display_name_alternatives' | 'affiliation' | 'work';

interface IEventMeta {
  /** Source des données : OpenAlexID */
  from: string;
  status: Status;
  label?: string;
  dataIntegrity: string;
  createdAt: string;
  updatedAt: string;
}

interface IEventData {
  /** ORCID, ROR, DOI relatif à l'entité définie */
  id: string;
  entity: IEntity;
  field: IField;
  value: string;
}

interface IEvent extends IEventMeta, IEventData {}

export type { Status, IEvent, IEventMeta, IEventData, IField, IEntity };
