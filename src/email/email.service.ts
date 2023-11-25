import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { EmailEntity } from './email.entity';
import { EmailId, IEmail } from './email.interfaces';
import { UserEmail } from './email.types';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {}

  /**
   * Récupère un email par rapport à un identifiant
   * @param id Identifiant de l'email à récupérer
   * @returns L'email correspondant à l'identifiant ou undefined
   */
  get(id: EmailId): Promise<IEmail> {
    return this.emailRepository.findOneBy({ id: Equal(id) });
  }

  async getByFilters(filters): Promise<UserEmail[]> {
    const emails = await this.emailRepository.find(filters);

    return emails.map((email) => {
      return {
        userId: email.userId,
        id: email.id,
        address: email.address,
      };
    });
  }
}
