import * as Sentry from '@sentry/browser';

import config, { getStage } from '../../../config';

export function initSentry() {
  Sentry.init({
    ...config().sentry,
    release: '{{GIT_COMMIT_HASH}}',
    environment: getStage(),
  });
}

export function setUserContext(user) {
  Sentry.configureScope(scope => {
    scope.setUser(user);
  });
}

export function setTags(tags) {
  Sentry.configureScope(scope => {
    Object.entries(tags).forEach(([key, value]) => {
      scope.setTag(key, value);
    });
  });
}

export function reportError(error, extraData = {}, bypassDialog) {
  Sentry.withScope(scope => {
    Object.entries(extraData).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });

    Sentry.captureException(error);
    if (!bypassDialog) {
      Sentry.showReportDialog();
    }
  });
}
