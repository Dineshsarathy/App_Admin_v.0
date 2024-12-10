import Header from "../components/Header";
import SideBar from "../components/SideBar";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Edit function

const StylishTable = ({ data, columns, handleEdit, handleDelete}) => {
  

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
              <th key={column.accessor}>{column.header}</th>
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
                        <button className="delete"
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
  //Eidt function
  const [editingTemplate, setEditingTemplate] = useState(null); // Track the employee being edited
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  //sorting code
  const [sortedData, setSortedData] = useState([]); // Sorted data
  const [sortOption, setSortOption] = useState("alphabetic");
  //search filter
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page


// Pagination logic
const totalPages = Math.ceil(sortedData.length / itemsPerPage);
const paginatedData = sortedData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

  // Handle search functionality
useEffect(() => {
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  setSortedData(filteredData);
}, [searchTerm, data]);
 

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const fetchData = useCallback(
    async (query = "") => {
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
    },
    [setData]
  );

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData(searchQuery);
    }, 500); // Debounce API calls

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, fetchData]);


//Edit action function
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

//delete function
  const handleDelete = async(row) => {
    if (window.confirm(`Are you sure you want to delete template ${row.Template_name}?`)) {
      try {
        // Assuming the backend route is: DELETE /api/employees/:id
        await axios.delete(`http://localhost:8000/api/template/${row._id}`);
        toast.success(`Template ${row.Template_name} deleted successfully!`);
  
        // Update the state to reflect the deleted employee
        setData((prevData) => prevData.filter((template) => template.templateCategory !== row.templateCategory));
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error("Failed to delete the employee. Please try again.");
      }
    }

    console.log("Delete action triggered for:", row);
  };

  useEffect(() => {
    const sortData = () => {
      let sorted = [...data];
      if (sortOption === "alphabetic") {
          sorted.sort((a, b) => (a.templateName || "").localeCompare(b.templateName || ""));
      } else if (sortOption === "reverse-alphabetic") {
          sorted.sort((a, b) => (b.templateName || "").localeCompare(a.templateName || ""));
      }
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update search term
              />
              <div className="filter">
                        <label><Icon className="filter-icon" icon="stash:filter-light" style={{ fontSize: '28px', }}/><span>Sort By :</span></label>
                        <select id="filterDropdown"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}>
                          <option value="alphabetic">Alphabetical Order (A-Z)</option>
                          <option value="reverse-alphabetic">Alphabetical Order (Z-A)</option>
                        </select>
                    </div>
                    <Popup trigger={
                              <button className="button-add">
                                <Icon icon="carbon:add-alt" style={{ fontSize: "23px" }} />
                                <span>Add New</span>
                              </button>
                            }
                            modal
                            contentStyle={{
                              top: '15%',
                              width: '40%',
                              height: '450px',
                              margin: '0 auto',
                              padding: '20px',
                              border: '1px solid #ccc',
                              borderRadius: '8px',
                              textAlign: 'left',
                            }}
                          >
                  {(close) => (
                    <div>
                      <h3>Add New Template</h3>
                      <form
                         onSubmit={async (e) => {
                          e.preventDefault();
                          const newTemplate = {
                              templateName: e.target.name.value,
                              templateCategory: e.target.category.value,
                              createdBy: e.target.email.value,
                              approvalStatus: true,
                          };
                  
                          try {
                              await axios.post("http://localhost:8000/api/template", newTemplate);
                              toast.success("Template added successfully!");
                              fetchData();
                              setCurrentPage(1); // Reset to the first page
                              close(); // Close the popup
                          } catch (error) {
                              console.error("Error adding template:", error.message);
                              toast.error("Failed to add template. Please try again.");
                          }
                      }}
                      >
                        <div style={{ marginBottom: '15px' }}>
                          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
                            Template_name:
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
                            TemplateCategory:
                          </label>
                          <input
                             type="text"
                             id="category"
                             name="category"
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
                            Created_by:
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <button
                            type="submit"
                            style={{
                              backgroundColor: '#28a745',
                              color: '#fff',
                              padding: '10px 20px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '80px',
                            }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={close}
                            style={{
                              backgroundColor: '#dc3545',
                              color: '#fff',
                              padding: '10px 20px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '80px',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </Popup>
            </div>
            {loading ? (
              <div>Loading...</div>
            ) : (<>
              <StylishTable
                 data={paginatedData} // Use paginatedData instead of sortedData
                 columns={columns}
                 handleEdit={handleEdit}
                 handleDelete={handleDelete}
              />
              <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Popup */}
      {isEditPopupOpen && (
        <Popup open={isEditPopupOpen} onClose={() => setIsEditPopupOpen(false)} modal
        contentStyle={{
          top: '15%',
          width: '40%',
          height: '450px',
          margin: '0 auto',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          textAlign: 'left',
        }}>
          <div>
            <h3>Edit Template Details</h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "15px" }}>
                <label>Template_name:</label>
                <input
                  type="text"
                  value={editingTemplate.templateName}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, templateName: e.target.value })
                  }
                  required
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label>Category:</label>
                <input
                  type="text"
                  value={editingTemplate.templateCategory}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, templateCategory: e.target.value })
                  }
                  required
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label>Created_by</label>
                <input
                  type="email"
                  value={editingTemplate.createdBy}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, createdBy: e.target.value })
                  }
                  required
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                    <label>approvalStatus:</label>
                    <select
                      value={editingTemplate.approvalStatus ? "true" : "false"}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          approvalStatus: e.target.value === "true",
                        })
                      }
                      required
                    >
                      <option value="true">Accepted</option>
                      <option value="false">Rejected</option>
                    </select>
                  </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit" style={{
                              backgroundColor: '#28a745',
                              color: '#fff',
                              padding: '10px 20px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '80px',
                            }}>Save</button>
                <button type="button" onClick={() => setIsEditPopupOpen(false)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '80px',
                  }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Popup>
      )}
    </>
  );
}
