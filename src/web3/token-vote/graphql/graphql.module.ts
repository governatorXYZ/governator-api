import { Module } from '@nestjs/common';
import { EvmModule } from '../evm/evm.module';
import { GraphqlService } from './graphql.service';

@Module({
    imports: [EvmModule],
    providers: [GraphqlService],
    exports: [GraphqlService],
})
export class GraphqlModule {}