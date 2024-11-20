import { PARTIAL_APP_STATES_KEY } from '../app-states.constants';

/**
 * @publicApi
 */
export function getRegistrationToken(config: Record<string, any>) {
  return config[PARTIAL_APP_STATES_KEY];
}
