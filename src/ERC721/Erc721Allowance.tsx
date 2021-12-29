import React from 'react'
import { Erc721TokenData } from '../common/interfaces'
import { shortenAddress, getExplorerUrl, emitAnalyticsEvent } from '../common/util'
import { Form } from 'react-bootstrap'
import { ADDRESS_ZERO } from '../common/constants'
import RevokeButton from '../common/RevokeButton'
import { Allowance } from './interfaces'
import { formatAllowance } from './util'

interface Props {
  token: Erc721TokenData
  allowance: Allowance
  inputAddress: string
  signerAddress: string
  chainId: number
  onRevoke: (allowance: Allowance) => void;
}

function Erc721Allowance({ token, allowance, inputAddress, signerAddress, chainId, onRevoke }: Props) {
  const { spender, ensSpender, spenderAppName, tokenId } = allowance

  const revoke = async () => {
    const tx = tokenId === undefined
      ? await token.contract.functions.setApprovalForAll(spender, false)
      : await token.contract.functions.approve(ADDRESS_ZERO, tokenId)

    if (tx) {
      await tx.wait(1)

      if (tokenId === undefined) {
        emitAnalyticsEvent("erc721_revoke_all")
      } else {
        emitAnalyticsEvent("erc721_revoke_single")
      }

      onRevoke(allowance)
    }
  }

  const spenderDisplay = spenderAppName || ensSpender || spender
  const shortenedSpenderDisplay = spenderAppName || ensSpender || shortenAddress(spender)
  const explorerBaseUrl = getExplorerUrl(chainId)

  const shortenedLink = explorerBaseUrl
    ? (<a className="monospace" href={`${explorerBaseUrl}/${spender}`}>{shortenedSpenderDisplay}</a>)
    : shortenedSpenderDisplay

  const regularLink = explorerBaseUrl
    ? (<a className="monospace" href={`${explorerBaseUrl}/${spender}`}>{spenderDisplay}</a>)
    : spenderDisplay

  const canUpdate = inputAddress === signerAddress

  return (
    <Form inline className="Allowance" key={spender}>
      {/* Display separate spans for the regular and shortened versions of the spender address */}
      {/* The correct one is selected using CSS media-queries */}
      <Form.Label className="AllowanceText">
          <span className="AllowanceTextSmallScreen">
            Allowance for {formatAllowance(tokenId)} to&nbsp;{shortenedLink}
          </span>
          <span className="AllowanceTextBigScreen">
            Allowance for {formatAllowance(tokenId)} to&nbsp;{regularLink}
          </span>
        </Form.Label>
      {<RevokeButton canRevoke={canUpdate} revoke={revoke} id={`revoke-${token.symbol}-${spender}`} />}
    </Form>
  )
}

export default Erc721Allowance
