// Mock uniqueSorted from tools to avoid importing uuid (ESM) and control behavior
jest.mock('../src/tools', () => ({
  uniqueSorted: (arr: string[]) => Array.from(new Set(arr)).sort(),
}));

import { asOpenAlexID, asORCID } from '@univ-lehavre/biblio-openalex-types';
import { getOpenAlexIDs } from '../src/events/getter';
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
  field: 'affiliation',
  value: 'Bob',
  ...overrides,
});

describe('getOpenAlexIDs', () => {
  it('returns empty array when no matching accepted events', () => {
    const events: IEvent[] = [
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0001-0001'),
        field: 'affiliation',
        status: 'pending',
        from: asOpenAlexID('https://openalex.org/A1'),
      }),
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0001-0001'),
        field: 'display_name_alternatives',
        status: 'pending',
        from: asOpenAlexID('https://openalex.org/A1'),
      }),
    ];

    expect(getOpenAlexIDs('https://orcid.org/0000-0002-0001-0001', events)).toEqual([]);
  });

  it('returns unique sorted intersection of affiliations and display_name_alternatives with status accepted', () => {
    const events: IEvent[] = [
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0002-0002'),
        field: 'affiliation',
        status: 'accepted',
        from: asOpenAlexID('https://openalex.org/A2'),
      }),
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0002-0002'),
        field: 'affiliation',
        status: 'accepted',
        from: asOpenAlexID('https://openalex.org/A1'),
      }),
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0002-0002'),
        field: 'affiliation',
        status: 'accepted',
        from: asOpenAlexID('https://openalex.org/A2'),
      }),
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0002-0002'),
        field: 'display_name_alternatives',
        status: 'accepted',
        from: asOpenAlexID('https://openalex.org/A2'),
      }),
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0002-0002'),
        field: 'display_name_alternatives',
        status: 'accepted',
        from: asOpenAlexID('https://openalex.org/A3'),
      }),
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0002-0002'),
        field: 'affiliation',
        status: 'accepted',
        from: asOpenAlexID('https://openalex.org/A3'),
      }),
    ];

    // uniqueSorted mock sorts strings ascending
    expect(getOpenAlexIDs('https://orcid.org/0000-0002-0002-0002', events)).toEqual([
      'https://openalex.org/A2',
      'https://openalex.org/A3',
    ]);
  });

  it('ignores events for other ids or entities', () => {
    const events: IEvent[] = [
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0003-0003'),
        field: 'affiliation',
        status: 'accepted',
        from: asOpenAlexID('https://openalex.org/A1'),
      }),
      baseEvent({
        id: asORCID('https://orcid.org/0000-0002-0004-0004'),
        field: 'display_name_alternatives',
        status: 'accepted',
        from: asOpenAlexID('https://openalex.org/A1'),
      }),
      {
        ...baseEvent({
          id: asORCID('https://orcid.org/0000-0002-0003-0003'),
          field: 'display_name_alternatives',
          status: 'accepted',
          from: asOpenAlexID('https://openalex.org/A1'),
        }),
        entity: 'work',
      },
    ];

    expect(getOpenAlexIDs('https://orcid.org/0000-0002-0003-0003', events)).toEqual([]);
  });
});
