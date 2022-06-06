import { Module } from '@nestjs/common';
import { SiweService } from './siwe.service';
import { SiweController } from './siwe.controller';
import { AccountModule } from '../../account/account.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SiweNonce, SiweNonceSchema } from './siweNonce.schema';
import { SiweNonceMongoService } from './siweNonce.mongo.service';
import { UserModule } from '../../user/user.module';


@Module({
    imports: [
        MongooseModule.forFeature([{ name: SiweNonce.name, schema: SiweNonceSchema }]),
        AccountModule,
        UserModule,
    ],
    controllers: [SiweController],
    providers: [SiweService, SiweNonceMongoService],
})
export class SiweModule {}