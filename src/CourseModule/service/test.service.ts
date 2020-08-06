import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartService } from './part.service';
import { TestRepository } from '../repository/test.repository';
import { NewTestDTO } from '../dto/new-test.dto';
import { Part } from '../entity/part.entity';
import { TestUpdateDTO } from '../dto/test-update.dto';
import { Test } from '../entity/test.entity';
import { InjectRepository } from 'nestjs-mikro-orm';

@Injectable()
export class TestService {
  constructor(
    private readonly partService: PartService,
    @InjectRepository(Test)
    private readonly repository: TestRepository,
  ) {}

  public async add(test: NewTestDTO): Promise<Test> {
    const part: Part = await this.partService.findById(test.partId);
    const testSameTitle: Test = await this.repository.findByTitleAndPartId(
      test.title,
      part,
    );
    if (testSameTitle) {
      throw new ConflictException(
        'There is already a test with this title for this part',
      );
    }

    return this.repository.create({
      ...test,
      part,
      sequenceNumber: 1 + (await this.repository.count({ part })),
    });
  }

  public async update(
    id: Test['id'],
    testUpdatedInfo: TestUpdateDTO,
  ): Promise<Test> {
    const test: Test = await this.repository.findByIdWithPart(id);
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    const part =
      testUpdatedInfo.partId === test.part.id
        ? test.part
        : await this.partService.findById(testUpdatedInfo.partId);
    return this.repository.create({ ...test, ...testUpdatedInfo, part });
  }

  public async getAll(partId: string): Promise<Test[]> {
    return this.repository.find({
      part: await this.partService.findById(partId),
    });
  }

  public async findById(id: Test['id']): Promise<Test> {
    const test: Test = await this.repository.findOne({ id });
    if (!test) {
      throw new NotFoundException('No test found');
    }
    return test;
  }

  public async delete(id: Test['id']): Promise<void> {
    const deletedTest: Test = await this.repository.findOne({ id });
    const testQuantity: number = await this.repository.count({
      part: deletedTest.part,
    });
    await this.repository.remove({ id });

    if (deletedTest.sequenceNumber === testQuantity) {
      return;
    }

    // const tests: Test[] = await this.repository.find({
    //   where: {
    //     sequenceNumber: MoreThan(deletedTest.sequenceNumber),
    //   },
    //   order: {
    //     sequenceNumber: 'ASC',
    //   },
    // });

    const tests: Test[] = await this.repository.find(
      {
        sequenceNumber: {
          $gt: deletedTest.sequenceNumber,
        },
      },
      {
        orderBy: {
          sequenceNumber: 'ASC',
        },
      },
    );

    for (const test of tests) {
      await this.repository.create({
        ...test,
        sequenceNumber: test.sequenceNumber - 1,
      });
    }
  }

  public async checkTest(
    id: Test['id'],
    chosenAlternative: string,
  ): Promise<boolean> {
    const test = await this.repository.findById({ id });
    if (!test) {
      throw new NotFoundException('No test found');
    }

    return (
      test.correctAlternative.toLowerCase() == chosenAlternative.toLowerCase()
    );
  }

  public async countByPart(part: Part): Promise<number> {
    return await this.repository.count({ part });
  }

  public async getTestIdByPartIdAndSeqNum(
    part: string,
    sequenceNumber: number,
  ): Promise<Test['id']> {
    Test['part'] = part;
    const test = await this.repository.findOne({
      part: Test['part'],
      sequenceNumber,
    });
    return test.id;
  }

  public async getByPartAndSequenceNumber(
    part: Part,
    sequenceNumber: number,
  ): Promise<Test> {
    return await this.repository.findOne({
      part,
      sequenceNumber,
    });
  }

  public async findTestByPartIdAndSeqNum(
    part: string,
    sequenceNumber: number,
  ): Promise<Test> {
    Test['part'] = part;
    const test = await this.repository.findOne({
      part: Test['part'],
      sequenceNumber,
    });
    return test;
  }
}
