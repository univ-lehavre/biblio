import type { Action } from '../actions/types';
import type { IEvent } from '../events/types';
import type { Option } from './types';

const action2option = (action: Action): Option<string> => ({ value: action.name });

const event2option = (event: IEvent): Option<string> => ({
  value: event.value,
  label: event.label,
});

const string2option = (value: string): Option<string> => ({ value });

const strings2options = (strings: string[]): Option<string>[] => strings.map(string2option);

export { strings2options, string2option, action2option, event2option };
