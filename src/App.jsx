import React, { useState, useRef, useEffect } from 'react';
    import Papa from 'papaparse';

    function App() {
      const [data, setData] = useState([]);
      const [filteredData, setFilteredData] = useState([]);
      const [search, setSearch] = useState('');
      const [filters, setFilters] = useState({});
      const tableRef = useRef(null);
      const [rowCount, setRowCount] = useState(0);
      const searchInputRef = useRef(null);
      const fileInputRef = useRef(null);

      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          Papa.parse(file, {
            header: true,
            complete: (results) => {
              setData(results.data);
              setFilteredData(results.data);
            },
          });
        }
      };

      const handleSearchChange = (event) => {
        const value = event.target.value.toLowerCase();
        setSearch(value);
        applyFiltersAndSearch(value, filters);
      };

      const handleFilterChange = (column, value) => {
        const newFilters = { ...filters, [column]: value.toLowerCase() };
        setFilters(newFilters);
        applyFiltersAndSearch(search, newFilters);
      };

      const applyFiltersAndSearch = (searchValue, currentFilters) => {
        let filtered = [...data];

        if (searchValue) {
          filtered = filtered.filter((row) =>
            Object.values(row).some((value) =>
              String(value).toLowerCase().includes(searchValue)
            )
          );
        }

        for (const column in currentFilters) {
          if (currentFilters[column]) {
            filtered = filtered.filter((row) =>
              String(row[column]).toLowerCase().includes(currentFilters[column])
            );
          }
        }

        setFilteredData(filtered);
        setRowCount(filtered.length);
      };

      const copyFirstColumnValues = () => {
        if (filteredData.length === 0) return;
        const firstColumnHeader = Object.keys(filteredData[0])[0];
        const values = filteredData.map((row) => row[firstColumnHeader]).join('\n');

        const blob = new Blob([values], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '0lista.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      const copyFirstColumnValuesSave2 = () => {
        if (filteredData.length === 0) return;
        const firstColumnHeader = Object.keys(filteredData[0])[0];
        const secondColumnHeader = Object.keys(filteredData[0])[1];
        const values = filteredData.map((row) => row[firstColumnHeader]).join('\n');
        const firstRowSecondColumn = filteredData[0][secondColumnHeader] || '';
        const filename = `${filteredData.length}-${firstRowSecondColumn}.txt`;

        const blob = new Blob([values], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      const copyFirstResult = () => {
        if (filteredData.length === 0) return;
        const firstColumnHeader = Object.keys(filteredData[0])[0];
        const firstValue = filteredData[0][firstColumnHeader];

        const textArea = document.createElement('textarea');
        textArea.value = firstValue;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Unable to copy', err);
        }
        document.body.removeChild(textArea);
      };

      const copySecondResultThirdColumn = () => {
        if (filteredData.length < 2) return;
        const thirdColumnHeader = Object.keys(filteredData[0])[2];
        const secondValue = filteredData[1][thirdColumnHeader];

        const textArea = document.createElement('textarea');
        textArea.value = secondValue;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Unable to copy', err);
        }
        document.body.removeChild(textArea);
      };

      const clearData = () => {
        setData([]);
        setFilteredData([]);
        setSearch('');
        setFilters({});
        setRowCount(0);
      };

      const reloadData = () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
          setData([]);
          setFilteredData([]);
          setSearch('');
          setFilters({});
          setRowCount(0);
        }
      };

      useEffect(() => {
        if (tableRef.current) {
          const ths = tableRef.current.querySelectorAll('th');
          const tds = tableRef.current.querySelectorAll('td');

          ths.forEach((th) => {
            th.style.width = 'auto';
          });

          tds.forEach((td) => {
            td.style.width = 'auto';
          });

          // Adjust column widths based on content
          if (ths.length > 0 && tds.length > 0) {
            const columnWidths = Array(ths.length).fill(0);

            ths.forEach((th, index) => {
              columnWidths[index] = Math.max(columnWidths[index], th.offsetWidth);
            });

            tds.forEach((td, index) => {
              const columnIndex = index % ths.length;
              columnWidths[columnIndex] = Math.max(columnWidths[columnIndex], td.offsetWidth);
            });

            ths.forEach((th, index) => {
              th.style.width = `${columnWidths[index]}px`;
            });

            tds.forEach((td, index) => {
              const columnIndex = index % ths.length;
              td.style.width = `${columnWidths[columnIndex]}px`;
            });
          }
        }
      }, [filteredData]);

      useEffect(() => {
        const handleKeyDown = (event) => {
          if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            searchInputRef.current.focus();
          } else if (event.ctrlKey && event.key === 'c') {
            event.preventDefault();
            copyFirstColumnValues();
          } else if (event.ctrlKey && event.key === 'h') {
            event.preventDefault();
            copyFirstResult();
          } else if (event.ctrlKey && event.key === 'x') {
            event.preventDefault();
            clearData();
          } else if (event.ctrlKey && event.key === 'z') {
            event.preventDefault();
            copySecondResultThirdColumn();
          }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      }, [copyFirstColumnValues, copyFirstResult, clearData, copySecondResultThirdColumn]);

      if (data.length === 0) {
        return (
          <div>
            <input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} />
          </div>
        );
      }

      const headers = Object.keys(data[0]);

      return (
        <div>
          <input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} />
          <input
            type="text"
            placeholder="Search (Ctrl+F)"
            value={search}
            onChange={handleSearchChange}
            ref={searchInputRef}
          />
          <button onClick={copyFirstColumnValues}>Save First Column (Ctrl+C)</button>
          <button onClick={copyFirstResult}>Copy First Result (Ctrl+H)</button>
          <button onClick={clearData}>Clear (Ctrl+X)</button>
          <button onClick={reloadData}>Reload</button>
          <button onClick={copyFirstColumnValuesSave2}>Save2</button>
          <button onClick={copySecondResultThirdColumn}>Lot-2 (Ctrl+Z)</button>
          <div>
            <span>Rows: {rowCount}</span>
          </div>
          <table ref={tableRef}>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>
                    <div>
                      {header}
                      <input
                        type="text"
                        placeholder="Filter..."
                        onChange={(e) => handleFilterChange(header, e.target.value)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td key={header}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    export default App;
