import { Test, TestingModule } from '@nestjs/testing';
import { SseService } from './sse.service';
import { MessageEvent } from './types';
import { SseController } from './sse.controller';
import constants from '../common/constants';

describe('Test SseController', () => {

    let sseController: SseController;
    let mockSseService: any;
    beforeEach(async () => {

        mockSseService = {
            emit: jest.fn().mockImplementation((message: MessageEvent) => {
                return { message: message };
            }),
        };

        const SseFake = {
            provide: SseService,
            useValue: mockSseService,
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [SseController],
            providers: [SseFake],
        }).compile();

        sseController = moduleFixture.get<SseController>(SseController);

    });

    it('checks if controller invokes SseService.emit correctly', async () => {

        const testMsg = { data: 'test', type: constants.EVENT_POLL_CREATE };

        await sseController.publish(testMsg);

        expect(mockSseService.emit).toHaveBeenCalledWith(testMsg);
        expect(await mockSseService.emit).toHaveBeenCalled();
        expect(await mockSseService.emit).toHaveReturned();
        expect(await mockSseService.emit).toHaveReturnedWith({ message: testMsg });
    });
});
