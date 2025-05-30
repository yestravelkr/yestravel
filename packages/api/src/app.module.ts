import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@src/module/shared/shared.module';
import { SampleModule } from '@src/module/sample/sample.module';
import { TRPCModule } from 'nestjs-trpc';
import { PlaygroundController } from '@src/trpc.controller';

@Module({
  imports: [
    SharedModule,
    SampleModule,
    TRPCModule.forRoot({
      autoSchemaFile: './src/@generated',
    }),
  ],
  controllers: [AppController, PlaygroundController],
  providers: [AppService],
})
export class AppModule {}
