import { BankTokenWeightedStrategy } from './controller.bdao';
import { NoneStrategy } from './controller.noneStrategy';
// import { PoolyErc721WeightedStrategy } from './controller.pooly';
// import { DaoPunksStrategy } from './controller.daopunks';
import { PoapGnosisStrategy } from './controller.poap.gnosis';

export default [
    BankTokenWeightedStrategy,
    NoneStrategy,
    PoapGnosisStrategy,
    // DaoPunksStrategy,
    // add strategy here
];