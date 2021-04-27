/**
 * Pollyfils
 */
import 'core-js/features/array/fill';
import 'core-js/features/array/find-index';
import 'core-js/features/array/find';
import 'core-js/features/array/includes';
import 'core-js/features/array/entries';
import 'core-js/features/function/name';
import 'core-js/features/number/is-nan';
import 'core-js/features/object/entries';
import 'core-js/features/object/values';
import 'core-js/features/string/includes';

import 'react-app-polyfill/ie9';

/**
 * Init Sentry
 */
import { initSentry } from './common/services/sentry';

initSentry();

/**
 * Fix Google translate bug
 * https://github.com/facebook/react/issues/11538
 * TODO remove when https://bugs.chromium.org/p/chromium/issues/detail?id=872770 is fixed
 */
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (child.parentNode !== this) {
      if (console) {
        console.error('Cannot remove a child from a different parent', child, this);
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.error(
          'Cannot insert before a reference node from a different parent',
          referenceNode,
          this
        );
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}
