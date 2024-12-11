import Header from "../components/Header";
import SideBar from "../components/SideBar";
import React, { useState, useEffect, useCallback } from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa"; // Importing icons
import { format } from 'date-fns'; // Importing date-fns for date formatting
import axios from "axios";
import Popup from "reactjs-popup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      Assigned_Due_Date: '', // Empty by default; you can set a default if needed
    });

  // Generate a unique Bug ID
  const generateTemplateID = () => `T-${Date.now()}`;

  const generateBugID = () => `B-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleAddTask = async (e) => {

     // Validate required fields
  if (!newTask.Template_Name) {
    toast.error('Template Name is required!');
    return;
  }
  if (!newTask.Assigned_To) {
    toast.error('Assigned To is required!');
    return;
  }
    e.preventDefault();
    const task = {
      ...newTask,
      Template_ID: generateTemplateID(),
      Bug_ID: generateBugID(),
    };
    console.log("Task Payload:", task); // Log the payload

    try {
      await axios.post('http://localhost:8000/api/bugreport', task);
      toast.success('Task added successfully!');
      fetchData();
      setNewTask({
        Temp_id: '',
        Temp_Name: '',
        Bug_Id: '',
        Summary: '',
        ScreenShot: '',
        Priority: 'Low',
        Severity: 'Minor',
        Assigned_to: '',
        Assigned_date: new Date().toISOString().split('T')[0],
        Bug_DueDate: '',
        Completed_Date: new Date().toISOString().split('T')[0],
        Bug_status: 'Pending',
      });
    } catch (error) {
      console.error('Error adding task:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to add task.');
    }
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/bugreport");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks.");
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
      toast.success("Task updated successfully!");
      setIsEditPopupOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  const handleDelete = async (task) => {
    if (window.confirm(`Are you sure you want to delete ${task.Template_Name}?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/bugreport/${task._id}`);
        toast.success(`${task.Template_Name} deleted successfully!`);
        fetchData();
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task.");
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
          <div className="controls">
            <input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          
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
