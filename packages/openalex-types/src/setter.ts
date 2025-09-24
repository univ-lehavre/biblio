import { Brand } from 'effect';
import type { OpenAlexID, ORCID } from './branded';

const asORCID = Brand.refined<ORCID>(
  s => s.length > 0 && s.startsWith('https://orcid.org/'),
  s => Brand.error(`Invalid ORCID format: ${s}`),
);

const asOpenAlexID = Brand.refined<OpenAlexID>(
  s => s.length > 0 && s.startsWith('https://openalex.org/'),
  s => Brand.error(`Invalid OpenAlex ID format: ${s}`),
);

export { asORCID, asOpenAlexID };
