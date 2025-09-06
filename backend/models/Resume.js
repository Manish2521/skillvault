import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    url:      { type: String, required: true },
    sizeMB:   { type: Number, required: true },
    createdAt:{ type: Date,   default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", ResumeSchema);
