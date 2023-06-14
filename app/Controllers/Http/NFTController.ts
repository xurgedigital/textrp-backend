import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import axios from 'axios'
import SupportedNft from 'App/Models/SupportedNft'
import UserExternalId from 'App/Models/UserExternalId'

export enum NETWORKS {
  MAIN = 'https://xrplcluster.com',
  DEV = 'https://s.devnet.rippletest.net:51234',
  TEST = 'https://testnet.xrpl-labs.com',
}

export default class NFTController {
  public static async verifyHolding(address: string, service: string): Promise<boolean> {
    let addressA = address
    if (addressA.length !== 34) {
      const externalUser = await UserExternalId.query()
        .where('user_id', addressA)
        .where('auth_provider', 'oidc-xumm')
        .firstOrFail()
      addressA = externalUser.externalId
    }
    const { data: res } = await axios.post(NETWORKS.MAIN, {
      method: 'account_nfts',
      params: [
        {
          account: addressA,
          ledger_index: 'validated',
        },
      ],
    })
    if (res.result?.error) return false
    const internalNFTs = await SupportedNft.query()
      .whereIn(
        'contract_address',
        res.result.account_nfts.map((nft) => nft.Issuer)
      )
      .whereIn(
        'taxon',
        res.result.account_nfts.map((nft) => nft.NFTokenTaxon)
      )
    return !!internalNFTs.find((nft) => nft.description.includes(service))
  }

  public async check({ request, response }: HttpContextContract) {
    let address = request.param('address')
    if (address.length !== 34) {
      const externalUser = await UserExternalId.query()
        .where('user_id', address)
        .where('auth_provider', 'oidc-xumm')
        .firstOrFail()
      address = externalUser.externalId
    }
    const network = request.param('network', 'main')
    const service = request.param('service')
    const { data: res } = await axios.post(NETWORKS[network.toUpperCase()], {
      method: 'account_nfts',
      params: [
        {
          account: address,
          ledger_index: 'validated',
        },
      ],
    })
    response.abortIf(res.result?.error, res.result?.error, 500)
    const internalNFTs = await SupportedNft.query()
      .whereIn(
        'contract_address',
        res.result.account_nfts.map((nft) => nft.Issuer)
      )
      .whereIn(
        'taxon',
        res.result.account_nfts.map((nft) => nft.NFTokenTaxon)
      )
    if (service) {
      response.abortUnless(
        internalNFTs.find((nft) => nft.description.includes(service)),
        'Unauthorised',
        403
      )
    }
    return response.json({
      nfts: internalNFTs.map((nft) => ({
        contract_address: nft.contract_address,
        discord: nft.description.toLowerCase().includes('discord'),
        twitter: nft.description.toLowerCase().includes('twitter'),
        twilio: nft.description.toLowerCase().includes('twilio'),
      })),
    })
  }
}
