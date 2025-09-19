import type { Status } from './events/types';

interface Values {
  value: string;
  status: Status;
}

interface OpenAlexID {
  id: string;
  label: string;
  status: Status;
}

export type { Values, OpenAlexID };
export { type ConfigError } from 'effect/ConfigError';
