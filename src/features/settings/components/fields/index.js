import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Tabs } from '../../../../common/components/trader';
import { Col, IsMobile, Row } from '../../../../common/components';

import { TABS, TABS_TITLES, TABS_MOBILE, TABS_ROUTES } from '../../constants';

import ChangePasswordContainer from './Password/container';
import ChangeEmailContainer from './Email/container';
import MFAContainer from './MFA/containers';

const { WithTabs } = Tabs;

const FIELDS = {
  EMAIL: 'EMAIL',
  MFA: 'MFA',
  PASSWORD: 'PASSWORD',
};

class FieldsContainer extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (!this.getPathKey() || !FIELDS[this.getPathKey().toUpperCase()]) {
      this.props.history.push(TABS_ROUTES[TABS.ACCOUNT]);
    }
  }

  handleChange = pageKey => {
    if (this.getDefaultKey().toUpperCase() !== pageKey) {
      this.props.history.push(TABS_ROUTES[pageKey]);
    }
  };

  getPathKey = () => this.props.match.params.field;

  getDefaultKey = () => (this.getPathKey() ? this.getPathKey().toUpperCase() : FIELDS.PASSWORD);

  renderSubpage = fieldKey => {
    const { isMobile } = this.props;

    switch (fieldKey) {
      case FIELDS.EMAIL:
        return <ChangeEmailContainer isMobile={isMobile} />;
      case FIELDS.MFA:
        return <MFAContainer isMobile={isMobile} />;
      case FIELDS.PASSWORD:
        return <ChangePasswordContainer isMobile={isMobile} />;
      default:
        return null;
    }
  };

  render() {
    return (
      <WithTabs
        tabs={TABS}
        tabsT={this.props.isMobile ? TABS_MOBILE : TABS_TITLES}
        onKeyChange={this.handleChange}
      >
        {({ activeKey }) => (
          <>
            <Tabs />
            <div className="settings-subpage-wrapper" id="settings-subpage-wrapper">
              <Row>
                <Col span={14}>{this.renderSubpage(this.getPathKey().toUpperCase())}</Col>
              </Row>
            </div>
          </>
        )}
      </WithTabs>
    );
  }
}

export default withRouter(IsMobile(FieldsContainer));
