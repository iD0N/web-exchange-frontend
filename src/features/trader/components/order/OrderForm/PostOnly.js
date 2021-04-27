import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Checkbox, FormItem, InfoTooltip, Value } from '../../../../../common/components/trader';

const PostOnly = ({ onPostOnlyChange, value }) => (
  <span className="post-only-checkbox-wrapper">
    <FormItem id="postOnly" initialValue={value}>
      <Checkbox
        checked={value}
        onChange={() => {
          if (onPostOnlyChange) {
            onPostOnlyChange(!value);
          }
        }}
      >
        <InfoTooltip title={<Trans i18nKey="trader.orderEntry.postOnly.tooltip" />}>
          <Value.Text>
            <Trans i18nKey="trader.orderEntry.postOnly.title">Post-only</Trans>
          </Value.Text>
        </InfoTooltip>
      </Checkbox>
    </FormItem>
  </span>
);

PostOnly.propTypes = {
  value: PropTypes.bool,
};

export default PostOnly;
