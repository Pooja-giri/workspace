import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";

const createDocumentSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(2),
  category: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  url: z.string().optional(),
  size: z.number().optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  status: z
    .enum(["PENDING", "VERIFIED", "EXPIRED", "REJECTED"])
    .optional(),
});

const updateDocumentSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  url: z.string().optional(),
  size: z.number().optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  status: z
    .enum(["PENDING", "VERIFIED", "EXPIRED", "REJECTED"])
    .optional(),
});

const formatDocument = (doc: any) => ({
  ...doc,
  fileUrl: doc.url,
  category: doc.type || "GENERAL",
  status: "VERIFIED",
});

export const getDocuments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;

    const {
      employeeId,
      category,
      type,
      search,
      page = "1",
      limit = "20",
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.min(Math.max(Number(limit), 1), 100);

    const where: any = {
      organizationId,
    };

    if (typeof employeeId === "string") {
      where.employeeId = employeeId;
    }

    const typeFilter = category || type;
    if (typeof typeFilter === "string") {
      where.type = typeFilter;
    }

    if (typeof search === "string" && search.trim()) {
      where.name = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    const [documents, total] = await prisma.$transaction([
      prisma.document.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              jobTitle: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (currentPage - 1) * pageLimit,
        take: pageLimit,
      }),

      prisma.document.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data: documents.map(formatDocument),
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

export const getDocumentById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const document = await prisma.document.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.json({
      success: true,
      data: formatDocument(document),
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch document",
    });
  }
};

export const createDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;

    const parsed = createDocumentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid document data",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;
    const url = data.url || data.fileUrl;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Document URL is required",
      });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        organizationId,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const document = await prisma.document.create({
      data: {
        organizationId,
        employeeId: data.employeeId,
        name: data.name,
        url,
        type: data.type || data.category || "GENERAL",
        size: data.size,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: formatDocument(document),
    });
  } catch (error) {
    console.error("Create document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create document",
    });
  }
};

export const updateDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const parsed = updateDocumentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid document data",
        errors: parsed.error.flatten(),
      });
    }

    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const data = parsed.data;
    const updatePayload: any = {};

    if (data.name) updatePayload.name = data.name;
    if (data.url || data.fileUrl) updatePayload.url = data.url || data.fileUrl;
    if (data.type || data.category) updatePayload.type = data.type || data.category;
    if (data.size !== undefined) updatePayload.size = data.size;

    const document = await prisma.document.update({
      where: {
        id,
      },
      data: updatePayload,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Document updated successfully",
      data: formatDocument(document),
    });
  } catch (error) {
    console.error("Update document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update document",
    });
  }
};

export const deleteDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const document = await prisma.document.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    await prisma.document.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};