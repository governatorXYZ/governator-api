/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-empty-function */
import { getModelToken } from '@nestjs/mongoose';
import { Vote } from '../src/vote/vote.schema';
import { v4 as uuidv4 } from 'uuid';
import { VoteMongoService } from '../src/vote/vote.mongo.service';

export const constants = Object.freeze({
    pollId: '999a8681e47db28bf0000222',
    userId: '999a8681e47db28bf0000111',
    providers: ['discord', 'ethereum'],
});


export const dtos = {
    voteRequestDto: {
        poll_option_id: uuidv4(),
        account_id: 'A',
        provider_id: constants.providers[0],
    },
    voteResponseDto: {
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
    },
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

const voteMockRepository = {
    find: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    findOne: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    findAll: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    create: jest.fn(() => {}),
    findOneAndUpdate: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    findOneAndDelete: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
    aggregate: () => {
        return { exec: jest.fn(() => {}), lean: jest.fn(() => {}) };
    },
};

export const mocks = Object.freeze({
    voteMongoServiceMock: {
        provide: VoteMongoService,
        useClass: VoteMongoServiceMockImpl,
    },
    voteMockRepository: {
        provide: getModelToken(Vote.name),
        useValue: voteMockRepository,
    },
});