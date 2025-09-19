import { hasPending } from '../events';
import { IEntity, IField } from '../events/types';
import { IContextType, IState } from '../store/types';

const isVisible = (state: IState, context: IContextType, entity: IEntity, field: IField) =>
  state.context.type === context &&
  hasPending(state, {
    orcid: state.context.id,
    entity,
    field,
  });

export { isVisible };
