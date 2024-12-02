import connectToDatabase from "../../../lib/mongodb";
import models from "../../../models";
import mongoose from "mongoose";

export default async function handler(req, res) {
  const { method } = req;
  const { collection, id } = req.query;

  await connectToDatabase();

  const Model = models[collection];

  if (!Model) {
    return res
      .status(400)
      .json({ success: false, error: "No such collection" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  switch (method) {
    case "GET":
      try {
        const document = await Model.findById(id);
        if (!document) {
          return res
            .status(404)
            .json({ success: false, error: "No document found" });
        }
        res.status(200).json({ success: true, data: document });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "PUT":
      try {
        const updatedDocument = await Model.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!updatedDocument) {
          return res
            .status(404)
            .json({ success: false, error: "No document found" });
        }
        res.status(200).json({ success: true, data: updatedDocument });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "DELETE":
      try {
        const deletedDocument = await Model.findByIdAndDelete(id);
        if (!deletedDocument) {
          return res
            .status(404)
            .json({ success: false, error: "No document found" });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
