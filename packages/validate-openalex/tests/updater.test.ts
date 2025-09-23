import { updateNewEventsWithExistingMetadata } from '../src/events/updater';
import type { IEvent } from '../src/events/types';

describe('updateNewEventsWithExistingMetadata', () => {
  const baseEvent = {
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    label: 'label',
    status: 'pending',
    dataIntegrity: 'uuid-1',
    from: 'import',
    id: 'id-1',
    entity: 'author',
    field: 'display_name_alternatives',
    value: 'Valeur',
    hasBeenExtendedAt: 'never',
  } as const;

  it('returns the new event unchanged when no matching existing event', () => {
    const existing: IEvent[] = [];
    const newEvents: IEvent[] = [{ ...baseEvent, dataIntegrity: 'new-1' } as unknown as IEvent];
    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toEqual(newEvents);
  });

  it('applies hasBeenExtendedAt from existing matching event', () => {
    const existing: IEvent[] = [
      { ...baseEvent, hasBeenExtendedAt: '2021-05-01T00:00:00.000Z' } as unknown as IEvent,
    ];
    const newEvents: IEvent[] = [
      { ...baseEvent, dataIntegrity: 'new-2', hasBeenExtendedAt: 'never' } as unknown as IEvent,
    ];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0].hasBeenExtendedAt).toBe('2021-05-01T00:00:00.000Z');
  });

  it('applies status accepted/rejected from existing matching event', () => {
    const existing: IEvent[] = [{ ...baseEvent, status: 'accepted' as const } as unknown as IEvent];
    const newEvents: IEvent[] = [
      { ...baseEvent, dataIntegrity: 'new-3', status: 'pending' } as unknown as IEvent,
    ];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('accepted');
  });

  it('creates separate entries when existing contains both extended and accepted variants', () => {
    const existing: IEvent[] = [
      {
        ...baseEvent,
        dataIntegrity: 'e-extend',
        hasBeenExtendedAt: '2022-02-02T00:00:00.000Z',
        status: 'pending',
      } as unknown as IEvent,
      {
        ...baseEvent,
        dataIntegrity: 'e-accept',
        hasBeenExtendedAt: 'never',
        status: 'accepted',
      } as unknown as IEvent,
    ];
    const newEvents: IEvent[] = [
      {
        ...baseEvent,
        dataIntegrity: 'new-4',
        hasBeenExtendedAt: 'never',
        status: 'pending',
      } as unknown as IEvent,
    ];

    const updated = updateNewEventsWithExistingMetadata(existing, newEvents);
    // Expect two results: one with hasBeenExtendedAt set, one with status set
    expect(updated).toHaveLength(2);
    const hasExtended = updated.find(u => u.hasBeenExtendedAt === '2022-02-02T00:00:00.000Z');
    const hasAccepted = updated.find(u => u.status === 'accepted');
    expect(hasExtended).toBeDefined();
    expect(hasAccepted).toBeDefined();
  });
});
