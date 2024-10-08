import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
	PlaidLinkOnSuccess,
	PlaidLinkOptions,
	usePlaidLink,
} from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import {
	createLinkToken,
	exchangePublicToken,
} from '@/lib/actions/user.actions'
import Image from 'next/image'

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
	const router = useRouter()
	const [token, setToken] = useState('')

	useEffect(() => {
		const getLinkToken = async () => {
			const data = await createLinkToken(user)
			setToken(data?.linkToken)
		}
		getLinkToken()
	}, [user])

	const onSuccess = useCallback<PlaidLinkOnSuccess>(
		async (public_token: string) => {
			await exchangePublicToken({
				publicToken: public_token,
				user,
			})
			router.push('/')
		},
		[user]
	)

	const config: PlaidLinkOptions = {
		token,
		onSuccess,
	}

	const { open, ready } = usePlaidLink(config)

	return (
		<>
			{variant === 'primary' ? (
				<Button
					className='plaidlink-primary'
					onClick={() => open()}
					disabled={!ready}
				>
					Connect Bank
				</Button>
			) : variant === 'ghost' ? (
				<Button
					className='plaidlink-ghost'
					variant='ghost'
					onClick={() => open()}
				>
					<Image
						src='/icons/connect-bank.svg'
						width={24}
						height={24}
						alt='connect bank'
					/>
					<p className='hidden text-[16px] font-semibold text-black-2 xl:block'>
						Connect Bank
					</p>
				</Button>
			) : variant === 'right-side' ? (
				<Button className='flex gap-2' variant='ghost' onClick={() => open()}>
					<Image src='/icons/plus.svg' width={20} height={20} alt='plus' />
					<h2 className='text-14 font-semibold text-gray-600'>Add Bank</h2>
				</Button>
			) : (
				<Button className='plaidlink-default ' onClick={() => open()}>
					<Image
						src='/icons/connect-bank.svg'
						width={24}
						height={24}
						alt='connect bank'
					/>
					<p className='hidden text-[16px] font-semibold text-black-2 xl:block'>
						Connect Bank
					</p>
				</Button>
			)}
		</>
	)
}

export default PlaidLink
