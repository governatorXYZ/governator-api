import { Process, Processor, OnQueueActive, OnQueueProgress, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { PollMongoService } from './poll.mongo.service';
import { PollCreateDto, PollResponseDto } from './poll.dtos';
import web3Utils from '../web3/web3.util';
import { VoteRequestHandlerService } from '../vote/vote.request-handler.service';
import { SseService } from '../sse/sse.service';
import constants from '../common/constants';
import { filter, first } from 'rxjs';
import { GraphqlService } from '../web3/token-vote/graphql/graphql.service';


@Processor('poll-create')
export class PollCreateConsumer {
    private readonly logger = new Logger(PollCreateConsumer.name);
    private readonly eventStream: Subject<any>;

    constructor(
        protected mongoService: PollMongoService,
        protected voteRequestHandlerService: VoteRequestHandlerService,
        protected sseService: SseService,
        protected gqlService: GraphqlService,
    ) {
        this.eventStream = new Subject();
    }

    async getReturnValueFromObservable(job): Promise<PollResponseDto> {
        return new Promise(resolve => {
            this.eventStream
                .pipe(
                    first(),
                    filter((data: any) => data.jobId === job.id),
                ).subscribe(
                    {
                        next: (data:any) => resolve(data.poll),
                        complete: () => this.logger.debug(`Observable for Job ${job.id} has completed`),
                    },
                );
        });
    }

    @OnQueueProgress()
    onProgress(job: Job) {
        this.logger.log(
            `Job ${job.id} Progress: Step ${job.progress()}/5 completed`,
        );
    }

    @OnQueueCompleted()
    onCompleted(job: Job, result: any) {
        this.logger.log(
            `Job ${job.id} completed with exit status ${result}`,
        );
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.log(
            `Processing job ${job.id} with data ${JSON.stringify(job.data)}...`,
        );
    }
 
    @Process()
    async pollCreateJob(job:Job<PollCreateDto>) {
        const poll = job.data;

        if (poll.strategy_config) {
            // sanitizing block heights
            const strategy = poll.strategy_config[0];
            let mainnetBlock = strategy.block_height.find(BlockHeight => BlockHeight.chain_id === '1').block;

            if (mainnetBlock <= 0) {
                const block = await web3Utils.getEthersProvider(1).getBlockNumber();
                mainnetBlock = block - mainnetBlock;
                strategy.block_height.find(BlockHeight => BlockHeight.chain_id === '1').block = mainnetBlock;
            }
            
            // add just polygon for now.
            const polygonBlock = await this.gqlService.getEquivalentBlock(mainnetBlock, '137');

            strategy.block_height.push({ chain_id: '137', block: polygonBlock });

        }

        await job.progress(1);

        const dbPoll = await this.mongoService.createPoll(poll);

        await job.progress(2);

        if (Number(process.env.CACHE)) this.voteRequestHandlerService.cacheVotePowersByPoll(dbPoll);
        await job.progress(3);

        this.sseService.emit({
            data: dbPoll,
            type: constants.EVENT_POLL_CREATE,
        } as MessageEvent);
        await job.progress(4);

        try {
            this.eventStream.next({
                jobId: job.id,
                poll: dbPoll,
            });
        } catch (e) {
            this.logger.error('Failed to push to event stream', e);
            return 1;
        }
        await job.progress(5);

        return 0;
    }
}