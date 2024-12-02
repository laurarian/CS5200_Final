import mongoose from "mongoose";

const OnixIssuesLogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    isbn: { type: String },
    issues: [{ type: String }],
    source: { type: String },
  },
  { timestamps: true, collection: "onixIssuesLog" }
);

export default mongoose.models.OnixIssuesLog ||
  mongoose.model("OnixIssuesLog", OnixIssuesLogSchema);
