import { updateNewEventsWithExistingMetadata } from '../src/events/update2';
import type { IEvent } from '../src/events/types';

const baseEvent = (overrides: Partial<IEvent> = {}): IEvent => ({
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  hasBeenExtendedAt: 'never',
  label: undefined,
  status: 'pending',
  dataIntegrity: 'uuid-1',
  from: 'openalex',
  id: 'ORCID:0000-0000-0000-0000',
  entity: 'author',
  field: 'display_name_alternatives',
  value: 'Example',
  ...overrides,
});

describe('updateNewEventsWithExistingMetadata', () => {
  it('returns the new event unchanged when there is no matching existing event', () => {
    const existing: IEvent[] = [baseEvent({ id: 'ORCID:1' })];
    const newEvents: IEvent[] = [baseEvent({ id: 'ORCID:2' })];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0]).toEqual(newEvents[0]);
  });

  it('copies hasBeenExtendedAt from existing when present', () => {
    const existing: IEvent[] = [
      baseEvent({ id: 'ORCID:2', hasBeenExtendedAt: '2025-02-02T00:00:00.000Z' }),
    ];
    const newEvents: IEvent[] = [baseEvent({ id: 'ORCID:2', hasBeenExtendedAt: 'never' })];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0].hasBeenExtendedAt).toBe('2025-02-02T00:00:00.000Z');
  });

  it('copies status accepted from existing when present', () => {
    const existing: IEvent[] = [baseEvent({ id: 'ORCID:2', status: 'accepted' })];
    const newEvents: IEvent[] = [baseEvent({ id: 'ORCID:2', status: 'pending' })];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('accepted');
  });

  it('copies status rejected from existing when present', () => {
    const existing: IEvent[] = [baseEvent({ id: 'ORCID:2', status: 'rejected' })];
    const newEvents: IEvent[] = [baseEvent({ id: 'ORCID:2', status: 'pending' })];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('rejected');
  });

  it('creates separate entries when existing contains both extended and accepted variants', () => {
    const existing: IEvent[] = [
      baseEvent({
        id: 'ORCID:2',
        hasBeenExtendedAt: '2022-02-02T00:00:00.000Z',
        dataIntegrity: 'e-extend',
      }),
      baseEvent({ id: 'ORCID:2', status: 'accepted', dataIntegrity: 'e-accept' }),
    ];
    const newEvents: IEvent[] = [baseEvent({ id: 'ORCID:2', dataIntegrity: 'new-4' })];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    // Expect two results: one with hasBeenExtendedAt set, one with status set
    expect(updated).toHaveLength(1);
    const hasUpdated = updated.find(
      u =>
        u.id === 'ORCID:2' &&
        u.hasBeenExtendedAt === '2022-02-02T00:00:00.000Z' &&
        u.status === 'accepted' &&
        u.dataIntegrity === 'new-4',
    );
    expect(hasUpdated).toBeDefined();
  });
});
