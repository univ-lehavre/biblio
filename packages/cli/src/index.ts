import { Effect, Logger, LogLevel } from 'effect';
import { note } from '@clack/prompts';
import {
  action2option,
  actions,
  active_actions,
  getAcceptedWorks,
  getAffiliations,
  getDisplayNameAlternatives,
  getEvents,
  getOpenAlexIDsBasedOnAcceptedWorks,
  getORCID,
  isAuthorContext,
  loadStores,
  print_title,
  provideContextStore,
  provideEventsStore,
  saveStores,
  select,
} from '@univ-lehavre/biblio-validate-openalex';
import type { Action, IEvent } from '@univ-lehavre/biblio-validate-openalex';
import type { OpenAlexID, ORCID } from '@univ-lehavre/biblio-openalex-types';
import { NodeRuntime } from '@effect/platform-node';
import { DevTools } from '@effect/experimental';

const start = () =>
  Effect.gen(function* () {
    yield* loadStores();
    yield* Effect.forever(ask());
  });

const dashboard = () =>
  Effect.gen(function* () {
    if (!(yield* isAuthorContext())) return;
    const orcid: ORCID = yield* getORCID();
    const events: IEvent[] = yield* getEvents();
    const acceptedWorks = getAcceptedWorks(orcid, events);
    const openalexIDs: OpenAlexID[] = getOpenAlexIDsBasedOnAcceptedWorks(orcid, events);
    const display_name_alternatives: string[] = yield* getDisplayNameAlternatives();
    const affiliations: string[] = yield* getAffiliations();
    const board: string[] = [];
    if (openalexIDs !== undefined && openalexIDs.length > 0)
      board.push(`${openalexIDs.length} identifiants OpenAlex d’auteurs`);
    if (display_name_alternatives.length > 0)
      board.push(`${display_name_alternatives.length} Display Name Alternatives`);
    if (affiliations.length > 0) board.push(`${affiliations.length} Affiliations`);
    if (openalexIDs !== undefined && acceptedWorks.length > 0)
      board.push(`${acceptedWorks.length} articles validés`);
    if (board.length > 0)
      note(board.join('\n'), 'Tableau de bord', {
        format: (line: string) => `→ ${line}`,
      });
  });

const ask = () =>
  Effect.gen(function* () {
    console.clear();
    yield* print_title();
    yield* dashboard();
    const actives: Action[] = yield* active_actions();
    const options = actives.map(action2option);
    const selected_action_value: string = (yield* select(
      'Que souhaitez-vous faire ?',
      options,
    )).toString();
    const action: Action | undefined = actions.find(
      action => action.name === selected_action_value,
    );
    if (action) {
      yield* action.action();
    } else {
      console.log('Action non trouvée');
    }
    yield* saveStores();
  });

const runnable = start().pipe(provideEventsStore(), provideContextStore());

const DevToolsLive = DevTools.layer();

runnable.pipe(
  Logger.withMinimumLogLevel(LogLevel.None),
  Effect.provide(DevToolsLive),
  NodeRuntime.runMain,
);
