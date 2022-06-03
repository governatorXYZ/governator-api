import { Module } from '@nestjs/common';
import { TokenVoteController } from './token-vote.controller';
import { TokenVoteService } from './token-vote.service';
import { AccountModule } from '../../account/account.module';


@Module({
    imports: [AccountModule],
    controllers: [TokenVoteController],
    providers: [TokenVoteService],
})
export class TokenVoteModule {}