import mongoose from "mongoose";

const MarcIssuesLogSchema = new mongoose.Schema(
  {
    record: [{ type: String }],
    issues: [{ type: String }],
  },
  { timestamps: true, collection: "marcIssuesLog" }
);

export default mongoose.models.MarcIssuesLog ||
  mongoose.model("MarcIssuesLog", MarcIssuesLogSchema);
