import { BadgeRepository } from '../repository/badge.repository';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Test } from '../../CourseModule/entity/test.entity';
import { User } from '../../UserModule/entity/user.entity';
import { EventNameEnum } from '../enum/event-name.enum';
import { AchievementRepository } from '../repository/achievement.repository';
import * as PubSub from 'pubsub-js';
import { CourseTaken } from '../../CourseModule/entity/course.taken.entity';
import { CourseTakenStatusEnum } from '../../CourseModule/enum/enum';
import { CompleteCourseRewardDTO } from '../dto/complete-course-reward.dto';
import { CourseNpsRewardDTO } from '../dto/course-nps-reward.dto';
import { CourseTakenRepository } from '../../CourseModule/repository/course.taken.repository';
import { Achievement } from '../entity/achievement.entity';

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
  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly badgeRepository: BadgeRepository,
    private readonly courseTakenRepository: CourseTakenRepository,
  ) {}

  onModuleInit(): void {
    PubSub.subscribe(
      EventNameEnum.COURSE_REWARD_TEST_ON_FIRST_TAKE,
      async (message: string, data: TestOnFirstTake) => {
        await this.checkTestReward(data);
      },
    );
    PubSub.subscribe(
      EventNameEnum.COURSE_REWARD_COURSE_NPS,
      async (message: string, data: CourseNpsRewardDTO) => {
        await this.courseNpsReward(data);
      },
    );
    PubSub.subscribe(
      EventNameEnum.COURSE_REWARD_COMPLETE_COURSE,
      async (message: string, data) => {
        await this.completeCourseReward(data);
      },
    );
  }

  private async completeCourseReward({
    courseId,
    userId,
  }: CompleteCourseRewardDTO): Promise<void> {
    const completedCourse = await this.courseTakenRepository.getCompletedByUserIdAndCourseId(
      userId,
      courseId,
    );

    if (!completedCourse) return;

    const badge = await this.badgeRepository.findByEventNameAndOrder(
      EventNameEnum.COURSE_REWARD_COMPLETE_COURSE,
      1,
    );

    await this.achievementRepository.save({
      user: completedCourse.user,
      badge,
      rule: { completion: 100, status: CourseTakenStatusEnum.COMPLETED },
      completed: true,
      eventName: EventNameEnum.COURSE_REWARD_COMPLETE_COURSE,
    });
  }

  private async checkTestReward({
    chosenAlternative,
    test,
    user,
  }: TestOnFirstTake): Promise<void> {
    const points = {
      1: () =>
        this.badgeRepository.findByEventNameAndOrder(
          EventNameEnum.COURSE_REWARD_TEST_ON_FIRST_TAKE,
          1,
        ),
      2: () =>
        this.badgeRepository.findByEventNameAndOrder(
          EventNameEnum.COURSE_REWARD_TEST_ON_FIRST_TAKE,
          2,
        ),
      3: () =>
        this.badgeRepository.findByEventNameAndOrder(
          EventNameEnum.COURSE_REWARD_TEST_ON_FIRST_TAKE,
          3,
        ),
      4: () =>
        this.badgeRepository.findByEventNameAndOrder(
          EventNameEnum.COURSE_REWARD_TEST_ON_FIRST_TAKE,
          4,
        ),
    };
    let [
      achievement,
    ] = await this.achievementRepository.getTestOnFirstTakeByUserAndRuleTestId<
      CheckTestRule
    >(test, user);

    if (achievement?.completed) return;
    if (achievement?.rule?.try >= 4) return;

    if (!achievement) {
      achievement = {
        ...achievement,
        rule: {
          testId: test.id,
          try: 1,
        },
      };
    } else {
      achievement = {
        ...achievement,
        rule: {
          ...achievement.rule,
          try: achievement.rule.try + 1,
        },
      };
    }

    const answerIsRight =
      chosenAlternative.toLowerCase() === test.correctAlternative.toLowerCase();

    const badge = await points[achievement.rule.try]();
    achievement = {
      ...achievement,
      eventName: EventNameEnum.COURSE_REWARD_TEST_ON_FIRST_TAKE,
      completed: answerIsRight,
      badge: answerIsRight ? badge : null,
      user,
    };

    await this.achievementRepository.save(achievement);
  }

  async courseNpsReward({
    userId,
    courseId,
  }: CourseNpsRewardDTO): Promise<void> {
    /*
     * Evento para verificar se o usuário avaliou o curso
     * Ele deve ganhar os pontos apenas se:
     * 1- Se ele está no curso
     * 2- Se ele finalizou o curso
     * 3- Se ele ainda não ganhou os pontos dessa gameficação
     * */

    const [
      achievement,
    ] = await this.achievementRepository.getNpsCourseAchievementByCourseIdAndUserIdAndBadgeId(
      userId,
      courseId,
    );

    if (achievement) return;

    const badge = await this.badgeRepository.findByEventNameAndOrder(
      EventNameEnum.COURSE_REWARD_COURSE_NPS,
      1,
    );

    if (!badge) return;

    const courseTaken: CourseTaken = await this.courseTakenRepository.findCompletedWithRatingByUserIdAndCourseId(
      userId,
      courseId,
    );

    if (!courseTaken) return;

    await this.achievementRepository.save({
      user: { id: userId },
      badge,
      rule: { courseId: courseTaken.course.id },
      eventName: EventNameEnum.COURSE_REWARD_COURSE_NPS,
      completed: true,
    });
  }
}
