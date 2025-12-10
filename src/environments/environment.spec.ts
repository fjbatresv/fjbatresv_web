import { environment as devEnvironment } from './environment';
import { environment as prodEnvironment } from './environment.prod';

describe('environment configs', () => {
  it('defines development defaults', () => {
    expect(devEnvironment.production).toBeFalse();
    expect(devEnvironment.sentryDsn).toBeDefined();
  });

  it('defines production defaults', () => {
    expect(prodEnvironment.production).toBeTrue();
    expect(prodEnvironment.sentryDsn).toBeDefined();
  });
});
