import { BadgeRepository } from '../repository/badge.repository';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Test } from '../../CourseModule/entity/test.entity';
import { User } from '../../UserModule/entity/user.entity';
import { EventNameEnum } from '../enum/event-name.enum';
import { AchievementRepository } from '../repository/achievement.repository';
import * as PubSub from 'pubsub-js';
import { CourseTakenService } from '../../CourseModule/service/course.taken.service';
import { CourseTaken } from '../../CourseModule/entity/course.taken.entity';
import { CourseTakenStatusEnum } from '../../CourseModule/enum/enum';
import { CompleteCourseRewardDTO } from '../dto/complete-course-reward.dto';
import { CourseNpsRewardDTO } from '../dto/course-nps-reward.dto';

export interface TestOnFirstTake {
  chosenAlternative: string;
  user: User;
  test: Test;
}

interface CheckTestRule {
  testId: string;
  try: number;
}

@Injectable()
export class CourseRewardsService implements OnModuleInit {
  private readonly achievementRepository: AchievementRepository;
  private readonly badgeRepository: BadgeRepository;

  // if we take courseTakenService off, we will be able to see the console.log inside the constructor and onModuleInit.
  // and the event for checkTestReward will work as expected
  constructor(private readonly courseTakenService: CourseTakenService) {
    console.log('inside CourseRewardsService constructor');
  }

  onModuleInit(): void {
    console.log('inside CourseRewardsService onModuleInit');
    PubSub.subscribe(
      EventNameEnum.COURSE_REWARD_TEST_ON_FIRST_TAKE,
      async (message: string, data: TestOnFirstTake) => {
        await this.checkTestReward(data);
      },
    );
  }

  private async checkTestReward({
    chosenAlternative,
    test,
    user,
  }: TestOnFirstTake): Promise<void> {
    console.log('inside checkTestReward');
  }
}
