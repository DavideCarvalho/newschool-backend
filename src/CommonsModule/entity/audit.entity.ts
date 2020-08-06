import { Property } from 'mikro-orm';

export abstract class Audit {
  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date;

  @Property({ version: true, default: 1 })
  version;
}
