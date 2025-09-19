type Status = 'pending' | 'accepted' | 'rejected';

type IEntity = 'author' | 'institution' | 'work';

type IField = 'id' | 'display_name' | 'display_name_alternatives' | 'affiliation' | 'work';

interface IEvent {
  uuid: string;
  orcid?: string;
  entity: IEntity;
  field: IField;
  value: string;
  label?: string;
  status: Status;
  updated_at: string;
}

export type { Status, IEvent, IField, IEntity };
