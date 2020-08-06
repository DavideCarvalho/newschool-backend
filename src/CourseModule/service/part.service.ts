import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { PartUpdateDTO } from '../dto/part-update.dto';
import { PartRepository } from '../repository/part.repository';
import { Part } from '../entity/part.entity';
import { NewPartDTO } from '../dto/new-part.dto';
import { Lesson } from '../entity/lesson.entity';
import { InjectRepository } from 'nestjs-mikro-orm';

@Injectable()
export class PartService {
  constructor(
    private readonly lessonService: LessonService,
    @InjectRepository(Part)
    private readonly repository: PartRepository,
  ) {}

  public async add(part: NewPartDTO): Promise<Part> {
    if (!part.vimeoUrl && !part.youtubeUrl) {
      throw new BadRequestException('Part must have a video url');
    }

    const lesson: Lesson = await this.lessonService.findById(part.lessonId);

    const lessonSameTitle: Part = await this.repository.findByTitleAndLesson(
      part.title,
      lesson,
    );

    if (lessonSameTitle) {
      throw new ConflictException(
        'There is already a part with this title for this lesson',
      );
    }

    const createdPart = await this.repository.create({
      ...part,
      lesson,
      sequenceNumber: 1 + (await this.repository.count({ lesson })),
    });
    await this.repository.persistAndFlush(createdPart);
    return createdPart;
  }

  public async update(
    id: Part['id'],
    partUpdatedInfo: PartUpdateDTO,
  ): Promise<Part> {
    const part: Part = await this.repository.findByIdWithLesson(id);
    if (!part) {
      throw new NotFoundException('Part not found');
    }
    const lesson =
      partUpdatedInfo.lessonId === part.lesson.id
        ? part.lesson
        : await this.lessonService.findById(partUpdatedInfo.lessonId);
    const updatedPart = await this.repository.create({
      ...part,
      ...partUpdatedInfo,
      lesson,
    });
    await this.repository.persistAndFlush(updatedPart);
    return updatedPart;
  }

  public async getAll(lessonId: string): Promise<Part[]> {
    return this.repository.find({
      lesson: await this.lessonService.findById(lessonId),
    });
  }

  public async findById(id: Part['id']): Promise<Part> {
    const part: Part = await this.repository.findOne(id);
    if (!part) {
      throw new NotFoundException();
    }
    return part;
  }

  public async delete(id: Part['id']): Promise<void> {
    const deletedPart: Part = await this.repository.findOne({ id });
    const partQuantity: number = await this.repository.count({
      lesson: deletedPart.lesson,
    });
    await this.repository.remove({ id });
    await this.repository.flush();

    if (deletedPart.sequenceNumber === partQuantity) {
      return;
    }

    // const parts: Part[] = await this.repository.find({
    //   where: {
    //     sequenceNumber: MoreThan(deletedPart.sequenceNumber),
    //   },
    //   order: {
    //     sequenceNumber: 'ASC',
    //   },
    // });

    const parts: Part[] = await this.repository.find(
      {
        sequenceNumber: {
          $gt: deletedPart.sequenceNumber,
        },
      },
      {
        orderBy: {
          sequenceNumber: 'ASC',
        },
      },
    );

    for (const part of parts) {
      const updatedPart = await this.repository.create({
        ...part,
        sequenceNumber: part.sequenceNumber - 1,
      });
      await this.repository.persistAndFlush(updatedPart);
    }
  }

  public async countByLesson(lesson: Lesson): Promise<number> {
    return await this.repository.count({ lesson });
  }

  public async getPartIdByLessonIdAndSeqNum(
    lesson: string,
    sequenceNumber: number,
  ): Promise<Part['id']> {
    lesson: Part['lesson'] = lesson;
    const part = await this.repository.findOne({
      lesson: Part['lesson'],
      sequenceNumber,
    });
    return part.id;
  }

  public async getByLessonAndSequenceNumber(
    lesson: Lesson,
    sequenceNumber: number,
  ): Promise<Part> {
    return await this.repository.findOne({
      lesson,
      sequenceNumber,
    });
  }

  public async findPartByLessonIdAndSeqNum(
    lesson: string,
    sequenceNumber: number,
  ): Promise<Part> {
    lesson: Part['lesson'] = lesson;
    const part = await this.repository.findOne({
      lesson: Part['lesson'],
      sequenceNumber,
    });
    return part;
  }
}
