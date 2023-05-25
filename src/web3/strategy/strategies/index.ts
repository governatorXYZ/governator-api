import { BankTokenWeightedStrategy } from './controller.bdao';
import { BdaoMembershipStrategy } from './controller.bdaoMembership';
import { NoneStrategy } from './controller.noneStrategy';
// import { PoolyErc721WeightedStrategy } from './controller.pooly';
// import { DaoPunksStrategy } from './controller.daopunks';
// import { PoapEventStrategy } from './controller.poap.gnosis';

export default [
    BdaoMembershipStrategy,
    BankTokenWeightedStrategy,
    NoneStrategy,
    // PoapEventStrategy,
    // DaoPunksStrategy,
    // add strategy here
];