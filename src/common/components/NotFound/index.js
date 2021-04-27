import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import Hero from '../Hero';
import Button from '../Button';

const NotFound = () => (
  <div className="not-found">
    <Hero>
      <h1>
        <Trans i18nKey="notFound.title">Page not found</Trans>
      </h1>
      <p>
        <Trans i18nKey="notFound.subtitle">
          Oops! Looks like the page you have requested no longer exists.
        </Trans>
      </p>
      <Button type="primary">
        <Link to="/">
          <Trans i18nKey="notFound.back">Back to crypto.io</Trans>
        </Link>
      </Button>
    </Hero>
  </div>
);

export default NotFound;
