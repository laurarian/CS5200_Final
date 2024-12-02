"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [jumpPage, setJumpPage] = useState("");

  const limits = [10, 20, 50, 100];

  const { data, error } = useSWR(
    searchClicked
      ? `/api/search?keyword=${encodeURIComponent(
          keyword
        )}&page=${currentPage}&limit=${limit}`
      : null,
    fetcher
  );

  const books = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const isLoading = !data && searchClicked && !error;
  const isError = error || (data && !data.success);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchClicked(true);
    setCurrentPage(1);
  };

  const handleDelete = async (id, collection) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`/api/${collection}/${id}`, {
        method: "DELETE",
      });
      const deleteData = await res.json();

      if (deleteData.success) {
        mutate(
          `/api/search?keyword=${encodeURIComponent(
            keyword
          )}&page=${currentPage}&limit=${limit}`
        );
      } else {
        alert(`Delete failed: ${deleteData.error}`);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
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
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-4 text-center">Search Books</h2>

      <form
        onSubmit={handleSearch}
        className="flex items-center space-x-4 justify-center mb-4"
      >
        <input
          type="text"
          placeholder="Enter book title, author, publisher or ISBN"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-16 w-16 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          ></svg>
          <span className="ml-4 text-gray-700 text-xl">Loading...</span>
        </div>
      ) : isError ? (
        <p className="text-red-500">
          Error: {error?.message || error.toString()}
        </p>
      ) : books.length === 0 && searchClicked ? (
        <p className="text-gray-700 mt-4">No books found.</p>
      ) : (
        searchClicked && (
          <>
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

            <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-md">
              <thead>
                <tr>
                  <th className="py-2 px-4 border border-gray-300">
                    Collection
                  </th>
                  <th className="py-2 px-4 border border-gray-300">Title</th>
                  <th className="py-2 px-4 border border-gray-300">Author</th>
                  <th className="py-2 px-4 border border-gray-300">
                    Publisher
                  </th>
                  <th className="py-2 px-4 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border border-gray-300 whitespace-normal break-words">
                      {book.collection}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 whitespace-normal break-words">
                      {book.title}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 whitespace-normal break-words">
                      {book.author || "N/A"}
                    </td>
                    <td className="py-2 px-4 border border-gray-300 whitespace-normal break-words">
                      {book.publisher || "N/A"}
                    </td>
                    <td className="py-6 px-4 border flex items-center space-x-2">
                      <Link
                        href={`/edit/${book._id}?collection=${book.collection}`}
                      >
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded-md border border-yellow-500 hover:bg-yellow-600 transition focus:outline-none">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(book._id, book.collection)}
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
        )
      )}
    </div>
  );
}
