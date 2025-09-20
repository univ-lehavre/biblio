type Status = 'pending' | 'accepted' | 'rejected';

type IEntity = 'author' | 'institution' | 'work';

type IField = 'id' | 'display_name' | 'display_name_alternatives' | 'affiliation' | 'work';

interface IEvent {
  meta: {
    uuid: string;
    label?: string;
    status: Status;
    created_at: string;
    updated_at: string;
  };
  data: {
    official_id: string;
    openalex_id: string;
    entity: IEntity;
    field: IField;
    value: string;
  };
}

export type { Status, IEvent, IField, IEntity };
