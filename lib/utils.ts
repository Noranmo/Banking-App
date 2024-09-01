/* eslint-disable no-prototype-builtins */
import Category from '@/components/Category'
import { type ClassValue, clsx } from 'clsx'
import qs from 'query-string'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
	const dateTimeOptions: Intl.DateTimeFormatOptions = {
		weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
		month: 'short', // abbreviated month name (e.g., 'Oct')
		day: 'numeric', // numeric day of the month (e.g., '25')
		hour: 'numeric', // numeric hour (e.g., '8')
		minute: 'numeric', // numeric minute (e.g., '30')
		hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
	}

	const dateDayOptions: Intl.DateTimeFormatOptions = {
		weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
		year: 'numeric', // numeric year (e.g., '2023')
		month: '2-digit', // abbreviated month name (e.g., 'Oct')
		day: '2-digit', // numeric day of the month (e.g., '25')
	}

	const dateOptions: Intl.DateTimeFormatOptions = {
		month: 'short', // abbreviated month name (e.g., 'Oct')
		year: 'numeric', // numeric year (e.g., '2023')
		day: 'numeric', // numeric day of the month (e.g., '25')
	}

	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: 'numeric', // numeric hour (e.g., '8')
		minute: 'numeric', // numeric minute (e.g., '30')
		hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
	}

	const formattedDateTime: string = new Date(dateString).toLocaleString(
		'en-US',
		dateTimeOptions
	)

	const formattedDateDay: string = new Date(dateString).toLocaleString(
		'en-US',
		dateDayOptions
	)

	const formattedDate: string = new Date(dateString).toLocaleString(
		'en-US',
		dateOptions
	)

	const formattedTime: string = new Date(dateString).toLocaleString(
		'en-US',
		timeOptions
	)

	return {
		dateTime: formattedDateTime,
		dateDay: formattedDateDay,
		dateOnly: formattedDate,
		timeOnly: formattedTime,
	}
}

export function formatAmount(amount: number): string {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
	})

	return formatter.format(amount)
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value))

export const removeSpecialCharacters = (value: string) => {
	if (!value) return
	return value.replace(/[^\w\s]/gi, '')
}

interface UrlQueryParams {
	params: string
	key: string
	value: string
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
	const currentUrl = qs.parse(params)

	currentUrl[key] = value

	return qs.stringifyUrl(
		{
			url: window.location.pathname,
			query: currentUrl,
		},
		{ skipNull: true }
	)
}

export function getAccountTypeColors(type: AccountTypes) {
	switch (type) {
		case 'depository':
			return {
				bg: 'bg-blue-25',
				lightBg: 'bg-blue-100',
				title: 'text-blue-900',
				subText: 'text-blue-700',
			}

		case 'credit':
			return {
				bg: 'bg-success-25',
				lightBg: 'bg-success-100',
				title: 'text-success-900',
				subText: 'text-success-700',
			}

		default:
			return {
				bg: 'bg-green-25',
				lightBg: 'bg-green-100',
				title: 'text-green-900',
				subText: 'text-green-700',
			}
	}
}

export function getCategoryStats(transactions: Transaction[]): CategoryStats[] {
	const categoryData: {
		[category: string]: { count: number; totalAmount: number }
	} = {}
	let totalCount = 0

	// Iterate over each transaction
	transactions.forEach(transaction => {
		const category = transaction.category || 'Uncategorized' // Use 'Uncategorized' for undefined categories
		const amount = transaction.amount

		// Initialize category data if not present
		if (!categoryData[category]) {
			categoryData[category] = { count: 0, totalAmount: 0 }
		}

		// Update count and total amount for the category
		categoryData[category].count += 1
		categoryData[category].totalAmount += isNaN(amount) ? 0 : amount

		// Increment total transaction count
		totalCount++
	})

	// Convert the category data to an array of CategoryStats objects
	const aggregatedCategories: CategoryStats[] = Object.keys(categoryData).map(
		category => ({
			name: category,
			count: categoryData[category].count,
			totalAmount: categoryData[category].totalAmount,
			totalCount,
		})
	)

	// Sort the aggregatedCategories array by totalAmount in descending order
	aggregatedCategories.sort((a, b) => b.totalAmount - a.totalAmount)

	return aggregatedCategories
}

