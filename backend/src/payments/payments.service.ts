import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}

//https://api.flutterwave.com/v3/payments
// {
//   "tx_ref": "txn_1731330000000",
//   "amount": "5000",
//   "currency": "NGN",
//   "redirect_url": "https://plearnty.unifyedu.ng/payment-status",
//   "customer": {
//       "email": "adeyemi.okafor@gmail.com",
//       "name": "John Doe",
//       "phonenumber": "07017181902"
//   },
//   "customizations": {
//       "title": "10k Pack 100k Group",
//       "description": "Group Group savings funding"
//   }
// }
