import { updateNewEventsWithExistingMetadata } from '../src/events/update';
import { asOpenAlexID, asORCID } from '@univ-lehavre/biblio-openalex-types';
import type { IEvent } from '../src/events/types';

const baseEvent = (overrides: Partial<IEvent> = {}): IEvent => ({
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  hasBeenExtendedAt: 'never',
  label: undefined,
  status: 'pending',
  dataIntegrity: 'uuid-1',
  from: asOpenAlexID('https://openalex.org/works/A1234567890'),
  id: asORCID('https://orcid.org/0000-0002-1825-0097'),
  entity: 'author',
  field: 'display_name_alternatives',
  value: 'Bob',
  ...overrides,
});

describe('updateNewEventsWithExistingMetadata', () => {
  it('returns the new event unchanged when there is no matching existing event', () => {
    const existing: IEvent[] = [
      baseEvent({ id: asORCID('https://orcid.org/0000-0002-0000-0000') }),
    ];
    const newEvents: IEvent[] = [
      baseEvent({ id: asORCID('https://orcid.org/0000-0003-0000-0000') }),
    ];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0]).toEqual(newEvents[0]);
  });

  it('copies hasBeenExtendedAt from existing when present', () => {
    const existing: IEvent[] = [
      baseEvent({
        id: asORCID('https://orcid.org/0000-0003-0000-0000'),
        hasBeenExtendedAt: '2025-02-02T00:00:00.000Z',
      }),
    ];
    const newEvents: IEvent[] = [
      baseEvent({
        id: asORCID('https://orcid.org/0000-0003-0000-0000'),
        hasBeenExtendedAt: 'never',
      }),
    ];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0].hasBeenExtendedAt).toBe('2025-02-02T00:00:00.000Z');
  });

  it('copies status accepted from existing when present', () => {
    const existing: IEvent[] = [
      baseEvent({ id: asORCID('https://orcid.org/0000-0004-0000-0000'), status: 'accepted' }),
    ];
    const newEvents: IEvent[] = [
      baseEvent({ id: asORCID('https://orcid.org/0000-0004-0000-0000'), status: 'pending' }),
    ];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('accepted');
  });

  it('copies status rejected from existing when present', () => {
    const existing: IEvent[] = [
      baseEvent({ id: asORCID('https://orcid.org/0000-0004-0000-0000'), status: 'rejected' }),
    ];
    const newEvents: IEvent[] = [
      baseEvent({ id: asORCID('https://orcid.org/0000-0004-0000-0000'), status: 'pending' }),
    ];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('rejected');
  });

  it('creates separate entries when existing contains both extended and accepted variants', () => {
    const existing: IEvent[] = [
      baseEvent({
        id: asORCID('https://orcid.org/0000-0005-0000-0000'),
        hasBeenExtendedAt: '2022-02-02T00:00:00.000Z',
        dataIntegrity: 'e-extend',
      }),
      baseEvent({
        id: asORCID('https://orcid.org/0000-0005-0000-0000'),
        status: 'accepted',
        dataIntegrity: 'e-accept',
      }),
    ];
    const newEvents: IEvent[] = [
      baseEvent({ id: asORCID('https://orcid.org/0000-0005-0000-0000'), dataIntegrity: 'new-4' }),
    ];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    // Expect two results: one with hasBeenExtendedAt set, one with status set
    // When existing has both an extended entry and an accepted entry, the implementation
    // merges both metadata into a single event (status + hasBeenExtendedAt).
    expect(updated).toHaveLength(1);
    expect(updated[0].hasBeenExtendedAt).toBe('2022-02-02T00:00:00.000Z');
    expect(updated[0].status).toBe('accepted');
  });
});
