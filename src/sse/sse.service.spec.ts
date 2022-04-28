import { Test, TestingModule } from '@nestjs/testing';
import { SseService } from './sse.service';
import { SseController } from './sse.controller';
import constants from '../common/constants';
import { lastValueFrom, of } from 'rxjs';

describe('Test SseService', () => {


    let sseController: SseController;
    let sseService: SseService;
    beforeEach(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [SseController],
            providers: [SseService],
        }).compile();

        sseController = moduleFixture.get<SseController>(SseController);
        sseService = moduleFixture.get<SseService>(SseService);
    });

    it('checks if emit() pushes to event stream', async () => {

        const testMsg = { data: 'test', type: constants.EVENT_POLL_CREATE };

        await sseService.emit(testMsg);

        jest.spyOn(sseController, 'stream').mockImplementationOnce(() => of (testMsg));

        await expect(lastValueFrom(sseController.stream()))
            .resolves.toEqual(testMsg);
    });
});