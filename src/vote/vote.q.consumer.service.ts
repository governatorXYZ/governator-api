import { Process, Processor, OnQueueActive, OnQueueProgress, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { VoteRequestHandlerService } from './vote.request-handler.service';
import { filter, first } from 'rxjs';
import { VoteRequestDto, VoteResponseDto } from './vote.dtos';
import constants from '../common/constants';
import { SseService } from '../sse/sse.service';
import { VoteMongoService } from './vote.mongo.service';

@Processor('vote-create')
export class VoteCreateConsumer {
    private readonly logger = new Logger(VoteCreateConsumer.name);
    private readonly eventStream: Subject<any>;

    constructor(
        protected voteRequestHandlerService: VoteRequestHandlerService,
        protected voteMongoService: VoteMongoService,
        protected sseService: SseService,
    ) {
        this.eventStream = new Subject();
    }

    async getReturnValueFromObservable(job): Promise<VoteResponseDto[]> {
        return new Promise(resolve => {
            this.eventStream
                .pipe(
                    first(),
                    filter((data: any) => data.jobId === job.id),
                ).subscribe(
                    {
                        next: (data:any) => resolve(data.votes),
                        complete: () => this.logger.debug(`Observable for Job ${job.id} has completed`),
                    },
                );
        });
    }
    @OnQueueProgress()
    onProgress(job: Job) {
        this.logger.log(
            `Job ${job.id} Progress: Step ${job.progress()}/2 completed`,
        );
    }

    @OnQueueCompleted()
    onCompleted(job: Job, result: any) {
        this.logger.log(
            `Job ${job.id} completed with exit status ${result}`,
        );
        job.remove();
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.log(
            `Processing job ${job.id} with data ${JSON.stringify(job.data)}...`,
        );
    }
 
    @Process()
    async voteCreateJob(job:Job<{voteRequest: VoteRequestDto, pollId: string}>) {
        

        const votes = await this.voteRequestHandlerService.handleVoteRequest(job.data.pollId, job.data.voteRequest);
        await job.progress(1);

        try {
            this.eventStream.next({
                jobId: job.id,
                votes: votes,
            });
        } catch (e) {
            this.logger.error('Failed to push to event stream', e);
            return 1;
        }

        if (votes.length > 0) {

            const voteCount = await this.voteMongoService.fetchVoteUserCount(job.data.pollId).catch();

            this.sseService.emit({
                data: { poll_id: job.data.pollId, vote_count: voteCount },
                type: constants.EVENT_VOTE_CREATE,
            } as MessageEvent);
        }
        
        await job.progress(2);

        return 0;
    }
}