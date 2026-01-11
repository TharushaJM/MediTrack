import Contact from "../models/Contact.js";

// POST /api/contact - Submit a contact message (public)
export const submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Create contact message
    const contact = await Contact.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    res.status(201).json({
      message: "Thank you! Your message has been sent.",
      contact: {
        id: contact._id,
        firstName: contact.firstName,
        lastName: contact.lastName,
      },
    });
  } catch (err) {
    console.error("submitContact error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// GET /api/contact - Get all contact messages (admin only)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error("getAllContacts error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// GET /api/contact/unread-count - Get unread count (admin only)
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments({ status: "unread" });
    res.json({ count });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

// PATCH /api/contact/:id/status - Update message status (admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unread", "read", "replied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(contact);
  } catch (err) {
    console.error("updateContactStatus error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/contact/:id - Delete a message (admin only)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("deleteContact error:", err);
    res.status(500).json({ message: "Failed to delete message" });
  }
};
