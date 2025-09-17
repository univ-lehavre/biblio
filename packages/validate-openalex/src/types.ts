export { type ConfigError } from 'effect/ConfigError';

type Status = 'pending' | 'resolved' | 'rejected';

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
  /**
   * L’ORCID est présent si l’entité est liée au chercheur : une affiliation ou une publication.
   */
  orcid?: string;
  entity: IEntity;
  field: IField;
  value: string;
  label?: string;
  status: Status;
}

interface IContext {
  type: IEntity | 'none';
  id: string | null;
  label?: string;
}

interface IState {
  context: IContext;
  events: IEvent[];
}

interface Action {
  name: string;
  isActive?: (state: IState) => boolean;
}

export type { IContext, IState, Action, Status, Values, OpenAlexID, IEvent, IField, IEntity };
