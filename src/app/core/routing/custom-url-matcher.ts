import { UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';

import { CustomRoute } from './custom-route';

interface UrlSegmentMatch {
  isMatch: boolean;
  paramName?: string;
}

export function customUrlMatcher(segments: UrlSegment[], segmentGroup: UrlSegmentGroup, route: CustomRoute) {
  const parts = route.customPath.split('/');
  const params: { [key: string]: UrlSegment } = {};
  const consumed: UrlSegment[] = [];

  let s = 0;
  for (const part of parts) {
    const current = segments[s];

    if (!current && !part.endsWith('?')) {
      return null;
    }

    const match = matchSegment(part, current);

    if (match && match.isMatch === false) {
      return null;
    }

    if (match && match.paramName && current) {
      params[match.paramName] = current;
    }

    if (match && current) {
      s++;
      consumed.push(current);
    }
  }

  const isIncompleteMatch = route.pathMatch === 'full' && (segmentGroup.hasChildren() || consumed.length < segments.length);
  return (isIncompleteMatch ? null : { consumed, posParams: params }) as UrlMatchResult;
}

function matchSegment(part: string, current: UrlSegment) {
  const isParam = part.startsWith(':');

  return isParam ? matchParam(part) : matchLiteral(part, current);
}

function matchLiteral(part: string, current: UrlSegment) {
  const optional = part.endsWith('?');
  part = optional ? part.substr(0, part.length - 1) : part;
  const optionsMatch = part.match(/^\((.+)\)$/);
  const literals = optionsMatch ? optionsMatch[1].split('|') : [part];
  const isMatch = current && literals.some(literal => literal === current.path);

  const match: UrlSegmentMatch = optional ? (isMatch ? { isMatch } : undefined) : { isMatch };
  return match;
}

function matchParam(part: string) {
  const optional = part.endsWith('?');
  const paramName = optional ? part.substr(1, part.length - 2) : part.substr(1);

  const isMatch = true;

  const match: UrlSegmentMatch = optional ? (isMatch ? { isMatch, paramName } : undefined) : { isMatch, paramName };
  return match;
}
