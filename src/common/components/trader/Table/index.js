import Table from './Table';
import DescriptionHeader from './components/DescriptionHeader';
import ColumnsManagementModal from './components/ColumnsManagement/ColumnsManagementModal';
import ColumnsManagementMenuItem from './components/ColumnsManagement/ColumnsManagementMenuItem';
import { sortableColumns } from './helpers';
import { SORT_ORDERS, ROW_HEIGHT } from './constants';

Table.ColumnsManagementMenuItem = ColumnsManagementMenuItem;
Table.ColumnsManagementModalContextProvider = ColumnsManagementModal.ContextProvider;
Table.ColumnsManagementModalContextConsumer = ColumnsManagementModal.ContextConsumer;
Table.DescriptionHeader = DescriptionHeader;
Table.sortableColumns = sortableColumns;
Table.SORT_ORDERS = SORT_ORDERS;
Table.ROW_HEIGHT = ROW_HEIGHT;

export default Table;
