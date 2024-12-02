import connectToDatabase from "../../lib/mongodb";
import models from "../../models";

export default async function handler(req, res) {
  const { method } = req;

  await connectToDatabase();

  switch (method) {
    case "GET":
      try {
        const { page = 1, limit = 10, keyword = "" } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
          return res
            .status(400)
            .json({ success: false, error: "Invalid page or limit" });
        }

        const collections = ["books_csv", "books_marc", "books_onix"];

        const searchFields = {
          books_csv: ["title", "author", "publisher", "isbn"],
          books_marc: ["title", "publisher", "identifiers", "callNumber"],
          books_onix: ["title", "author", "publisher", "isbn"],
        };

        const regex = new RegExp(keyword, "i");

        let results = [];

        for (const collection of collections) {
          const Model = models[collection];

          if (!Model) continue;

          const orConditions = searchFields[collection].map((field) => {
            if (Array.isArray(Model.schema.path(field)?.instance)) {
              return { [field]: { $in: [regex] } };
            } else {
              return { [field]: regex };
            }
          });

          const query = { $or: orConditions };

          const docs = await Model.find(query).lean().exec();

          docs.forEach((doc) => {
            doc.collection = collection;
          });

          results = results.concat(docs);
        }

        const total = results.length;
        const totalPages = Math.ceil(total / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedResults = results.slice(start, end);

        res.status(200).json({
          success: true,
          data: paginatedResults,
          total,
          totalPages,
          currentPage: pageNum,
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
