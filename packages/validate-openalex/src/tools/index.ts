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
    const encoded: Uint8Array<ArrayBufferLike> = encoder.encode(str);
    const digest: string = v5(encoded, NAMESPACE);
    return digest;
  });

export { buildIntegrity };
