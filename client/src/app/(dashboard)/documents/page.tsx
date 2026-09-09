"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import {
  deleteDocument,
  fetchDocuments,
} from "@/components/documents/documentSlice";

import { fetchEmployees } from "@/features/employees/employeeSlice";

import DocumentForm from "@/components/documents/DocumentForm";

export default function DocumentsPage() {
  const dispatch = useAppDispatch();

  const {
    documents,
    loading,
    error,
  } = useAppSelector(
    (state) => state.documents
  );

  const employees =
    useAppSelector(
      (state) =>
        state.employees.employees
    );

  const [showCreate, setShowCreate] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  useEffect(() => {
    dispatch(fetchEmployees({}));

    dispatch(
      fetchDocuments({})
    );
  }, [dispatch]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        documents
          .map(
            (document) =>
              document.category
          )
          .filter(Boolean)
      )
    );
  }, [documents]);

  const filteredDocuments =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return documents.filter(
        (document) => {
          const matchesSearch =
            !searchValue ||
            document.name
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            document.category
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            `${document.employee?.firstName || ""} ${
              document.employee?.lastName || ""
            }`
              .toLowerCase()
              .includes(
                searchValue
              );

          const matchesStatus =
            statusFilter === "ALL" ||
            document.status ===
              statusFilter;

          const matchesCategory =
            categoryFilter === "ALL" ||
            document.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );
        }
      );
    }, [
      documents,
      search,
      statusFilter,
      categoryFilter,
    ]);

  const verifiedCount =
    documents.filter(
      (document) =>
        document.status ===
        "VERIFIED"
    ).length;

  const pendingCount =
    documents.filter(
      (document) =>
        document.status ===
        "PENDING"
    ).length;

  const expiredCount =
    documents.filter(
      (document) =>
        document.status ===
        "EXPIRED"
    ).length;

  const rejectedCount =
    documents.filter(
      (document) =>
        document.status ===
        "REJECTED"
    ).length;

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-700";

      case "EXPIRED":
        return "bg-red-100 text-red-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmed) return;

    try {
      await dispatch(
        deleteDocument(id)
      ).unwrap();
    } catch (error: unknown) {
      window.alert(
        error instanceof Error
          ? error.message
          : error ||
          "Failed to delete document."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Documents
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage employee documents, certifications
            and important HR records.
          </p>
        </div>

        <button
          onClick={() =>
            setShowCreate(true)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Documents
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {documents.length}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-3">
              <FileText
                size={20}
                className="text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Verified
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {verifiedCount}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3">
              <ShieldCheck
                size={20}
                className="text-green-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pending
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-3">
              <AlertTriangle
                size={20}
                className="text-yellow-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Expired / Rejected
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {expiredCount +
                  rejectedCount}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3">
              <CheckCircle2
                size={20}
                className="text-red-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search documents or employees..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="VERIFIED">
              Verified
            </option>

            <option value="EXPIRED">
              Expired
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="ALL">
              All Categories
            </option>

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
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Document
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Employee
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Expiry
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading &&
              documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading documents...
                  </td>
                </tr>
              ) : filteredDocuments.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center"
                  >
                    <FileText
                      size={36}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-900">
                      No documents found
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Add an employee document
                      to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(
                  (document) => (
                    <tr
                      key={document.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-gray-100 p-2">
                            <FileText
                              size={17}
                              className="text-gray-600"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {document.name}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                              {document.description ||
                                "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {document.employee
                            ? `${document.employee.firstName} ${document.employee.lastName}`
                            : "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {document.employee
                            ?.employeeCode ||
                            ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          {document.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {document.expiryDate
                          ? new Date(
                              document.expiryDate
                            ).toLocaleDateString()
                          : "No expiry"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            document.status
                          )}`}
                        >
                          {document.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <a
                            href={
                              document.fileUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title="Open document"
                          >
                            <ExternalLink
                              size={17}
                            />
                          </a>

                          <button
                            onClick={() =>
                              handleDelete(
                                document.id
                              )
                            }
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete document"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Employee Document
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Store an employee document and its
                  metadata.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <DocumentForm
                employees={employees}
                onClose={() =>
                  setShowCreate(false)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}