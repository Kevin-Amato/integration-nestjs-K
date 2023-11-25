import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';
import { User } from '../user/user.types';
import { EmailEntity } from './email.entity';
import { EmailService } from './email.service';
import { EmailFiltersArgs, UserEmail } from './email.types';

@Resolver(() => UserEmail)
export class EmailResolver {
  constructor(
    private readonly _service: EmailService,
    @InjectRepository(UserEntity)
    private readonly emailRepository: Repository<UserEntity>,
  ) {}

  @Query(() => UserEmail, { name: 'email' })
  getEmail(@Args({ name: 'emailId', type: () => ID }) emailId: string) {
    return this._service.get(emailId);
  }

  @Query(() => [UserEmail], { name: 'emailsList' })
  async getEmails(@Args() filters: EmailFiltersArgs): Promise<UserEmail[]> {
    const where: FindOptionsWhere<EmailEntity> = {};

    if (filters.address) {
      if (filters.address.equal) {
        where.address = Equal(filters.address.equal);
      }

      if (filters.address.in?.length > 0) {
        if (where.address) {
          where.address = In([filters.address.equal, ...filters.address.in]);
        } else {
          where.address = In(filters.address.in);
        }
      }
    }

    return await this._service.getByFilters({
      where,
      order: { address: 'asc' },
    });
  }

  @ResolveField(() => User, { name: 'user' })
  async getUser(@Parent() parent: UserEmail): Promise<User> {
    return this.emailRepository.findOne({
      where: { id: Equal(parent.userId) },
    });
  }
}
