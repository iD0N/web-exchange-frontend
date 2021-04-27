import React from 'react';
import { storiesOf } from '@storybook/react';

import Row from '../../../../../.storybook/addons/Row';

import { Table, Currency, Button } from '../';
import { tableData, tableColumns } from './mocks';

const { sortableColumns, SORT_ORDERS, DescriptionHeader, ContextProvider, ContextConsumer } = Table;

storiesOf('Trader/Table', module)
  .add('default', () => (
    <Table columns={tableColumns} dataSource={tableData} id="default" rowKey="id" />
  ))
  .add('full featured', () => (
    <ContextProvider>
      <Table
        columns={[
          ...tableColumns,
          sortableColumns.number({
            key: 'description',
            dataIndex: 'netPosition',
            title: (
              <DescriptionHeader>
                With Description
                <Currency />
              </DescriptionHeader>
            ),
            width: 110,
          }),
        ]}
        dataSource={tableData}
        defaultSortKey="id"
        defaultSortOrder={SORT_ORDERS.ASC}
        enableColumnManagement
        enableColumnOrdering
        enableResize
        enableSort
        id="full-featured"
        rowClassName={record => (record.id === tableData[5].id ? 'active' : undefined)}
        rowKey="id"
        onRow={record => ({
          onClick: () => {
            window.alert(record.id);
          },
        })}
      />
      <ContextConsumer>
        {({ handleColumnsManagementModalShow }) => (
          <Row>
            <Button onClick={handleColumnsManagementModalShow}>Open Columns Management</Button>
          </Row>
        )}
      </ContextConsumer>
    </ContextProvider>
  ))
  .add('empty', () => (
    <Table
      columns={tableColumns}
      dataSource={tableData}
      emptyText="Sorry we have no data"
      id="empty"
      rowKey="id"
    />
  ))
  .add('without header', () => (
    <Table
      columns={tableColumns}
      dataSource={tableData}
      id="no-header"
      rowKey="id"
      showHeader={false}
    />
  ))
  .add('loading', () => (
    <Table columns={tableColumns} dataSource={tableData} id="loading" loading rowKey="id" />
  ))
  .add('pagination', () => (
    <Table columns={tableColumns} dataSource={tableData} id="pagination" pageSize={5} rowKey="id" />
  ));
