import { BankTokenWeightedStrategy } from './controller.bdao';
import { NoneStrategy } from './controller.noneStrategy';
import { PoolyErc721WeightedStrategy } from './controller.pooly';
import { DaoPunksStrategy } from './controller.daopunks';


export default [
    BankTokenWeightedStrategy,
    NoneStrategy,
    PoolyErc721WeightedStrategy,
    DaoPunksStrategy,
    // add strategy here
];