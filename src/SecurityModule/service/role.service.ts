import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleEnum } from '../enum/role.enum';
import { RoleRepository } from '../repository/role.repository';
import { Role } from '../entity/role.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class RoleService {
  private readonly repository: RoleRepository;
  constructor() {}

  @Transactional()
  public async findByRoleName(name: RoleEnum): Promise<Role> {
    const role: Role = await this.repository.findByRoleName(name);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }
}
