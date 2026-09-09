import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { generateAccessToken } from "../utils/jwt";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const {
    name,
    email,
    password,
    organizationName,
  } = input;

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const organizationSlug = `${organizationName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${Date.now()}`;

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: organizationName.trim(),
        slug: organizationSlug,
      },
    });

    const adminRole = await tx.role.create({
      data: {
        organizationId: organization.id,
        name: "Administrator",
        key: "ADMIN",
      },
    });

    const user = await tx.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
    });

    const membership = await tx.membership.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        roleId: adminRole.id,
      },
    });

    const employee = await tx.employee.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        employeeCode: `EMP-${Date.now()}`,
        firstName: name.trim().split(" ")[0] || name.trim(),
        lastName: name.trim().split(" ").slice(1).join(" ") || "",
        email: normalizedEmail,
        jobTitle: "Administrator",
        joiningDate: new Date(),
      },
    });

    return {
      organization,
      user,
      membership,
      employee,
      role: adminRole,
    };
  });

  const accessToken = generateAccessToken({
    userId: result.user.id,
    organizationId: result.organization.id,
    membershipId: result.membership.id,
    roleId: result.role.id,
  });

  return {
    accessToken,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
    },
    organization: {
      id: result.organization.id,
      name: result.organization.name,
      slug: result.organization.slug,
    },
    role: {
      id: result.role.id,
      name: result.role.name,
      key: result.role.key,
    },
  };
}

export async function loginUser(input: LoginInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    include: {
      memberships: {
        include: {
          organization: true,
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Your account is inactive");
  }

  const membership = user.memberships[0];

  if (!membership) {
    throw new Error("User is not associated with an organization");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    organizationId: membership.organizationId,
    membershipId: membership.id,
    roleId: membership.roleId,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
    },
    role: {
      id: membership.role.id,
      name: membership.role.name,
      key: membership.role.key,
    },
  };
}