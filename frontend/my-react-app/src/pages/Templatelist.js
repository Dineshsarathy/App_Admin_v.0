import Header from "../components/Header";
import SideBar from "../components/SideBar";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// StylishTable component
const StylishTable = ({ data, columns, handleEdit, handleDelete, sortOption, onSortChange }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Formats as YYYY-MM-DD
  };

  return (
    <div className="table-container">
      <table className="stylish-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                onClick={column.accessor !== "actions" ? () => onSortChange(column.accessor) : undefined} // Disable sorting for "actions" column
                style={{ cursor: column.accessor !== "actions" ? "pointer" : "default", position: "relative" }} // Disable cursor change for "actions"
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  {column.header}
                  {/* Sorting Arrows, only for non-actions columns */}
                  {column.accessor !== "actions" && sortOption.column === column.accessor ? (
                    <span style={{ marginLeft: "5px" }}>
                      {sortOption.direction === "asc" ? (
                        <span style={{ color: "white" }}>&#9650;</span> // Up arrow ▲
                      ) : (
                        <span style={{ color: "white" }}>&#9660;</span> // Down arrow ▼
                      )}
                    </span>
                  ) : column.accessor !== "actions" ? (
                    <span style={{ marginLeft: "5px", color: "#ccc",fontSize:"14px" }}>
                      &#9650; &#9660; {/* Neutral arrows */}
                    </span>
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No data found</td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) =>
                  column.accessor === "actions" ? (
                    <td key="actions">
                      <div className="action-buttons">
                        <button
                          className="edit"
                          style={{ backgroundColor: "rgb(9, 134, 9)" }}
                          onClick={() => handleEdit(row)}
                        >
                          <Icon
                            icon="fa6-solid:file-pen"
                            className="icon"
                            style={{ fontSize: "14px", margin: 0 }}
                          />
                        </button>
                        <button
                          className="delete"
                          style={{ backgroundColor: "red" }}
                          onClick={() => handleDelete(row)}
                        >
                          <Icon
                            icon="streamline:recycle-bin-2"
                            className="icon"
                            style={{ fontSize: "14px" }}
                          />
                        </button>
                      </div>
                    </td>
                  ) : (
                    <td key={column.accessor}>
                      {column.accessor === "approvalStatus"
                        ? row[column.accessor]
                          ? "Accepted"
                          : "Rejected"
                        : column.accessor === "completedDate" ||
                        column.accessor === "uploadDate"
                        ? formatDate(row[column.accessor])
                        : row[column.accessor]}
                    </td>
                  )
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};


// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <Icon icon="material-symbols-light:fast-rewind" style={{ fontSize: "23px" }} />Prev
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <Icon icon="material-symbols-light:fast-forward" style={{ fontSize: "23px" }} />
      </button>
    </div>
  );
};

export default function Templatelist() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null); // Track the template being edited
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  // Sorting logic
  const [sortedData, setSortedData] = useState([]); // Sorted data
  const [sortOption, setSortOption] = useState({ column: "templateName", direction: "asc" });

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search functionality
  useEffect(() => {
    const filteredData = data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setSortedData(filteredData);
  }, [searchQuery, data]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const fetchData = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const endpoint = query
        ? `http://localhost:8000/api/template/search?query=${query}`
        : `http://localhost:8000/api/template`;

      const response = await axios.get(endpoint);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  }, [setData]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData(searchQuery);
    }, 500); // Debounce API calls

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, fetchData]);

  const handleEdit = (row) => {
    setEditingTemplate(row); // Set the selected template (including _id)
    setIsEditPopupOpen(true); // Open the edit popup
    console.log("Edit action triggered for:", row);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { _id, templateName, templateCategory, createdBy, approvalStatus } = editingTemplate;

      await axios.put(`http://localhost:8000/api/template/${_id}`, {
        templateName,
        templateCategory,
        createdBy,
        approvalStatus,
      });

      toast.success("Template details updated successfully!");
      setIsEditPopupOpen(false);
      fetchData(); // Refresh the table data
      setCurrentPage(1); // Reset to the first page
    } catch (error) {
      console.error("Error updating template:", error.message);
      toast.error("Failed to update template details. Please check the input and try again.");
    }
  };

  // Sorting logic
  const handleSortChange = (column) => {
    setSortOption((prevSortOption) => {
      const newDirection = prevSortOption.column === column && prevSortOption.direction === "asc" ? "desc" : "asc";
      return { column, direction: newDirection };
    });
  };

  // Sort data based on the selected sort option
  useEffect(() => {
    const sortData = () => {
      const sorted = [...data];
      const { column, direction } = sortOption;
      sorted.sort((a, b) => {
        if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
        if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      setSortedData(sorted);
    };

    sortData();
  }, [sortOption, data]);

  const columns = [
    { header: "Template Name", accessor: "templateName" },
    { header: "Category", accessor: "templateCategory" },
    { header: "Created By", accessor: "createdBy" },
    { header: "Approval Status", accessor: "approvalStatus" },
    { header: "Actions", accessor: "actions" },
  ];

  return (
    <>
      <SideBar isCollapsed={isCollapsed} />
      <div className={`Emplist ${isCollapsed ? "emp-collapsed" : ""}`}>
        <Header toggleSidebar={toggleSidebar} />
        <ToastContainer />
        <div className="emp-list-contents">
          <h2 className="Emp-header">Template List</h2>
          <div className="page-list">
            <div className="table-props">
              <input
                className="search"
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Update search query
              />
              <div className="filter">
                <label>
                  <Icon className="filter-icon" icon="stash:filter-light" style={{ fontSize: '28px' }} />
                  <span>No of items:</span>
                </label>
              </div>
              <div className="items-per-page">
                <label>
                  <select id="filterDropdown" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                  </select>
                </label>
              </div>
              <Popup trigger={
                <button className="button-add">
                  <Icon icon="carbon:add-alt" style={{ fontSize: "20px", marginRight: "5px" }} />
                  Add Template
                </button>
              } modal>
                <div className="popup-content">Popup content goes here.</div>
              </Popup>
            </div>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <StylishTable
                data={paginatedData}
                columns={columns}
                sortOption={sortOption}
                onSortChange={handleSortChange}
                handleEdit={handleEdit}
                handleDelete={() => {}}
              />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
