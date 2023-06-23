/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-empty-function */
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Vote } from '../src/vote/vote.schema';
import { v4 as uuidv4 } from 'uuid';
import { VoteMongoService } from '../src/vote/vote.mongo.service';
import { Poll } from '../src/poll/poll.schema';
import { Strategy } from '../src/web3/strategy/strategy.schema';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PollCronService } from '../src/poll/poll.cron.service';
import { rootMongooseTestModule } from './mongod-in-memory';

export const constants = Object.freeze({
    pollId: '999a8681e47db28bf0000222',
    userId: '999a8681e47db28bf0000111',
    providers: ['discord', 'ethereum'],
});


export const dtos = new function(this: any) {
    this.voteRequestDto = {
        poll_option_id: uuidv4(),
        account_id: 'A',
        provider_id: constants.providers[0],
    };
    this.voteResponseDto = {
        method: 'create',
        data: {
            _id: '999a8681e47db28bf0000333',
            poll_id: constants.pollId,
            poll_option_id: uuidv4(),
            account_id: '00000000',
            provider_id: constants.providers[0],
            vote_power: '10000000000000000000000000000000',
            createdAt: Date.now().toLocaleString(),
            updatedAt: Date.now().toLocaleString(),
        },
    };
    this.pollCreateDto = {
        title: 'Test Poll',
        client_config: [{
            provider_id: constants.providers[0],
            guild_id: '1234567890',
            channel_id: '1234567890',
            role_restrictions: ['1234567890', '1234567890'],
        }],
        strategy_config: [{
            strategy_type: 'ONE_EQUALS_ONE',
            strategy_id: 'strategy hash',
            block_height: [{
                chain_id: '1',
                block: 0,
            }],
        }],
        poll_options: [{
            poll_option_id: uuidv4(),
            poll_option_name: 'option1',
            poll_option_emoji: ':/',
        }],
        allow_options_for_anyone: true,
        single_vote: true,
        end_time: Date.now() + 100000,
        description: 'hello world',
        author_user_id: constants.userId,
    };
    this.pollResponseDto = {
        ...this.pollCreateDto,
        poll_id: constants.pollId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    this.strategyResponseDto = {
        _id: 'strategy hash',
        name: 'mock strategy standard',
        endpoint: '/api/strategy/standard-1-vote-1-vote',
        strategy_type: 'ONE_EQUALS_ONE',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
};

class VoteMongoServiceMockImpl {
    fetchVoteByPollCountAggregate(_pollId) {return true; }
    validateVoteRequest() { return true; }
    fetchVoteByPoll(_pollId) { return true; }
    fetchVoteByPollAggregate(_pollId) { return true; }
    fetchVoteByPollAndUserVotePowerAggregate(_poll_id, _user_id) { return true; }
    fetchVoteByPollAndUserAggregate(_pollId, _userId) { return true; }
    fetchVoteByPollSumAggregate(_pollId) { return true; }
    fetchVoteUserCount(_pollId) { return true; }
}

export const defaultMockRepository = {
    find: () => {
        return { exec: jest.fn(), lean: jest.fn(() => {}) };
    },
    findOne: () => {
        return { exec: jest.fn(), lean: jest.fn(() => {}) };
    },
    findAll: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    findById: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    create: jest.fn(() => {}),
    findOneAndUpdate: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    findOneAndDelete: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    findByIdAndDelete: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    findByIdAndUpdate: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    aggregate: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
};

const SchedulerRegistryMockImpl = {
    addCronJob: jest.fn(),
    getCronJob: () => {
        return { nextDate: jest.fn() };
    },
    getTimeouts: jest.fn(() => []),
    getIntervals: jest.fn(() => []),
    getCronJobs: jest.fn(() => []),
};

export const mocks = {
    voteMongoServiceMock: {
        provide: VoteMongoService,
        useClass: VoteMongoServiceMockImpl,
    },
    voteMockRepository: {
        provide: getModelToken(Vote.name),
        useValue: defaultMockRepository,
    },
    pollMockRepository: {
        provide: getModelToken(Poll.name),
        useValue: defaultMockRepository,
    },
    strategyMockRepository: {
        provide: getModelToken(Strategy.name),
        useValue: defaultMockRepository,
    },
    schedulerRegistryMock: {
        provide: SchedulerRegistry,
        useValue: SchedulerRegistryMockImpl,
    },
    pollCronServiceMock: {
        provide: PollCronService,
        useValue: {
            newCronJob: () => {
                return { start: jest.fn() };
            },
        },
    },
    mongooseModuleMock: {
        provide: MongooseModule,
        useValue: rootMongooseTestModule(),
    },
};