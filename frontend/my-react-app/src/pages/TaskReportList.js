import Header from "../components/Header";
import SideBar from "../components/SideBar";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StylishTable = ({ data, columns, handleEdit, handleDelete }) => {
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
              <td colSpan={columns.length}>No task reports found</td>
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
                            style={{ fontSize: "14px" }}
                          />
                        </button>
                      </div>
                    </td>
                  ) : (
                    <td key={column.accessor}>{row[column.accessor]}</td>
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      <Icon icon="material-symbols-light:fast-rewind" style={{ fontSize: "23px" }} />
      Prev
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

export default function TaskReportList() {
  const [taskReports, setTaskReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("alphabetic");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTaskReport, setEditingTaskReport] = useState(null);
  const [newTaskReport, setNewTaskReport] = useState({
    Template_ID: "",
    Template_Name: "",
    Bug_ID: "",
    Summary: "",
    Priority: "",
    Status: "",
    Assigned_To: "",
  });
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/taskreports");
      setTaskReports(response.data);
    } catch (error) {
      console.error("Error fetching task reports:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNew = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/taskreports", newTaskReport);
      setTaskReports([...taskReports, response.data]);
      toast.success("New Task Report added successfully!");
      setIsAddPopupOpen(false);
      setNewTaskReport({
        Template_ID: "",
        Template_Name: "",
        Bug_ID: "",
        Summary: "",
        Priority: "",
        Status: "",
        Assigned_To: "",
      });
    } catch (error) {
      console.error("Error adding task report:", error);
      toast.error("Failed to add task report. Please try again.");
    }
  };

  const handleEdit = (taskReport) => {
    setEditingTaskReport(taskReport);
    setIsEditPopupOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8000/api/taskreports/${editingTaskReport._id}`,
        editingTaskReport
      );
      toast.success("Task Report updated successfully!");
      setIsEditPopupOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating task report:", error);
      toast.error("Failed to update task report. Please try again.");
    }
  };

  const handleDelete = async (taskReport) => {
    if (window.confirm(`Are you sure you want to delete this task report?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/taskreports/${taskReport._id}`);
        toast.success("Task Report deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting task report:", error);
        toast.error("Failed to delete the task report. Please try again.");
      }
    }
  };

  const handleSearch = () => {
    const filteredReports = taskReports.filter((report) =>
      Object.values(report).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    return filteredReports;
  };

  const columns = [
    { header: "Template ID", accessor: "Template_ID" },
    { header: "Template Name", accessor: "Template_Name" },
    { header: "Bug ID", accessor: "Bug_ID" },
    { header: "Summary", accessor: "Summary" },
    { header: "Priority", accessor: "Priority" },
    { header: "Status", accessor: "Status" },
    { header: "Assigned To", accessor: "Assigned_To" },
    { header: "Actions", accessor: "actions" },
  ];

  const sortedAndFilteredData = handleSearch().sort((a, b) => {
    if (sortOption === "alphabetic") {
      return a.Template_Name.localeCompare(b.Template_Name);
    }
    return b.Template_Name.localeCompare(a.Template_Name);
  });

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);
  const paginatedData = sortedAndFilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
    {/* <SideBar isCollapsed={isCollapsed}/>
    <div className={`Emplist ${isCollapsed ? "emp-collapsed" : ""}`}>
      <Header toggleSidebar={toggleSidebar} /> */}
    
    
      <ToastContainer />
      <div>
        <h2>Task Reports</h2>
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="alphabetic">Alphabetical Order (A-Z)</option>
            <option value="reverse-alphabetic">Alphabetical Order (Z-A)</option>
          </select>
          <button
            className="add-button"
            onClick={() => setIsAddPopupOpen(true)}
          >
            Add New Template
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <StylishTable
              data={paginatedData}
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

      {/* Add New Template Popup */}
      {isAddPopupOpen && (
        <Popup open={isAddPopupOpen} onClose={() => setIsAddPopupOpen(false)} modal>
          <div>
            <h3>Add New Task Report</h3>
            <form onSubmit={handleAddNew}>
              <div>
                <label>Template ID:</label>
                <input
                  type="text"
                  value={newTaskReport.Template_ID}
                  onChange={(e) =>
                    setNewTaskReport({ ...newTaskReport, Template_ID: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Template Name:</label>
                <input
                  type="text"
                  value={newTaskReport.Template_Name}
                  onChange={(e) =>
                    setNewTaskReport({ ...newTaskReport, Template_Name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Bug ID:</label>
                <input
                  type="text"
                  value={newTaskReport.Bug_ID}
                  onChange={(e) =>
                    setNewTaskReport({ ...newTaskReport, Bug_ID: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Summary:</label>
                <input
                  type="text"
                  value={newTaskReport.Summary}
                  onChange={(e) =>
                    setNewTaskReport({ ...newTaskReport, Summary: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Priority:</label>
                <input
                  type="text"
                  value={newTaskReport.Priority}
                  onChange={(e) =>
                    setNewTaskReport({ ...newTaskReport, Priority: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Status:</label>
                <input
                  type="text"
                  value={newTaskReport.Status}
                  onChange={(e) =>
                    setNewTaskReport({ ...newTaskReport, Status: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Assigned To:</label>
                <input
                  type="text"
                  value={newTaskReport.Assigned_To}
                  onChange={(e) =>
                    setNewTaskReport({ ...newTaskReport, Assigned_To: e.target.value })
                  }
                />
              </div>
              <button type="submit">Add</button>
              <button onClick={() => setIsAddPopupOpen(false)}>Cancel</button>
            </form>
          </div>
        </Popup>
      )}
    </>
  );
}
