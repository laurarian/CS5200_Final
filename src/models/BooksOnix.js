import mongoose from "mongoose";

const BooksOnixSchema = new mongoose.Schema(
  {
    isbn: { type: String },
    title: { type: String, required: true },
    author: { type: String },
    publisher: { type: String },
    price: { type: String },
    subjects: [{ type: String }],
    publicationDate: { type: String },
    source: { type: String },
  },
  { timestamps: true, collection: "books_onix" }
);

export default mongoose.models.BooksOnix ||
  mongoose.model("BooksOnix", BooksOnixSchema);
