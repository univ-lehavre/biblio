import { uniqueSorted } from '../tools';
import type { OpenAlexID, ORCID } from '@univ-lehavre/biblio-openalex-types';
import type { IEvent, Status } from './types';

/**
 * Return the intersection of two string arrays.
 *
 * The result contains values from `arr1` that are also present in `arr2`.
 * The order of items in the returned array follows the order in `arr1`.
 * Comparison is done with strict equality (case-sensitive).
 *
 * This function is non-mutating: input arrays are not modified.
 *
 * @param arr1 - The array whose elements are filtered by membership in `arr2`.
 * @param arr2 - The array used to test membership of `arr1`'s elements.
 * @returns A new array containing the elements present in both `arr1` and `arr2`.
 *
 * @example
 * // returns ['b', 'c']
 * intersect(['a', 'b', 'c'], ['b', 'c', 'd']);
 */
const intersect = <T>(arr1: T[], arr2: T[]): T[] => {
  const set2 = new Set(arr2);
  return arr1.filter(value => set2.has(value));
};

/**
 * Extract OpenAlex IDs for an author identified by an ORCID from a set of events.
 *
 * This function:
 * 1. Filters `events` for accepted `author` affiliation entries whose `id` matches the provided `orcid`
 *    and collects their `from` values into `affiliations`.
 * 2. Filters `events` for accepted `author` display name alternatives entries whose `id` matches the provided `orcid`
 *    and collects their `from` values into `display_name_alternatives`.
 * 3. Computes the intersection of those two collections.
 * 4. If the intersection is non-empty, returns the result deduplicated and sorted via `uniqueSorted`.
 *    Otherwise, returns an empty array.
 *
 * Notes:
 * - Matching uses strict equality for `id`, `entity`, `field`, and `status` (case-sensitive).
 * - Relies on the `IEvent` shape to contain `id`, `entity`, `field`, `status`, and `from` properties.
 * - `uniqueSorted` is used to deduplicate and sort the intersection before returning.
 *
 * @param orcid - The ORCID identifier for the author to look up.
 * @param events - An array of events to search through.
 * @returns An array of OpenAlex IDs (strings) that appear both as accepted affiliations and
 *          as accepted display name alternatives for the given author ORCID. Returns [] if none found.
 *
 * @example
 * // returns ['A1', 'A2'] if both appear in accepted affiliation and display_name_alternatives events
 * getOpenAlexIDs('0000-0001-2345-6789', events);
 */
const getOpenAlexIDs = (orcid: ORCID, events: IEvent[]): OpenAlexID[] => {
  if (events.length === 0) return [];

  const affiliations = events
    .filter(
      e =>
        e.id === orcid &&
        e.entity === 'author' &&
        e.field === 'affiliation' &&
        e.status === 'accepted',
    )
    .map(e => e.from);

  const display_name_alternatives = events
    .filter(
      e =>
        e.id === orcid &&
        e.entity === 'author' &&
        e.field === 'display_name_alternatives' &&
        e.status === 'accepted',
    )
    .map(e => e.from);

  const intersection = intersect<OpenAlexID>(affiliations, display_name_alternatives);

  const uniques = uniqueSorted<OpenAlexID>(intersection);

  return uniques;
};

const getAcceptedWorks = (
  orcid: ORCID,
  events: IEvent[],
): {
  id: string;
  title: string | undefined;
}[] => {
  if (events.length === 0) return [];
  const works: {
    id: string;
    title: string | undefined;
  }[] = events
    .filter(
      e => e.id === orcid && e.entity === 'work' && e.field === 'id' && e.status === 'accepted',
    )
    .map(e => ({ id: e.value, title: e.label }));
  return works;
};

const getOpenAlexIDsBasedOnAcceptedWorks = (orcid: ORCID, events: IEvent[]): OpenAlexID[] => {
  if (events.length === 0) return [];
  const works: OpenAlexID[] = events
    .filter(
      e => e.id === orcid && e.entity === 'work' && e.field === 'id' && e.status === 'accepted',
    )
    .map(e => e.from);
  const uniques: OpenAlexID[] = uniqueSorted<OpenAlexID>(works);
  return uniques;
};

const getStatusOfAuthorDisplayNameAlternative = (
  name: string,
  orcid: string,
  events: IEvent[],
): Status | undefined => {
  const event = events.find(
    e =>
      e.id === orcid &&
      e.entity === 'author' &&
      e.field === 'display_name_alternatives' &&
      e.value === name,
  );
  return event?.status;
};

const getStatusOfAffiliation = (
  institutionID: string,
  orcid: string,
  events: IEvent[],
): Status | undefined => {
  const event = events.find(
    e =>
      e.id === orcid &&
      e.entity === 'author' &&
      e.field === 'affiliation' &&
      e.value === institutionID,
  );
  return event?.status;
};

const existsAcceptedAuthorDisplayNameAlternative = (
  name: string,
  orcid: string,
  events: IEvent[],
): boolean => {
  const event = events.find(
    e =>
      e.id === orcid &&
      e.entity === 'author' &&
      e.field === 'display_name_alternatives' &&
      e.value === name &&
      e.status === 'accepted',
  );
  return event !== undefined;
};

export {
  getOpenAlexIDs,
  existsAcceptedAuthorDisplayNameAlternative,
  getStatusOfAuthorDisplayNameAlternative,
  getStatusOfAffiliation,
  getOpenAlexIDsBasedOnAcceptedWorks,
  getAcceptedWorks,
};
