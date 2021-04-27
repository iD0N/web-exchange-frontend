import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { reducer as modal } from 'redux-modal';

// TODO: Fix imports to not load ducks/selectors
import ReduxDecorator from '../../../../../../.storybook/addons/ReduxDecorator';
import { Table, CheckboxSwitch } from '../../../../../common/components/trader';
import { tableData, tableColumns } from '../../../../../common/components/trader/Table/mocks';

import GridLayout from '../';
import GridLayoutTile from '../GridLayoutTile';

const noop = () => {};

const wrapGridItem = GridItem => {
  const storyWidget = {
    i: 'storyWidget',
    x: 0,
    y: 0,
    w: 8,
    h: 5,
    minH: 2,
  };

  return class GridLayoutContainer extends Component {
    state = {
      layout: [storyWidget],
    };

    handleLayoutChange = layout => this.setState({ layout });

    render() {
      return (
        <GridLayout
          layout={this.state.layout}
          onLayoutChange={this.handleLayoutChange}
          onDragStart={noop}
          onDragStop={noop}
        >
          {{
            [storyWidget.i]: <GridItem />,
          }}
        </GridLayout>
      );
    }
  };
};

const TableItem = () => (
  <GridLayoutTile
    title={<strong>Paginated Table</strong>}
    content={
      <Table
        id="default"
        columns={tableColumns}
        dataSource={tableData}
        rowKey="id"
        pageSize="auto"
      />
    }
    footer={<p>Footer limits table wrapper height, but pagination is still ok</p>}
  />
);

const HeaderControlsItem = () => (
  <GridLayoutTile
    title={<strong>Paginated Table</strong>}
    controls={
      <CheckboxSwitch size="small" labelPlacement="left">
        Toggle
      </CheckboxSwitch>
    }
  />
);

const TableGridItem = wrapGridItem(TableItem);
const HeaderControlsGridItem = wrapGridItem(HeaderControlsItem);

storiesOf('Trader/GridLayoutTile', module)
  .addDecorator(ReduxDecorator({ modal }))
  .add('with table', () => <TableGridItem />)
  .add('with header controls', () => <HeaderControlsGridItem />);
