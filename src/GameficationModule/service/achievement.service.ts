import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../repository/achievement.repository';
import { User } from '../../UserModule/entity/user.entity';
import { BadgeWithQuantityDTO } from '../dto/badge-with-quantity.dto';

@Injectable()
export class AchievementService {
  private readonly repository: AchievementRepository;
  constructor() {}

  findBadgesWithQuantityByUser(user: User): Promise<BadgeWithQuantityDTO[]> {
    return this.repository.findBadgesCountByUserId(user.id);
  }
}
