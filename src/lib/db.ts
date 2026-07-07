import { getPrisma } from "./prisma";

export async function getOrCreateUser(phone: string) {
  const prisma = await getPrisma();
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone },
    });
  }
  return user;
}

export async function createOrUpdateProfile(
  userId: string,
  data: {
    age?: number;
    occupation?: string;
    monthlyIncome?: number;
    education?: string;
    disabilityStatus?: boolean;
    maritalStatus?: string;
    locationState?: string;
    hasLand?: boolean;
    language?: string;
  }
) {
  const prisma = await getPrisma();
  return prisma.citizenProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function getProfileData(userId: string) {
  const prisma = await getPrisma();
  const profile = await prisma.citizenProfile.findUnique({
    where: { userId },
  });
  if (!profile) return null;
  return {
    age: profile.age,
    occupation: profile.occupation,
    monthlyIncome: profile.monthlyIncome,
    education: profile.education,
    disabilityStatus: profile.disabilityStatus,
    maritalStatus: profile.maritalStatus,
    locationState: profile.locationState,
    hasLand: profile.hasLand,
    language: profile.language,
    benefitsClaimed: profile.benefitsClaimed
      ? JSON.parse(profile.benefitsClaimed)
      : [],
  };
}

export async function createJourney(
  userId: string,
  title: string,
  description: string | null,
  tasks: { title: string; description: string; order: number; documentType: string | null }[]
) {
  const prisma = await getPrisma();
  return prisma.journey.create({
    data: {
      userId,
      title,
      description,
      tasks: {
        create: tasks.map((t) => ({
          title: t.title,
          description: t.description,
          order: t.order,
          documentType: t.documentType,
        })),
      },
    },
    include: { tasks: { orderBy: { order: "asc" } } },
  });
}

export async function getUserJourneys(userId: string) {
  const prisma = await getPrisma();
  return prisma.journey.findMany({
    where: { userId },
    include: { tasks: { orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateTaskStatus(taskId: string, status: string) {
  const prisma = await getPrisma();
  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
}

export async function recalculateJourneyProgress(journeyId: string) {
  const prisma = await getPrisma();
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: { tasks: true },
  });
  if (!journey || journey.tasks.length === 0) return;
  const completed = journey.tasks.filter((t) => t.status === "COMPLETED").length;
  const progress = Math.round((completed / journey.tasks.length) * 100);
  await prisma.journey.update({
    where: { id: journeyId },
    data: { progress },
  });
}

export async function createDocument(
  userId: string,
  name: string,
  type: string,
  fileUrl: string
) {
  const prisma = await getPrisma();
  return prisma.document.create({
    data: { userId, name, type, fileUrl },
  });
}

export async function updateDocumentStatus(
  documentId: string,
  status: string,
  extractedData?: string,
  errorDetails?: string
) {
  const prisma = await getPrisma();
  return prisma.document.update({
    where: { id: documentId },
    data: {
      status,
      extractedData,
      errorDetails,
      verifiedAt: status === "VERIFIED" ? new Date() : undefined,
    },
  });
}

export async function getUserDocuments(userId: string) {
  const prisma = await getPrisma();
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCivicCase(
  userId: string,
  title: string,
  description: string | null,
  category: string | null
) {
  const prisma = await getPrisma();
  const timeline = JSON.stringify([
    {
      date: new Date().toISOString(),
      event: "Case submitted",
      status: "SUBMITTED",
    },
  ]);
  return prisma.civicCase.create({
    data: { userId, title, description, category, timeline },
  });
}

export async function getUserCases(userId: string) {
  const prisma = await getPrisma();
  return prisma.civicCase.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}
