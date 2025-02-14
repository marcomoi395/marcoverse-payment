import { MBBankService } from './mbbank.services';
import { TPBankService } from './tpbank.services';
import { GateConfig, GateType } from '../gate.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Gate } from '../gates.services';
import { CaptchaSolverService } from 'src/captcha-solver/captcha-solver.service';
import { ProxyService } from '../../proxy/proxy.service';

export class GateFactory {
  create(
    config: GateConfig,
    eventEmitter: EventEmitter2,
    captchaSolver: CaptchaSolverService,
    proxies: ProxyService,
  ): Gate {
    switch (config.type) {
      case GateType.TPBANK:
        const tpbank = new TPBankService(
          config,
          eventEmitter,
          captchaSolver,
          proxies,
        );
        return tpbank;
      case GateType.MBBANK:
        const mbbank = new MBBankService(
          config,
          eventEmitter,
          captchaSolver,
          proxies,
        );
        return mbbank;
      default:
        throw new Error('Gate not found');
    }
  }
}
