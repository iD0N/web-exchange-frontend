import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Col, Icon, Row, Spin } from '../../../../../common/components';
import {
  Button,
  Checkbox,
  InfoTooltip,
  Table,
  DeleteIconButton,
  Value,
} from '../../../../../common/components/trader';

class ApiKeys extends Component {
  static propTypes = {
    isFetching: PropTypes.bool.isRequired,
    isCreating: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool,
    keys: PropTypes.array.isRequired,
    created: PropTypes.object.isRequired,
    onCreateClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.fetchApiKeys();
  }

  componentWillUnmount() {
    // this.props.clearCreated();
    // TODO: decide if desirable
  }

  state = {
    read: true,
    write: true,
    transfer: true,
  };

  columns = [
    {
      dataIndex: 'key',
      render: key => <SelectAll>{key}</SelectAll>,
      title: <Trans i18nKey="settings.api.key">Key</Trans>,
      width: 75,
    },
    {
      align: 'center',
      dataIndex: 'read',
      render: value => !!value && <Icon type="check" />,
      title: <Trans i18nKey="settings.api.permissions.read.label">Read</Trans>,
      width: 15,
    },
    {
      align: 'center',
      dataIndex: 'write',
      render: value => !!value && <Icon type="check" />,
      title: <Trans i18nKey="settings.api.permissions.write.label">Write</Trans>,
      width: 15,
    },
    {
      align: 'center',
      dataIndex: 'transfer',
      render: value => !!value && <Icon type="check" />,
      title: <Trans i18nKey="settings.api.permissions.transfer.label">Transfer</Trans>,
      width: 15,
    },
    {
      align: 'center',
      key: 'actions',
      render: (_, { key }) => (
        <DeleteIconButton tooltipVisible={false} onClick={() => this.props.onDeleteClick(key)} />
      ),
      title: <Trans i18nKey="settings.api.delete">Delete</Trans>,
      width: 15,
    },
  ];

  render() {
    const {
      isFetching,
      isCreating,
      isDeleting,
      isMobile,
      keys,
      created: { key, secret },
      onCreateClick,
    } = this.props;

    const { read, write, transfer } = this.state;

    return (
      <div className="api-keys-wrapper">
        <Row>
          <Col span={isMobile ? 24 : 14}>
            <Spin spinning={(isFetching && keys.length === 0) || isCreating || isDeleting}>
              {keys.length > 0 && (
                <Table
                  columns={this.columns}
                  loading={keys.length > 0 && isFetching}
                  dataSource={keys}
                  emptyText={<Trans i18nKey="settings.api.noKeys">No keys</Trans>}
                  id="api-keys"
                  rowKey="key"
                />
              )}
              {secret && (
                <div className="new-key-info-wrapper">
                  <Value label={<Trans i18nKey="settings.api.newKey">New Key</Trans>}>
                    <Value.Text>
                      <SelectAll>{key}</SelectAll>
                    </Value.Text>
                  </Value>
                  <Value label={<Trans i18nKey="settings.api.secret">Secret</Trans>}>
                    <Value.Text>
                      <SelectAll>{secret}</SelectAll>
                    </Value.Text>
                  </Value>
                </div>
              )}
              <div className="api-key-create-wrapper">
                <div className="api-key-create-permissions">
                  <Checkbox checked={read} onChange={() => this.setState({ read: !read })}>
                    <InfoTooltip
                      title={
                        <Trans i18nKey="settings.api.permissions.read.tooltip">
                          The Read privilege allows the key to be used to retrieve current and
                          historical orders, positions, balances, and transfer history.
                        </Trans>
                      }
                    >
                      <Trans i18nKey="settings.api.permissions.read.label">Read</Trans>
                    </InfoTooltip>
                  </Checkbox>
                  <Checkbox checked={write} onChange={() => this.setState({ write: !write })}>
                    <InfoTooltip
                      title={
                        <Trans i18nKey="settings.api.permissions.write.tooltip">
                          The Write privilege allows the key to be used to insert, modify, or cancel
                          orders.
                        </Trans>
                      }
                    >
                      <Trans i18nKey="settings.api.permissions.write.label">Write</Trans>
                    </InfoTooltip>
                  </Checkbox>
                  <Checkbox
                    checked={transfer}
                    onChange={() => this.setState({ transfer: !transfer })}
                  >
                    <InfoTooltip
                      title={
                        <Trans i18nKey="settings.api.permissions.transfer.tooltip">
                          The Transfer privilege allows the key be used to request withdrawals,
                          transfer funds between subaccounts, and view deposit addresses.
                        </Trans>
                      }
                    >
                      <Trans i18nKey="settings.api.permissions.transfer.label">Transfer</Trans>
                    </InfoTooltip>
                  </Checkbox>
                </div>
                <Button
                  block
                  size="medium"
                  onClick={() => onCreateClick({ read, write, transfer })}
                >
                  <Trans i18nKey="settings.api.createNewKey">Create New Key</Trans>
                </Button>
                <Trans i18nKey="settings.api.subaccount">To generate an API key for a subaccount, switch to that subaccount and press Create New Key to generate an independent API key for that subaccount.</Trans>
              </div>
            </Spin>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ApiKeys;

const SelectAll = props => <span {...props} className="select-all" />;
