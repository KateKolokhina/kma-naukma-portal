import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NaukmaDataSource } from './config';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        await NaukmaDataSource.initialize()
          .then(() => {
            console.log('Naukma Data Source has been initialized!');
          })
          .catch((err) => {
            console.error('Error during Naukma Data Source initialization', err);
          });
        return NaukmaDataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class NaukmaDbModule {}
