import { useState } from "react";
import axios from "axios";

export default function AddRecordForm({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/records",
        { title, description, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAdd(data);
      onClose();
    } catch (err) {
      alert("Error adding record");
      console.error(err);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-4"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add New Health Record
      </h2>

      <input
        type="text"
        placeholder="Title"
        className="border p-2 rounded w-full mb-3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        className="border p-2 rounded w-full mb-3"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        type="date"
        className="border p-2 rounded w-full mb-4"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full"
      >
        Save Record
      </button>
    </form>
  );
}
