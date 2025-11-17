import type { Profile, ProfileUpdate } from "~/applications/Profile/Domain/Entities/Profile";
import type { ProfileRepository } from "~/applications/Profile/Domain/Repositories/ProfileRepository";

export class ProfileApplicationService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async updateProfile(data: ProfileUpdate): Promise<Profile> {
    return await this.profileRepository.update(data);
  }

  async getProfile(id: string): Promise<Profile | null> {
    return await this.profileRepository.findById(id);
  }
}
