import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { AchievementRepository } from '../repository/achievement.repository';
import { StartEventShareCourseRuleDTO } from '../dto/start-event-share-course.dto';
import { EventNameEnum } from '../enum/event-name.enum';
import { BadgeRepository } from '../repository/badge.repository';
import * as PubSub from 'pubsub-js';
import { CourseTaken } from '../../CourseModule/entity/course.taken.entity';
import { CourseTakenStatusEnum } from '../../CourseModule/enum/enum';
import { Achievement } from '../entity/achievement.entity';
import { UserService } from '../../UserModule/service/user.service';
import { CourseService } from '../../CourseModule/service/course.service';
import { CourseTakenService } from '../../CourseModule/service/course.taken.service';
import { StartEventRateAppRuleDTO } from '../dto/start-event-rate-app.dto';
import { User } from '../../UserModule/entity/user.entity';
import { Badge } from '../entity/badge.entity';
export interface SharedCourseRule {
  courseId: string;
}

export interface InviteUserRewardData {
  inviteKey: string;
}

@Injectable()
export class UserRewardsService implements OnModuleInit {
  private readonly achievementRepository: AchievementRepository;
  private readonly badgeRepository: BadgeRepository;

  // if we take userService, courseService and courseTakenService off, we will be able to see the console.log inside the constructor and onModuleInit.
  // and the event for checkTestReward will work as expected
  constructor(
    private readonly userService: UserService,
    private readonly courseService: CourseService,
    private readonly courseTakenService: CourseTakenService,
  ) {
    console.log('inside UserRewards constructor');
  }

  onModuleInit(): void {
    console.log('inside UserRewards onModuleInit');
    PubSub.subscribe(
      EventNameEnum.USER_REWARD_SHARE_COURSE,
      async (message: string, data: StartEventShareCourseRuleDTO) => {
        await this.shareCourseReward(data);
      },
    );
  }

  private async shareCourseReward({
    courseId,
    userId,
    platform,
  }: StartEventShareCourseRuleDTO): Promise<void> {
    console.log('inside shareCourseReward');
  }
}