function countTransactionCategories(
	transactions: Transaction[]
): CategoryCount[] {
	const categoryCounts: {
		[category: string]: number
	} = {}
	let totalCount = 0

	// Iterate over each transaction
	transactions &&
		transactions.forEach(transaction => {
			// Extract the category from the transaction
			const category = transaction.category
			const amount = transaction.amount
			// console.log(
			// 	'This is transaction category ',
			// 	category,
			// 	'and amount: ',
			// 	amount
			// )

			// If the category exists in the categoryCounts object, increment its count
			if (categoryCounts.hasOwnProperty(category)) {
				categoryCounts[category]++
			} else {
				// Otherwise, initialize the count to 1
				categoryCounts[category] = 1
			}
			// Increment total count
			totalCount++
		})

	// Convert the categoryCounts object to an array of objects
	const aggregatedCategories: CategoryCount[] = Object.keys(categoryCounts).map(
		category => ({
			name: category,
			count: categoryCounts[category],
			totalCount,
		})
	)

	// Sort the aggregatedCategories array by count in descending order
	aggregatedCategories.sort((a, b) => b.count - a.count)

	return aggregatedCategories
}

const groupAmountsByCategory = (transactions: Transaction[]) => {
	const categorySums = transactions.reduce<{ [category: string]: number }>(
		// if you want to see all amounts by each section change the :number to :number[]
		(acc, transaction) => {
			const category = transaction.category || 'Uncategorized'
			const { amount } = transaction
			// Initialize the category array if it doesn't exist
			if (!acc[category]) {
				// acc[category] = []
				acc[category] = 0
			}

			// Push the amount into the appropriate category array
			// acc[category].push(amount)

			// Add the amount to the appropriate category sum
			acc[category] += amount

			return acc
		},
		{}
	)
	// Convert the category sums object to an array of CategorySum objects
	const aggregatedCategories: CategorySum[] = Object.keys(categorySums).map(
		category => ({
			name: category,
			totalAmount: categorySums[category],
		})
	)

	return aggregatedCategories
}
// Function to group amounts by category and calculate the sum
const calculateSumsByCategory = (transactions: Transaction[]) => {
	// Reduce the transactions to an object with category as keys and sums as values
	const categorySums = transactions.reduce<{ [category: string]: number }>(
		(acc, transaction) => {
			// Use 'Uncategorized' for transactions without a category
			const category = transaction.category || 'Uncategorized'
			const { amount } = transaction

			// Initialize the category sum if it doesn't exist
			if (!acc[category]) {
				acc[category] = 0
			}

			// Add the amount to the appropriate category sum
			acc[category] += amount

			return acc
		},
		{}
	)

	// Convert the category sums object to an array of CategorySum objects
	const aggregatedCategories: CategorySum[] = Object.keys(categorySums).map(
		category => ({
			name: category,
			totalAmount: categorySums[category],
		})
	)

	return aggregatedCategories
}

export function extractCustomerIdFromUrl(url: string) {
	// Split the URL string by '/'
	const parts = url.split('/')

	// Extract the last part, which represents the customer ID
	const customerId = parts[parts.length - 1]

	return customerId
}

export function encryptId(id: string) {
	return btoa(id)
}

export function decryptId(id: string) {
	return atob(id)
}

export const getTransactionStatus = (date: Date) => {
	const today = new Date()
	const twoDaysAgo = new Date(today)
	twoDaysAgo.setDate(today.getDate() - 2)

	return date > twoDaysAgo ? 'Processing' : 'Success'
}

export const authFormSchema = (type: string) =>
	z.object({
		// both
		email: z.string().email(),
		password: z.string().min(8),
		// sign up
		firstName: type === 'sign-in' ? z.string().optional() : z.string().min(3),
		lastName: type === 'sign-in' ? z.string().optional() : z.string().min(3),
		address1: type === 'sign-in' ? z.string().optional() : z.string().max(50),
		city: type === 'sign-in' ? z.string().optional() : z.string().max(50),
		state:
			type === 'sign-in' ? z.string().optional() : z.string().min(2).max(2),
		postalCode:
			type === 'sign-in' ? z.string().optional() : z.string().min(3).max(6),
		dateOfBirth: type === 'sign-in' ? z.string().optional() : z.string().min(3),
		ssn: type === 'sign-in' ? z.string().optional() : z.string().min(3),
	})
