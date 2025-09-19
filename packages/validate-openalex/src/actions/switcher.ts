import { Tasks } from '.';
import { Effect, Ref } from 'effect';
import { save, Store } from '../store';
import { color, outro } from '../prompt';
import { set_ORCID, setStatus } from './utils';

const switcher = (action_id: string) =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    switch (action_id) {
      case Tasks.ORCID:
        yield* set_ORCID();
        break;
      case Tasks.FIP:
        yield* setStatus('Sélectionnez les formes graphiques correspondantes à ce chercheur', {
          orcid: state.context.id,
          entity: 'author',
          field: 'display_name_alternatives',
        });
        break;
      case Tasks.FIN:
        yield* setStatus('Sélectionnez les affiliations correspondantes au chercheur', {
          orcid: state.context.id,
          entity: 'author',
          field: 'affiliation',
        });
        break;
      case Tasks.EXIT:
        yield* save();
        outro(`${color.bgGreen(color.black(` Fin `))}`);
        process.exit(0);
    }
  });

export { switcher };
