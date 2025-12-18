import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { type: String, required: true }, // Ex: "2025-05-20"
  timeSlot: { type: String, required: true }, // Ex: "10:30 AM"
  reason: { type: String, default: "" }, // Reason for appointment
  status: { 
    type: String, 
    default: "Pending", 
    enum: ["Pending", "Confirmed", "Completed", "Cancelled"] 
  }
}, { timestamps: true }); 

export default mongoose.model('Appointment', appointmentSchema);