import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Entity, PrimaryKey, Property } from 'mikro-orm';
import { v4 } from 'uuid';

@Entity()
export class Templates {
  @PrimaryKey()
  @Expose()
  id: string = v4();

  @Property({ unique: true })
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Property()
  @Expose()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Property()
  @Expose()
  @IsNotEmpty()
  @IsString()
  template: string;
}
