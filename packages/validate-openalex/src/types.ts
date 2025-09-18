export { type ConfigError } from 'effect/ConfigError';

type Status = 'pending' | 'accepted' | 'rejected';

interface Values {
  value: string;
  status: Status;
}

interface OpenAlexID {
  id: string;
  label: string;
  status: Status;
}

type IEntity = 'author' | 'institution' | 'work';
type IField = 'id' | 'display_name' | 'display_name_alternatives' | 'institution' | 'work';

interface IEvent {
  uuid: string;
  orcid?: string;
  entity: IEntity;
  field: IField;
  value: string;
  label?: string;
  status: Status;
}

interface IContext {
  type: IEntity | 'none';
  id: string | undefined;
  label?: string;
}

interface IState {
  context: IContext;
  events: IEvent[];
}

interface Action {
  name: string;
  isActive: (state: IState) => boolean;
}

export type { IContext, IState, Action, Status, Values, OpenAlexID, IEvent, IField, IEntity };
