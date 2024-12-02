"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditBook() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  const collection = searchParams.get("collection") || "books_csv";

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const collectionFields = {
    books_csv: {
      editable: [
        "title",
        "materialType",
        "author",
        "publisher",
        "publicationYear",
        "isbn",
        "lccn",
        "subjects",
        "copies.total",
        "copies.available",
        "copies.checkedOut",
        "copies.lost",
      ],
      issuesLog: "issues",
    },
    books_marc: {
      editable: [
        "title",
        "publisher",
        "publicationYear",
        "language",
        "edition",
        "electronicResource",
        "callNumber",
        "callNumberPrefix",
        "recordControlNumber",
        "fixedData",
        "identifiers",
        "flags.isDuplicate",
        "flags.hasCollision",
        "flags.isMissingData",
        "recordTimestamp",
      ],
      issuesLog: "issues",
    },
    books_onix: {
      editable: [
        "isbn",
        "title",
        "author",
        "publisher",
        "price",
        "publicationDate",
        "source",
        "subjects",
      ],
      issuesLog: "issues",
    },
  };

  const fields = collectionFields[collection] || {
    editable: ["title"],
    issuesLog: "issues",
  };

  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/${collection}/${id}`);
        const data = await res.json();

        if (data.success) {
          const fetchedBook = data.data;
          if (
            (collection === "books_csv" || collection === "books_onix") &&
            Array.isArray(fetchedBook.subjects)
          ) {
            fetchedBook.subjects = fetchedBook.subjects.join(", ");
          }
          setBook(fetchedBook);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, collection]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setBook((prevBook) => ({
        ...prevBook,
        [parent]: {
          ...prevBook[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setBook((prevBook) => ({
        ...prevBook,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedBook = { ...book };

    if (collection === "books_csv" || collection === "books_onix") {
      if (updatedBook.subjects) {
        updatedBook.subjects = updatedBook.subjects
          .split(",")
          .map((s) => s.trim());
      }
    }

    try {
      const res = await fetch(`/api/${collection}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBook),
      });
      const data = await res.json();

      if (data.success) {
        alert("Updated successfully!");
        router.push("/all-books");
      } else {
        alert(`Update failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  if (loading) return <p className="text-gray-700">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!book) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Edit Book</h2>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {fields.editable.map((field) => {
          const fieldParts = field.split(".");
          const label = fieldParts
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");

          let value = book;
          fieldParts.forEach((part) => {
            value = value ? value[part] : "";
          });

          if (typeof value === "boolean") {
            return (
              <label key={field} className="flex items-center space-x-2">
                <span>{label}:</span>
                <input
                  type="checkbox"
                  name={field}
                  checked={value || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </label>
            );
          }

          if (Array.isArray(value)) {
            return (
              <label key={field}>
                {label}:
                <input
                  type="text"
                  name={field}
                  value={value.join(", ")}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            );
          }

          if (field.toLowerCase().includes("date")) {
            return (
              <label key={field}>
                {label}:
                <input
                  type="date"
                  name={field}
                  value={value || ""}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            );
          }

          if (
            field.toLowerCase().includes("year") ||
            field.toLowerCase().includes("price") ||
            field.toLowerCase().includes("copies")
          ) {
            return (
              <label key={field}>
                {label}:
                <input
                  type="number"
                  name={field}
                  value={value || ""}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            );
          }

          return (
            <label key={field}>
              {label}:
              <input
                type="text"
                name={field}
                value={value || ""}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field === "title"}
              />
            </label>
          );
        })}

        {fields.issuesLog && book[fields.issuesLog] && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Issues</h3>
            <ul className="list-disc list-inside text-red-500">
              {book[fields.issuesLog].map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
