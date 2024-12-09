import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("To Do");
  const [filter, setFilter] = useState("");

  const fetchTasks = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const { data } = await axios.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch tasks");
    }
  };

  const addTask = async () => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.post(
        "/api/tasks",
        { title, description, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = async (id, updatedTask) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(`/api/tasks/${id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <h2>Task Dashboard</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
      <button onClick={addTask}>Add Task</button>

      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <ul>
        {tasks
          .filter((task) => !filter || task.status === filter)
          .map((task) => (
            <li key={task.id}>
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
              <button onClick={() => updateTask(task.id, { ...task, status: "Completed" })}>
                Mark as Completed
              </button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Dashboard;
