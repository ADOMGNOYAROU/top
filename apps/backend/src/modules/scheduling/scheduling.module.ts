import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { InactivityTask } from './inactivity.task';
import { SupabaseKeepaliveTask } from './supabase-keepalive.task';

@Module({
  imports: [AccountModule],
  providers: [InactivityTask, SupabaseKeepaliveTask],
})
export class SchedulingModule {}
