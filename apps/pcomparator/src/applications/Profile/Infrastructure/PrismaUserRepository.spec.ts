import type { ProfileUpdate } from "~/applications/Profile/Domain/Entities/Profile";
import { PrismaProfileRepository } from "~/applications/Profile/Infrastructure/PrismaUserRepository";
import { prisma } from "~/libraries/prisma";

jest.mock("~/libraries/prisma", () => ({
  __esModule: true,
  prisma: {
    user: {
      update: jest.fn(),
      findUnique: jest.fn()
    }
  }
}));

const profileFixture = (): ProfileUpdate => ({
  id: "123",
  image: "path/to/image.png",
  name: "John Doe",
  phone: "123-456-7890"
});

describe("PrismaProfileRepository", () => {
  const profileRepository = new PrismaProfileRepository();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("update", () => {
    it("should update and return the profile", async () => {
      const mockUpdateData = profileFixture();
      const mockUpdatedProfile = {
        id: "123",
        phone: mockUpdateData.phone,
        name: mockUpdateData.name,
        image: "path/to/image.png"
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedProfile);

      const result = await profileRepository.update(mockUpdateData);

      expect(result).toEqual(profileFixture());
      expect(prisma.user.update).toHaveBeenCalledWith({
        data: { phone: mockUpdateData.phone, name: mockUpdateData.name },
        where: { id: mockUpdateData.id }
      });
    });

    it("should throw an error if update fails", async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(profileRepository.update(profileFixture())).rejects.toThrow("Database error");
    });
  });

  describe("findById", () => {
    it("should return a profile if found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(profileFixture());

      const result = await profileRepository.findById("123");

      expect(result).toEqual(profileFixture());
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "123" } });
    });

    it("should return null if no profile is found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await profileRepository.findById("456");

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "456" } });
    });

    it("should throw an error if database query fails", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(profileRepository.findById("789")).rejects.toThrow("Database error");
    });
  });
});
