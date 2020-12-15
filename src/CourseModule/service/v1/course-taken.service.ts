import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrderEnum } from '../../../CommonsModule/enum/order.enum';
import { CourseTakenRepository } from '../../repository/course.taken.repository';
import { CourseTaken } from '../../entity/course-taken.entity';
import { getCoursesByFinished } from '../../../DashboardModule/interfaces/getCoursesByFinished';
import { PublisherService } from '../../../GameficationModule/service/publisher.service';

@Injectable()
export class CourseTakenService {
  @Inject(PublisherService)
  private readonly publisherService: PublisherService;

  constructor(private readonly repository: CourseTakenRepository) {}

  public async getActiveUsersQuantity(): Promise<number> {
    return this.repository.getActiveUsersQuantity();
  }

  public async getCertificateQuantity(): Promise<number> {
    return this.repository.getCertificateQuantity();
  }

  public async getUsersWithTakenCourses(): Promise<number> {
    return this.repository.getUsersWithTakenCourses();
  }

  public async getUsersWithCompletedCourses(): Promise<number> {
    return this.repository.getUsersWithCompletedCourses();
  }

  public async getUsersWithCompletedAndTakenCourses(): Promise<number> {
    return this.repository.getUsersWithCompletedAndTakenCourses();
  }

  public async getCoursesByFinished(
    order: OrderEnum,
    limit: number,
  ): Promise<getCoursesByFinished> {
    //executar query que rotorna o array de cursos de acordo com a ordem levando em consideração a coluna que armazena o array dos alunos que terminaram

    return this.repository.getDistinctCourses(order, limit);
  }

  public async findByUserIdAndCourseId(
    userId: string,
    courseId: number,
  ): Promise<CourseTaken> {
    const courseTaken = this.repository.findByUserIdAndCourseId(
      userId,
      courseId,
    );
    if (!courseTaken) {
      throw new NotFoundException('Course not taken by user');
    }
    return courseTaken;
  }
}
