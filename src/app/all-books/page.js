"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AllBooks() {
  const [selectedCollection, setSelectedCollection] = useState("books_csv");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [windowSize, setWindowSize] = useState(3);
  const [jumpPage, setJumpPage] = useState("");
  const router = useRouter();

  const collections = [
    { key: "books_csv", label: "CSV" },
    { key: "books_marc", label: "MARC" },
    { key: "books_onix", label: "XML" },
  ];

  const limits = [10, 20, 50, 100];

  const { data, error } = useSWR(
    `/api/${selectedCollection}?page=${currentPage}&limit=${limit}&windowSize=${windowSize}`,
    fetcher
  );

  const isLoading = !data && !error;
  const isError = error || (data && !data.success);

  // Extract pagination data
  const pagesData = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Calculate the current window
  const windowStartPage =
    Math.floor((currentPage - 1) / windowSize) * windowSize + 1;
  const windowEndPage = Math.min(windowStartPage + windowSize - 1, totalPages);
  const currentWindowPages = windowEndPage - windowStartPage + 1;

  // Get data for the current page from the fetched window
  const fetchedPages = pagesData.slice(
    currentPage - windowStartPage,
    currentPage - windowStartPage + currentWindowPages
  );
  const books = fetchedPages[0] || [];

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`/api/${selectedCollection}/${id}`, {
        method: "DELETE",
      });
      const deleteData = await res.json();

      if (deleteData.success) {
        mutate(
          `/api/${selectedCollection}?page=${windowStartPage}&limit=${limit}&windowSize=${windowSize}`
        );
      } else {
        alert(`Delete failed: ${deleteData.error}`);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleEdit = (id) => {
    router.push(`/edit/${id}?collection=${selectedCollection}`);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleJumpPageChange = (e) => {
    setJumpPage(e.target.value);
  };

  const handleJumpPageSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(jumpPage, 10);
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
      alert(`Please enter a valid page number between 1 and ${totalPages}.`);
      return;
    }
    setCurrentPage(pageNumber);
    setJumpPage("");
  };

  return (
    <div>
      <h2 className="text-4xl font-semibold mb-6 text-center">All Books</h2>
      <div className="flex justify-center">
        <div className="w-full max-w-6xl p-4">
          <div className="mb-6">
            <div className="flex space-x-4 justify-center">
              {collections.map((col) => (
                <button
                  key={col.key}
                  onClick={() => {
                    setSelectedCollection(col.key);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    selectedCollection === col.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 flex justify-end">
            <label className="flex items-center">
              <span className="mr-2">Limit:</span>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {limits.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <svg
                className="animate-spin h-16 w-16 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              <span className="ml-4 text-gray-700 text-xl">Loading...</span>
            </div>
          ) : isError ? (
            <p className="text-red-500">
              Error: {error?.message || error.toString()}
            </p>
          ) : books.length === 0 ? (
            <p className="text-gray-700">No books found.</p>
          ) : (
            <>
              <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-md">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border border-gray-300">Title</th>
                    <th className="py-2 px-4 border border-gray-300">Author</th>
                    <th className="py-2 px-4 border border-gray-300">
                      Publisher
                    </th>
                    <th className="py-2 px-4 border border-gray-300">
                      Publication Year
                    </th>
                    <th className="py-2 px-4 border border-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border border-gray-300 whitespace-normal break-words">
                        {book.title}
                      </td>
                      <td className="py-2 px-4 border border-gray-300 whitespace-normal break-words">
                        {book.author || "N/A"}
                      </td>
                      <td className="py-2 px-4 border border-gray-300 whitespace-normal break-words">
                        {book.publisher || "N/A"}
                      </td>
                      <td className="py-2 px-4 border border-gray-300 whitespace-normal break-words">
                        {book.publicationYear || "N/A"}
                      </td>
                      <td className="py-6 px-4 border flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(book._id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md border border-yellow-500 hover:bg-yellow-600 transition focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md border border-red-500 hover:bg-red-600 transition focus:outline-none"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-gray-700">
                    Page {currentPage} of {totalPages} | Total: {total}
                  </span>
                </div>
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                    )
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <span
                            key={`ellipsis-${page}`}
                            className="px-2 text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === page
                              ? "bg-blue-700 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          } transition`}
                        >
                          {page}
                        </button>
                      );
                    })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition`}
                  >
                    Next
                  </button>

                  {/* Add Jump to Page Form */}
                  <form
                    onSubmit={handleJumpPageSubmit}
                    className="flex items-center"
                  >
                    <span className="ml-4 mr-2 text-gray-700">Go to page:</span>
                    <input
                      type="number"
                      value={jumpPage}
                      onChange={handleJumpPageChange}
                      min="1"
                      max={totalPages}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="ml-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition focus:outline-none"
                    >
                      Jump
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
