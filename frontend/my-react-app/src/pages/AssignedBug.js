import Header from "../components/Header";
import SideBar from "../components/SideBar";
import React, { useState, useEffect, useCallback } from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa"; // Importing icons
import { format } from 'date-fns'; // Importing date-fns for date formatting
import axios from "axios";
import Popup from "reactjs-popup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Icon } from "@iconify/react/dist/iconify.js";

// Format date function
const formatDate = (date) => {
  return format(new Date(date), 'MM/dd/yyyy'); // Formatting date to MM/DD/YYYY
};

const StylishTable = ({ data, columns, handleEdit, handleDelete }) => (
  <table>
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.accessor}>{col.header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.length === 0 ? (
        <tr>
          <td colSpan={columns.length}>No data found</td>
        </tr>
      ) : (
        data.map((row) => (
          <tr key={row._id}>
            {columns.map((col) => (
              <td key={col.accessor}>
                {col.accessor === "actions" ? (
                  <div className="action-buttons">
                    <button
                      className="edit"
                      style={{ backgroundColor: "rgb(9, 134, 9)" }}
                      onClick={() => handleEdit(row)}
                    >
                      <FaPen className="icon" style={{ fontSize: "14px", margin: 0 }} />
                    </button>
                    <button
                      className="delete"
                      style={{ backgroundColor: "red" }}
                      onClick={() => handleDelete(row)}
                    >
                      <FaTrashAlt className="icon" style={{ fontSize: "14px" }} />
                    </button>
                  </div>
                ) : (
                  <span>
                    {col.accessor === "Status"
                      ? row[col.accessor]
                        ? "Completed"
                        : "Pending"
                      : col.accessor === "Assigned_Date" || col.accessor === "Completed_Date"
                      ? formatDate(row[col.accessor])
                      : row[col.accessor]}
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination">
      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <span>
        {currentPage} of {totalPages}
      </span>
      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

export default function TaskReportList() {
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("alphabetic");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [newTask, setNewTask] = useState({
      Template_ID: '',
      Template_Name: '',
      Bug_ID: '',
      Summary: '',
      Priority: 'Low',
      Severity: 'Minor',
      Assigned_To: '',
      Assigned_Date: new Date().toISOString().split('T')[0], // Default to today
      Bug_DueDate: '',
      Assigned_Due_Date: '', // Empty by default; you can set a default if needed
      Bug_status: 'Pending',
    });

  // Generate a unique Template ID and Bug ID
  const generateTemplateID = () => `T-${Date.now()}`;

  const generateBugID = () => `B-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleAddTask = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    if (!newTask.Template_Name || !newTask.Assigned_To || !newTask.Bug_DueDate) {
      toast.error("All required fields must be filled!");
      return;
    }
  
    const task = {
      ...newTask,
      Template_ID: generateTemplateID(),
      Bug_ID: generateBugID(),
    };
  
    try {
      await axios.post("http://localhost:8000/api/bugreport", task);
      toast.success("BugReport added successfully!");
      fetchData();
      setNewTask({
        Template_ID: '',
        Template_Name: '',
        Bug_ID: '',
        Summary: '',
        Priority: 'Low',
        Severity: 'Minor',
        Assigned_To: '',
        Assigned_Date: new Date().toISOString().split('T')[0],
        Bug_DueDate: '', // Reset this field
        Completed_Date: new Date().toISOString().split('T')[0],
        Bug_status: 'Pending',
      });
    } catch (error) {
      console.error("Error adding bug report:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to add bug report.");
    }
  };
  

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/bugreport");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching bug:", error);
      toast.error("Failed to load bug.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const filteredData = data.filter((task) =>
      Object.values(task).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setSortedData(filteredData);
  }, [searchTerm, data]);

  useEffect(() => {
    const sorted = [...data];
    if (sortOption === "alphabetic") {
      sorted.sort((a, b) => (a.Template_Name || "").localeCompare(b.Template_Name || ""));
    } else if (sortOption === "reverse-alphabetic") {
      sorted.sort((a, b) => (b.Template_Name || "").localeCompare(a.Template_Name || ""));
    }
    setSortedData(sorted);
  }, [sortOption, data]);

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsEditPopupOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/bugreport/${editingTask._id}`, editingTask);
      toast.success("BugDetails updated successfully!");
      setIsEditPopupOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating BugDetails:", error);
      toast.error("Failed to update BugDetails.");
    }
  };

  const handleDelete = async (task) => {
    if (window.confirm(`Are you sure you want to delete ${task.Template_Name}?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/bugreport/${task._id}`);
        toast.success(`${task.Template_Name} deleted successfully!`);
        fetchData();
      } catch (error) {
        console.error("Error deleting BugDetails:", error);
        toast.error("Failed to delete BugDetails.");
      }
    }
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { header: "Template Id", accessor: "Temp_id" },
    { header: "Template Name", accessor: "Temp_Name" },
    { header: "Bug ID", accessor: "Bug_Id" },
    { header: "Summary", accessor: "Summary" },
    { header: "Priority", accessor: "Priority" },
    { header: "Severity", accessor: "Severity" },
    { header: "Bug Status", accessor: "Bug_status" },
    { header: "Assigned To", accessor: "Assigned_to" },
    { header: "Assigned Date", accessor: "Assigned_date" },
    { header: "Completed Date", accessor: "Completed_Date" },
    { header: "Actions", accessor: "actions" },
  ];

  return (
    <>
      <SideBar isCollapsed={isCollapsed} />
      <div className={`Tasklist ${isCollapsed ? "Task-collapsed" : ""}`}>
        <Header toggleSidebar={toggleSidebar} />
        <div className="task-report-list">
          <ToastContainer />
          <h2>Bug Details</h2>
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
            <Popup
        trigger={
          <button className="button-add">
            <Icon icon="carbon:add-alt" style={{ fontSize: "23px" }} />
            <span>Add New</span>
          </button>
        }
        modal
        contentStyle={{ padding: '20px', borderRadius: '8px', width: '400px' }}
      >
        {(close) => (
          <div>
            <h2>Add New Task</h2>
            <form onSubmit={(e) => { handleAddTask(e); close(); }}>
              <div>
                <label>Template Name:</label>
                <input
                  type="text"
                  value={newTask.Template_Name}
                  onChange={(e) => setNewTask({ ...newTask, Template_Name: e.target.value })}
                  required
                  placeholder="Enter Template Name"
                />
              </div>
              <div>
                <label>Summary:</label>
                <input
                  value={newTask.Summary}
                  onChange={(e) => setNewTask({ ...newTask, Summary: e.target.value })}
                  required
                  placeholder="Enter Summary"
                />
              </div>
              <div>
                <label>Priority:</label>
                <select
                  value={newTask.Priority}
                  onChange={(e) => setNewTask({ ...newTask, Priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label>Severity:</label>
                <select
                  value={newTask.Severity}
                  onChange={(e) => setNewTask({ ...newTask, Severity: e.target.value })}
                >
                  <option value="Minor">Minor</option>
                  <option value="Major">Major</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label>Assigned To:</label>
                <input
                  type="text"
                  value={newTask.Assigned_To}
                  onChange={(e) => setNewTask({ ...newTask, Assigned_To: e.target.value })}
                  required
                  placeholder="Enter Assignee"
                />
                <div>
                  <label>Bug Due Date:</label>
                  <input
                    type="date"
                    value={newTask.Bug_DueDate}
                    onChange={(e) => setNewTask({ ...newTask, Bug_DueDate: e.target.value })}
                    required
                    placeholder="Enter Bug Due Date"
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
                              width: '30%',
                            }}
                          >
                            Add task
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
                              width: '30%',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                        </div>
                      </form>
                    </div>
        )}
      </Popup>
          
          </div>
          {loading ? (
            <p>Loading...</p>
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

          {isEditPopupOpen && (
            <Popup open={isEditPopupOpen} onClose={() => setIsEditPopupOpen(false)} modal>
              <form onSubmit={handleSave}>
                <h3>Edit Task</h3>
                <label>Template Name:</label>
                <input
                  type="text"
                  value={editingTask?.Temp_Name || ""}
                  onChange={(e) => setEditingTask({ ...editingTask,  Temp_Name: e.target.value })}
                  placeholder="Template Name"
                  required
                />
                <label>Summary:</label>
                <input
                  type="text"
                  value={editingTask?.Summary}
                  onChange={(e) => setEditingTask({ ...editingTask, Summary: e.target.value })}
                  placeholder="Summary"
                  required
                />
                <label>Bug_status:</label>
                <input
                  type="text"
                  value={editingTask?.Bug_status}
                  onChange={(e) => setEditingTask({ ...editingTask, Bug_status: e.target.value })}
                  placeholder="Bugstatus"
                  required
                />
                <label>Assigned To:</label>
                <input
                  type="text"
                  value={editingTask?.Assigned_to}
                  onChange={(e) => setEditingTask({ ...editingTask, Assigned_to: e.target.value })}
                  placeholder="Assigned To"
                  required
                />
                <button type="submit">Save</button>
              </form>
            </Popup>
          )}
        </div>
      </div>
    </>
  );
}
