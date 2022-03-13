import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
// import { CreateUserDto } from '../dtos/user.dtos';

@Injectable()
export class UserMongoService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
        // do nothing
    }
}