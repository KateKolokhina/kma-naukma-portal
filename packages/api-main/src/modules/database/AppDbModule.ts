import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppDataSource } from './config';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        await AppDataSource.initialize()
          .then(() => {
            console.log('Local Data Source has been initialized!');
          })
          .catch((err) => {
            console.error('Error during Local Data Source initialization', err);
          });
        return AppDataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class AppDbModule {}
