import connectToDatabase from "../../../lib/mongodb";
import models from "../../../models";

export default async function handler(req, res) {
  const { method } = req;
  const { collection } = req.query;

  await connectToDatabase();

  const Model = models[collection];

  if (!Model) {
    return res
      .status(400)
      .json({ success: false, error: "No such collection" });
  }

  switch (method) {
    case "GET":
      try {
        const { page = 1, limit = 10, windowSize = 3 } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const windowSizeNum = parseInt(windowSize, 10);

        if (
          isNaN(pageNum) ||
          isNaN(limitNum) ||
          isNaN(windowSizeNum) ||
          pageNum < 1 ||
          limitNum < 1 ||
          windowSizeNum < 1
        ) {
          return res.status(400).json({
            success: false,
            error: "Invalid page, limit, or windowSize",
          });
        }

        const skip = (pageNum - 1) * limitNum;
        const fetchLimit = windowSizeNum * limitNum;
        const total = await Model.countDocuments({});
        const totalPages = Math.ceil(total / limitNum);

        const adjustedFetchLimit =
          skip + fetchLimit > total ? total - skip : fetchLimit;

        const documents = await Model.find({})
          .skip(skip)
          .limit(adjustedFetchLimit)
          .sort({ createdAt: -1 });

        const pagesData = [];
        for (let i = 0; i < documents.length; i += limitNum) {
          pagesData.push(documents.slice(i, i + limitNum));
        }

        res.status(200).json({
          success: true,
          data: pagesData,
          total,
          totalPages,
          currentPage: pageNum,
          windowSize: windowSizeNum,
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "POST":
      try {
        const document = await Model.create(req.body);
        res.status(201).json({ success: true, data: document });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
