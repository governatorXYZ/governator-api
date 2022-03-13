import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Vote, VoteDocument } from '../schemas/vote.schema';
// import { CreateVoteDto } from '../dtos/vote.dtos';

@Injectable()
export class VoteMongoService {
    constructor(@InjectModel(Vote.name) private voteModel: Model<VoteDocument>) {
        // do nothing
    }
}
