import { EventEmitter2 } from '@nestjs/event-emitter';
import { GateConfig, Payment } from './gate.interface';
import { Injectable, Logger } from '@nestjs/common';
import {
  GATEWAY_CRON_ERROR_STREAK,
  GATEWAY_CRON_RECOVERY,
  PAYMENT_HISTORY_UPDATED,
} from 'src/shards/events';
import { CaptchaSolverService } from 'src/captcha-solver/captcha-solver.service';
import { sleep } from 'src/shards/helpers/sleep';
import { ProxyService } from '../proxy/proxy.service';
import { ProxyConfig } from '../proxy/proxy.interfaces';

@Injectable()
export abstract class Gate {
  private isCronRunning = false;
  private logger = new Logger(Gate.name);
  protected proxy: ProxyConfig;

  constructor(
    protected readonly config: GateConfig,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly captchaSolver: CaptchaSolverService,
    protected readonly proxyService: ProxyService,
  ) {
    // Stop cron when started, only start when needed
    // this.cron();
  }

  abstract getHistory(): Promise<Payment[]>;

  getName() {
    return this.config.name;
  }

  async getProxyAgent() {
    const httpsAgent = await this.proxyService.getProxyAgent(this.config.proxy);
    return httpsAgent;
  }

  async getHistoryAndPublish() {
    this.proxy = null;
    if (this.config.proxy && this.config.proxy.length > 0) {
      this.proxy = await this.proxyService.getProxy(this.config.proxy);
    }
    const payments = await this.getHistory();
    this.eventEmitter.emit(PAYMENT_HISTORY_UPDATED, payments);
    this.logger.log(
      JSON.stringify({
        label: 'CronInfo',
        type: this.config.type,
        payments: payments.length,
      }),
    );
  }

  private errorStreak = 0;
  private isErrored = false;

  private async handleError(error: any) {
    this.logger.error(this.getName());
    this.errorStreak++;
    // this.logger.error(error);
    // Cron again after 10s
    setTimeout(
      () => {
        console.log("Restarting cron");
        this.startCron();
      },
      5 * 1000,
    );

    if (this.errorStreak > 5) {
      this.isErrored = true;
      // this.stopCron();
      this.eventEmitter.emit(GATEWAY_CRON_ERROR_STREAK, {
        name: this.getName(),
        error: error.message,
      });

      setTimeout(
        () => {
          this.errorStreak = 0;
          this.startCron();
        },
        5 * 60 * 1000,
      );

    }
  }

  scheduleCron() {
    // Start cron when neededq
  }

  async cron() {
    try {
      await this.getHistoryAndPublish();

      if (this.isErrored) {
        this.eventEmitter.emit(GATEWAY_CRON_RECOVERY, {
          name: this.getName(),
        });
      }
      this.isErrored = false;
      this.errorStreak = 0;
      await sleep(this.config.repeat_interval_in_sec * 1000);
    } catch (error) {
      await this.handleError(error);
    }
  }

  stopCron() {
    this.isCronRunning = false;
  }

  async startCron() {
    // this.isCronRunning = true;
    await this.cron();
  }
}
