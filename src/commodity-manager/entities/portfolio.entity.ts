import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommodityManager } from './commodity-manager.entity';
import { Commodity } from './commodityentity';

@Entity()
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ nullable: true })
  portfolioType: string;
  @Column({ nullable: true })
  name: string;
  @Column({ nullable: true })
  description: string;
  @ManyToOne(() => CommodityManager, (provider: CommodityManager) => provider.orders)
  manager: CommodityManager;
  @OneToMany(() => Commodity, (service: Commodity) => service.portfolio)
  commodities: Commodity[];
}




