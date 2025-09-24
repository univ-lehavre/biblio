import { v5 } from 'uuid';
import { Effect } from 'effect';
import { TextEncoder } from 'util';
import { getContext } from '../context';
import { ContextStore } from '../store';
import stringify from 'json-stable-stringify';

const buildIntegrity = (data: unknown): Effect.Effect<string, never, ContextStore> =>
  Effect.gen(function* () {
    const NAMESPACE: string = (yield* getContext()).NAMESPACE;
    const str: string = stringify(data) ?? '';
    const encoder: TextEncoder = new TextEncoder();
    const encoded: Uint8Array = encoder.encode(str);
    const digest: string = v5(encoded, NAMESPACE);
    return digest;
  });

// Une fonction prenant un string[] et retournant un tableau avec des chaînes uniques et triées
const uniqueSorted = (values: string[]): string[] => {
  if (values.length === 0) return [];
  const unique: string[] = Array.from(new Set(values));
  return unique.sort();
};

export { buildIntegrity, uniqueSorted };
