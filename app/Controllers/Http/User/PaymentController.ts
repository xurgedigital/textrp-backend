import Subscription from 'App/Models/Subscription'
import Credit from 'App/Models/Credit'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Payment from 'App/Models/Payment'
import XummService from 'App/Services/XummService'
import PlatformSetting from 'App/Models/PlatformSetting'
import Logger from '@ioc:Adonis/Core/Logger'
import { XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types/xumm-api'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UnProcessableException from 'App/Exceptions/UnProcessableException'
import AuthorizationException from 'App/Exceptions/AuthorizationException'

export enum PaymentTypeEnum {
  CREDIT = 'CREDIT',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export default class PaymentController {
  public async subscriptionPayment({ auth, params }: HttpContextContract) {
    if (!params.subscription) {
      throw new UnProcessableException('Please provide subscriptionID in params!')
    }
    const subscription = await Subscription.find(params.subscription)
    if (!subscription) {
      throw new NotFoundException('Subscription not found!')
    }
    const { id, price } = subscription
    const paymentType = PaymentTypeEnum.SUBSCRIPTION
    return this.processPayment(auth, price, paymentType, id)
  }

  public async creditPayment({ auth, params }: HttpContextContract) {
    if (!params.credit) {
      throw new UnProcessableException('Please provide creditID in params!')
    }
    const credit = await Credit.find(params.credit)
    if (!credit) {
      throw new NotFoundException('Credit not found!')
    }
    const { id, price } = credit
    const paymentType = PaymentTypeEnum.CREDIT
    return this.processPayment(auth, price, paymentType, id)
  }

  public async processPayment(
    auth,
    paymentAmount: number,
    paymentType: PaymentTypeEnum,
    entityId: number
  ) {
    const authUser = await auth.use('web').user
    if (!authUser) {
      throw new AuthorizationException('Auth User does not exists')
    }
    let destination
    try {
      destination = (await PlatformSetting.query().where('key', 'receiveWallet').firstOrFail())
        .value
    } catch (error) {
      throw new NotFoundException('Wallet not found in platform settings')
    }
    await authUser.load('discount')

    const discoutAmount = (authUser.discount?.discount || 0) / 100
    const amount = (paymentAmount - paymentAmount * discoutAmount) * 10 ** 6
    const payload: XummPostPayloadBodyJson = {
      txjson: {
        TransactionType: 'Payment',
        Destination: destination,
        Amount: amount.toString(),
      },
    }
    const ping = await XummService.sdk.payload.create(payload).catch((error) => {
      Logger.error(error)
      throw new UnProcessableException('Error while creating payment from Xumm')
    })
    Logger.debug(
      {
        ping,
        payload,
        discoutAmount,
      },
      'Ping response with payload'
    )
    if (!ping?.uuid) {
      throw new UnProcessableException('UUID not returned by xumm')
    }
    await Payment.firstOrCreate(
      {
        userId: authUser?.id,
        uuid: ping?.uuid,
        payload: JSON.stringify(payload),
        paymenttableId: entityId,
        paymenttableType: paymentType,
      },
      {}
    )
    return { data: ping }
  }
}
