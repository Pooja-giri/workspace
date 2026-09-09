"use client";

import { useState } from "react";

import { useAppDispatch } from "@/hooks/redux";

import {
  createDocument,
  fetchDocuments,
} from "@/components/documents/documentSlice";

import {
  CreateDocumentPayload,
} from "@/types/document";

interface Employee {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  designation?: string | null;
}

interface Props {
  employees: Employee[];
  onClose: () => void;
}

const categories = [
  "Identity",
  "Employment",
  "Education",
  "Tax",
  "Payroll",
  "Certification",
  "Contract",
  "Other",
];

export default function DocumentForm({
  employees,
  onClose,
}: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    employeeId: "",

    name: "",
    category: "Employment",

    description: "",

    fileUrl: "",

    issueDate: "",
    expiryDate: "",

    status: "PENDING" as const,
  });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const updateField = (
    field: string,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (!form.employeeId) {
      setError(
        "Please select an employee."
      );
      return;
    }

    if (!form.name.trim()) {
      setError(
        "Document name is required."
      );
      return;
    }

    if (!form.fileUrl.trim()) {
      setError(
        "Document URL is required."
      );
      return;
    }

    if (
      form.issueDate &&
      form.expiryDate &&
      new Date(form.issueDate) >
        new Date(form.expiryDate)
    ) {
      setError(
        "Issue date cannot be after expiry date."
      );
      return;
    }

    const payload: CreateDocumentPayload =
      {
        employeeId:
          form.employeeId,

        name: form.name.trim(),

        category:
          form.category,

        description:
          form.description.trim() ||
          undefined,

        fileUrl:
          form.fileUrl.trim(),

        issueDate:
          form.issueDate ||
          undefined,

        expiryDate:
          form.expiryDate ||
          undefined,

        status:
          form.status,
      };

    try {
      setSaving(true);

      await dispatch(
        createDocument(payload)
      ).unwrap();

      await dispatch(
        fetchDocuments({})
      );

      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to create document."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Employee */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Employee
        </label>

        <select
          value={form.employeeId}
          onChange={(event) =>
            updateField(
              "employeeId",
              event.target.value
            )
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        >
          <option value="">
            Select employee
          </option>

          {employees.map(
            (employee) => (
              <option
                key={employee.id}
                value={employee.id}
              >
                {employee.firstName}{" "}
                {employee.lastName}

                {employee.employeeCode
                  ? ` (${employee.employeeCode})`
                  : ""}
              </option>
            )
          )}
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Document Name
        </label>

        <input
          type="text"
          value={form.name}
          onChange={(event) =>
            updateField(
              "name",
              event.target.value
            )
          }
          placeholder="e.g. Employment Contract"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Category
        </label>

        <select
          value={form.category}
          onChange={(event) =>
            updateField(
              "category",
              event.target.value
            )
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        >
          {categories.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            )
          )}
        </select>
      </div>

      {/* File URL */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          File URL
        </label>

        <input
          type="url"
          value={form.fileUrl}
          onChange={(event) =>
            updateField(
              "fileUrl",
              event.target.value
            )
          }
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />

        <p className="mt-1 text-xs text-gray-400">
          For now, provide the URL of the stored
          document. File storage integration can be
          added later.
        </p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Issue Date
          </label>

          <input
            type="date"
            value={form.issueDate}
            onChange={(event) =>
              updateField(
                "issueDate",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Expiry Date
          </label>

          <input
            type="date"
            value={form.expiryDate}
            onChange={(event) =>
              updateField(
                "expiryDate",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Status
        </label>

        <select
          value={form.status}
          onChange={(event) =>
            updateField(
              "status",
              event.target.value
            )
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        >
          <option value="PENDING">
            Pending
          </option>

          <option value="VERIFIED">
            Verified
          </option>

          <option value="REJECTED">
            Rejected
          </option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          rows={4}
          value={form.description}
          onChange={(event) =>
            updateField(
              "description",
              event.target.value
            )
          }
          placeholder="Add notes about this document..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Add Document"}
        </button>
      </div>
    </form>
  );
}