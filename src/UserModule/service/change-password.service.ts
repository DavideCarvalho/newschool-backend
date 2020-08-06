import { Injectable, NotFoundException } from '@nestjs/common';
import { ChangePasswordRepository } from '../repository/change-password.repository';
import { AppConfigService as ConfigService } from '../../ConfigModule/service/app-config.service';
import { ChangePassword } from '../entity/change-password.entity';
import { User } from '../entity/user.entity';
import { InjectRepository } from 'nestjs-mikro-orm';

@Injectable()
export class ChangePasswordService {
  constructor(
    @InjectRepository(ChangePassword)
    private readonly repository: ChangePasswordRepository,
    private readonly configService: ConfigService,
  ) {}

  public async createChangePasswordRequest(
    user: User,
  ): Promise<ChangePassword> {
    const changePassword: ChangePassword = new ChangePassword();
    changePassword.user = user;
    changePassword.expirationTime = this.configService.changePasswordExpirationTime;
    const createdChangedPasswordRequest = await this.repository.create(
      changePassword,
    );
    await this.repository.persistAndFlush(createdChangedPasswordRequest);
    return createdChangedPasswordRequest;
  }

  public async findById(id: string): Promise<ChangePassword> {
    const changePassword: ChangePassword = await this.repository.findOne({
      id,
    });
    if (!changePassword) {
      throw new NotFoundException();
    }
    return changePassword;
  }
}
