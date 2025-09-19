import { Tasks } from '.';
import { Effect, Ref } from 'effect';
import { save, Store } from '../store';
import { color, outro } from '../prompt';
import { reliable_strings, insert_new_ORCID } from './utils';

const switcher = (action_id: string) =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    switch (action_id) {
      case Tasks.ORCID:
        yield* insert_new_ORCID();
        break;
      case Tasks.AUTH_FIP:
        yield* reliable_strings(
          'Sélectionnez les formes graphiques correspondantes à ce chercheur',
          {
            orcid: state.context.id,
            entity: 'author',
            field: 'display_name_alternatives',
          },
        );
        break;
      case Tasks.AUTH_FIN:
        yield* reliable_strings('Sélectionnez les affiliations correspondantes au chercheur', {
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
