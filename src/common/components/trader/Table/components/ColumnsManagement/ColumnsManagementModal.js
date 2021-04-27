import React, { Component, createContext, memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Modal, Button, Checkbox, PerfectScrollbar } from '../../../';

import { getColumnKey } from '../../helpers';

const ColumnManagementModalContext = createContext();

class ColumnManagementModalContextProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  state = {
    isVisible: false,
    handleHide: () => {
      this.setState({ isVisible: false })
    },
    handleShow: () => this.setState({ isVisible: true }),
  };

  render() {
    return (
      <ColumnManagementModalContext.Provider value={this.state}>
        {this.props.children}
      </ColumnManagementModalContext.Provider>
    );
  }
}

const ColumnsManagementModal = memo(({ columns, hiddenColumnKeys, onChange }) => (
  <ColumnManagementModalContext.Consumer>
    {({ isVisible, handleHide }) =>
      isVisible ? (
        <Modal
          centered
          footer={null}
          title={<Trans i18nKey="table.columnsManagement.title">Manage Columns</Trans>}
          visible={isVisible}
          width={300}
          wrapClassName="columns-management-modal"
          onCancel={handleHide}
        >
          <PerfectScrollbar>
            <ul>
              {columns
                .filter(col => !col.alwaysVisible)
                .map(col => {
                  const key = getColumnKey(col);
                  const checked = !hiddenColumnKeys.includes(key);
                  const disabled = checked && hiddenColumnKeys.length + 1 === columns.length;

                  return (
                    <li key={key}>
                      <Checkbox
                        disabled={disabled}
                        checked={checked}
                        onChange={() => onChange(key)}
                      >
                        {col.title}
                      </Checkbox>
                    </li>
                  );
                })}
            </ul>
          </PerfectScrollbar>
          <div className="form-footer">
            <Button block type="primary" onClick={handleHide}>
              <Trans i18nKey="table.columnsManagement.submit">Done</Trans>
            </Button>
          </div>
        </Modal>
      ) : null
    }
  </ColumnManagementModalContext.Consumer>
));

ColumnsManagementModal.displayName = 'ColumnsManagementModal';

ColumnsManagementModal.propTypes = {
  columns: PropTypes.array.isRequired,
  hiddenColumnKeys: PropTypes.array.isRequired,
};

ColumnsManagementModal.defaultProps = {
  hiddenColumnKeys: [],
};

ColumnsManagementModal.ContextProvider = ColumnManagementModalContextProvider;
ColumnsManagementModal.ContextConsumer = ColumnManagementModalContext.Consumer;

export default ColumnsManagementModal;
