"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddBook() {
  const router = useRouter();
  const [selectedCollection, setSelectedCollection] = useState("");
  const [book, setBook] = useState({});
  const [error, setError] = useState(null);

  const collections = [
    { key: "books_csv", label: "CSV" },
    { key: "books_marc", label: "MARC" },
    { key: "books_onix", label: "XML" },
  ];

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
    },
  };

  const fields = collectionFields[selectedCollection] || { editable: [] };

  const handleFieldChange = (e) => {
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

    const newBook = { ...book };

    if (
      selectedCollection === "books_csv" ||
      selectedCollection === "books_onix"
    ) {
      if (newBook.subjects) {
        newBook.subjects = newBook.subjects.split(",").map((s) => s.trim());
      }
    }

    try {
      const res = await fetch(`/api/${selectedCollection}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBook),
      });
      const data = await res.json();

      if (data.success) {
        alert("Book added successfully!");
        router.push("/all-books");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 className="text-3xl font-semibold mb-8 text-center">Add New Book</h2>

      {!selectedCollection ? (
        <div className="flex space-x-4 justify-center">
          {collections.map((col) => (
            <button
              key={col.key}
              onClick={() => setSelectedCollection(col.key)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {col.label}
            </button>
          ))}
        </div>
      ) : (
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
                    onChange={handleFieldChange}
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
                    onChange={handleFieldChange}
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
                    onChange={handleFieldChange}
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
                    onChange={handleFieldChange}
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
                  onChange={handleFieldChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={field === "title"}
                />
              </label>
            );
          })}

          {error && <p className="text-red-500">Error: {error}</p>}

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setSelectedCollection("")}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
