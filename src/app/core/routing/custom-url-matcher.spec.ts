import { Route, UrlSegment } from '@angular/router';

import { CustomRoute } from './custom-route';
import { customUrlMatcher } from './custom-url-matcher';

function matchUrl(route: Route, url: string) {
  const segments = url.split('/').map(path => new UrlSegment(path, undefined));

  return customUrlMatcher(segments, undefined, route);
}

describe('customUrlMatcher', () => {
  it('should match if url has too many segments', () => {
    const route: CustomRoute = { customPath: 'items' };

    const match = matchUrl(route, 'items/popular');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(1);
  });

  it('should not match if url has too few segments', () => {
    const route: CustomRoute = { customPath: 'items/popular' };

    expect(matchUrl(route, 'items')).toBeNull();
  });

  it('should match literals exactly', () => {
    const route: CustomRoute = { customPath: 'items/popular' };

    const match = matchUrl(route, 'items/popular');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(2);

    expect(matchUrl(route, 'items/recent')).toBeNull();
  });

  it('should match literals exactly using any option', () => {
    const route: CustomRoute = { customPath: 'items/(popular|local)' };

    const popularMatch = matchUrl(route, 'items/popular');
    expect(popularMatch).toBeTruthy();
    expect(popularMatch.consumed.length).toBe(2);

    const localMatch = matchUrl(route, 'items/local');
    expect(localMatch).toBeTruthy();
    expect(localMatch.consumed.length).toBe(2);

    expect(matchUrl(route, 'items/recent')).toBeNull();
  });

  it('should match optional literal', () => {
    const route: CustomRoute = { customPath: 'v2?/items/popular' };

    const match = matchUrl(route, 'v2/items/popular');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(3);
  });

  it('should match missing optional literal', () => {
    const route: CustomRoute = { customPath: 'v2?/items/popular' };

    const match = matchUrl(route, 'items/popular');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(2);
  });

  it('should match optional literal at end of route', () => {
    const route: CustomRoute = { customPath: 'items/popular?' };

    const match = matchUrl(route, 'items/popular');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(2);
  });

  it('should match missing optional literal at end of route', () => {
    const route: CustomRoute = { customPath: 'items/popular?' };

    const match = matchUrl(route, 'items');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(1);
  });

  it('should match optional param', () => {
    const route: CustomRoute = { customPath: ':multiStateCode/:cityName/:postalCode?' };

    const match = matchUrl(route, 'IL/Chicago/60606');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(3);
    expect(match.posParams['multiStateCode'].path).toBe('IL');
    expect(match.posParams['cityName'].path).toBe('Chicago');
    expect(match.posParams['postalCode'].path).toBe('60606');
  });

  it('should match missing optional param', () => {
    const route: CustomRoute = { customPath: ':multiStateCode/:cityName/:postalCode?' };

    const match = matchUrl(route, 'IL/Chicago');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(2);
    expect(match.posParams['multiStateCode'].path).toBe('IL');
    expect(match.posParams['cityName'].path).toBe('Chicago');
    expect(match.posParams['postalCode']).toBeUndefined();
  });

  it('should match optional param at beginning of route', () => {
    const route: CustomRoute = { customPath: ':searchTerm?' };

    const match = matchUrl(route, 'cool-thing');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(1);
    expect(match.posParams['searchTerm'].path).toBe('cool-thing');
  });

  it('should match missing optional param at beginning of route', () => {
    const route: CustomRoute = { customPath: ':searchTerm?' };

    const match = matchUrl(route, '');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(1);
    expect(match.posParams['searchTerm'].path).toBe('');
  });

  it('should match generic param', () => {
    const route: CustomRoute = { customPath: 'items/:itemName' };

    const match = matchUrl(route, 'items/toy-car');
    expect(match).toBeTruthy();
    expect(match.consumed.length).toBe(2);
    expect(match.posParams['itemName'].path).toBe('toy-car');
  });
});
