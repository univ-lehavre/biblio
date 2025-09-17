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

type IAuthorType = 'id' | 'display_name_alternatives' | 'raw_author_name' | 'institution' | 'work';

interface IAuthor {
  orcid: string;
  type: IAuthorType;
  value: string;
  label?: string;
  status: Status;
}

type IInstitutionType = 'id' | 'display_name_alternatives' | 'raw_affiliation_strings';

interface IInstitution {
  ror: string;
  type: IInstitutionType;
  value: string;
  label?: string;
  status: Status;
}

type IWorkType = 'id';

interface IWork {
  doi: string;
  type: IWorkType;
  value: string;
  label?: string;
  status: Status;
}

interface IContext {
  type: 'author' | 'institution' | 'work';
  id: string;
  label?: string;
}

interface IState {
  context?: IContext;
  authors?: IAuthor[];
  institutions?: IInstitution[];
  works?: IWork[];
}

interface Action {
  name: string;
  type: 'action' | 'task';
  isActive: (state?: IState) => boolean;
}

export type { IAuthor, IInstitution, IWork, IContext, IState, Action, Status, Values, OpenAlexID };
