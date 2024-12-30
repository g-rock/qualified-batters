import React, { useRef, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule, PaginationModule, ValidationModule, ColumnAutoSizeModule, RowSelectionModule, QuickFilterModule, themeQuartz } from "ag-grid-community";
import tableNameRenderer from "./tableNameRenderer.jsx";

const myTheme = themeQuartz.withParams({
  backgroundColor: "#FFF",
  browserColorScheme: "dark",
  chromeBackgroundColor: {
    ref: "foregroundColor",
    mix: 0.07,
    onto: "backgroundColor",
  },
  fontFamily: {
    googleFont: "Roboto",
  },
  foregroundColor: "#295a8e",
  headerFontSize: 14,
});

const Table = ({ rowData, onSelectionChange }) => {
  const gridRef = useRef();
  const [selectedRows, setSelectedRows] = useState([]);

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
  };

  // this handles selection for both row clicks and checkbox clicks
  const handleSelectionChanged = (event) => {
    if (event.type === "rowClicked") {
      const clickedNode = event.node;
      const isAlreadySelected = clickedNode.isSelected();
      clickedNode.setSelected(!isAlreadySelected);
    }
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    setSelectedRows(selectedData);
    onSelectionChange(selectedData);
  };

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current.api.setGridOption(
      "quickFilterText",
      document.getElementById("filter-text-box").value,
    );
  }, []);

  const gridOptions = {
    columnDefs: [
      { headerName: "Rk", valueGetter: "node.rowIndex + 1" },
      { headerName: "Name", field: "playerFullName", hide: true },
      {
        headerName: "Name",
        cellRenderer: tableNameRenderer,
        minWidth: 100,
      },
      { headerName: 'Team', field: 'newestTeamAbbrevName' },
      { headerName: 'AVG', field: 'cumAVG' },
      { headerName: 'OPS', field: 'cumOPS', sort: "desc" },
      { headerName: 'OBP', field: 'cumOBP' },
      { headerName: 'SLG', field: 'cumSLG' },
      { headerName: 'G', field: 'cumG' },
      { headerName: 'PA', field: 'cumPA' },
      { headerName: 'Hits', field: 'cumH' },
      { headerName: 'AB', field: 'cumAB' },
      { headerName: 'BB', field: 'cumBB' },
      { headerName: 'HBP', field: 'cumHBP' },
      { headerName: 'SF', field: 'cumSF' },
      { headerName: 'TB', field: 'cumTB' }
    ],
    // This makes sure the all the cells fit in the table
    autoSizeStrategy: {
      type: "fitCellContents",
    },
    rowSelection: {
      mode: 'multiRow'
    },
    includeHiddenColumnsInQuickFilter: true
  };

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <div className="quick-filter">
        <span>Quick Table Filter: </span>
        <input
          type="text"
          id="filter-text-box"
          placeholder="Filter..."
          onInput={onFilterTextBoxChanged}
        />
        <br />
      </div>

      <AgGridReact
        ref={gridRef}
        theme={myTheme}
        gridOptions={gridOptions}
        modules={[ClientSideRowModelModule, PaginationModule, ValidationModule, ColumnAutoSizeModule, RowSelectionModule, QuickFilterModule]}
        rowData={rowData}
        onGridReady={onGridReady}
        onSelectionChanged={handleSelectionChanged}
        onRowClicked={handleSelectionChanged}
      />
    </div>
  );
};

export default Table;
