import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaceOrderSocketDTO } from 'src/users/dto/create-user.input';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CommodityManagersService } from 'src/commodity-manager/commodity-manager.service';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService, 
    private readonly commodityManagersService: CommodityManagersService

  ) { }

  async getAllAccountOrdersByStatus(request: any) {
    console.log('getOrdersByAccountIDAndServiceInRequestStatus Request')
    // console.log(request)
    const orders = await this.orderRepository.find(
      { where: { customer: request.servingAccountID, id: request.servingStatus, updatedStatus: 'false' } })

    // console.log('orders')
    // console.log(orders)
    return { status: 200, data: { orders }, err: null }
  }
  async findOrderByCustomerOrVendorId(userID: string): Promise<Order> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('order.offerItem', 'offerItem')
      .leftJoinAndSelect('offerItem.images', 'images');

    // Use OR to match either customer or provider userID
    queryBuilder.where('customer.userID = :userID OR provider.userID = :userID', { userID });

    // Execute the query and return the results
    const order = await queryBuilder.getOne();
    // console.log('@getAccountOrders orders', order)
    return order;
  }

  async findOrdersByCustomerOrVendorId(userID: string): Promise<Order[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('order.orderLines', 'orderLines')
      .leftJoinAndSelect('orderLines.service', 'service')
      .leftJoinAndSelect('service.images', 'images');

    // Use OR to match either customer or provider userID
    queryBuilder.where('customer.userID = :userID OR user.userID = :userID', { userID });

    // Execute the query and return the results
    const orders = await queryBuilder.getMany();
    // console.log('@getAccountOrders orders', orders)
    return orders;
  }

  async requestWarehouseService(orderDTO: PlaceOrderSocketDTO
    ) {
      let ord = JSON.parse(orderDTO.order)
      const client = await this.usersService.findOneByUserID(ord['customerID'])
      const provider = await this.usersService.findOneByUserID(ord['providerID'])
      const commodity = await this.commodityManagersService.getCommodityByID(orderDTO.commodityID)
  
      const newOrder = {
        commodityWeight: ord['commodityWeight'],
        customer: client,
        provider: provider,
        orderDate: ord['orderDate'],
        commodity: commodity,
        orderStatus: ord['orderStatus'],
        offerItemCategory: ord['offerItemCategory']
      }
      const newOrderSchema = this.orderRepository.create(newOrder);
      const orderItem = await this.orderRepository.save(newOrderSchema);
  
      let order = await this.orderRepository.findOne({
        where: { id: orderItem.id },
        relations: { provider: true, customer: true }
      })
  
      order['commodity'] = commodity;
  
      return order;
    }
}
