import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import DocumentTitle from 'react-document-title';

const PageTitle = ({ t, title }) => <DocumentTitle title={title || t('title')} />;

PageTitle.propTypes = {
  t: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default memo(translate()(PageTitle));
