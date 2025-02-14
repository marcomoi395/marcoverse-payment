import { Controller, Get } from '@nestjs/common';
import { GatesManagerService } from './gates-manager.services';
import { OnEvent } from '@nestjs/event-emitter';
import { GATEWAY_START_CRON, GATEWAY_STOP_CRON } from 'src/shards/events';

@Controller('gateways')
export class GatesController {
  constructor(private readonly gateManagerService: GatesManagerService) {}

  // @Get('stop-gate')
  // stopGate(
  //   @Query('name') name: string,
  //   @Query('time_in_sec') timeInSec: number,
  // ) {
  //   this.gateManagerService.stopCron(name, timeInSec);
  //   return {
  //     message: 'ok',
  //     next_run: moment()
  //       .add(timeInSec, 'seconds')
  //       .tz('Asia/Ho_Chi_Minh')
  //       .format('DD-MM-YYYY HH:mm:ss'),
  //   };
  // }

  @Get('start-gate')
  async startGate(
  ) {
    const name = "mb_bank_1";
    await this.gateManagerService.startCron(name);
    return {
      message: 'ok',
    };
  }

  @OnEvent(GATEWAY_STOP_CRON)
  stopGateCron() {
    this.gateManagerService.stopAllCron();
  }

  @OnEvent(GATEWAY_START_CRON)
  startGateCron() {
    this.gateManagerService.startAllCron();
  }
}
