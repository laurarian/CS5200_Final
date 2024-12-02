import mongoose from "mongoose";

const CopiesSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    checkedOut: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
  },
  { _id: false }
);

const BooksCsvSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    materialType: { type: String, required: true },
    author: { type: String },
    isbn: { type: String },
    publisher: { type: String },
    publicationYear: { type: String },
    lccn: { type: String },
    subjects: [{ type: String }],
    copies: CopiesSchema,
  },
  { timestamps: true, collection: "books_csv" }
);

export default mongoose.models.BooksCsv ||
  mongoose.model("BooksCsv", BooksCsvSchema);
