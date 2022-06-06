import { Module } from '@nestjs/common';
import { TokenVoteController } from './token-vote.controller';
import { TokenVoteService } from './token-vote.service';
import { AccountModule } from '../../account/account.module';
import { TokenWhitelistModule } from './token-whitelist/token-whitelist.module';


@Module({
    imports: [AccountModule, TokenWhitelistModule],
    controllers: [TokenVoteController],
    providers: [TokenVoteService],
})
export class TokenVoteModule {}