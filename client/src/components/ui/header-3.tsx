'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-shadcn';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { LucideIcon } from 'lucide-react';
import {
	Sparkles,
	Search,
	FileSignature,
	GitBranch,
	CheckCircle2,
} from 'lucide-react';

type LinkItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	description?: string;
};

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
				'bg-white/95 supports-[backdrop-filter]:bg-white/50 border-gray-100 backdrop-blur-lg':
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6 lg:px-16">
				<div className="flex items-center gap-5">
					<Link href="/" className="hover:bg-orange-50 rounded-md p-2 transition-colors">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
								<span className="text-white text-lg font-bold">L</span>
							</div>
							<span className="text-xl font-bold text-gray-900">Lexora</span>
						</div>
					</Link>
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-gray-900 hover:bg-orange-50">
									Products
								</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-white p-1 pr-1.5">
									<ul className="bg-white grid w-[500px] grid-cols-2 gap-3 rounded-md border border-gray-200 p-6 shadow-xl">
										{productLinks.map((item, i) => (
											<li key={i}>
												<ListItem {...item} />
											</li>
										))}
									</ul>
									<div className="p-4 pt-2">
										<p className="text-gray-600 text-sm">
											Interested?{' '}
											<a href="#" className="text-orange-600 font-medium hover:underline">
												Schedule a demo
											</a>
										</p>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-gray-900 hover:bg-orange-50">
									Capabilities
								</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-white p-1 pr-1.5">
									<div className="w-[500px] bg-white rounded-md border border-gray-200 p-6 shadow-xl">
										<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
											All Types of Contracts
										</h3>
										<div className="grid grid-cols-2 gap-2">
											{capabilityLinks.map((item, i) => (
												<div
													key={i}
													className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600 transition-colors cursor-pointer p-2 rounded-lg hover:bg-orange-50"
												>
													<CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
													<span>{item}</span>
												</div>
											))}
										</div>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-gray-900 hover:bg-orange-50">
									Use Cases
								</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-white p-1 pr-1.5">
									<div className="w-[500px] bg-white rounded-md border border-gray-200 p-6 shadow-xl">
											<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
											How Lexora is Helping
										</h3>
										<div className="grid grid-cols-2 gap-3">
											{useCaseLinks.map((item, i) => (
												<div
													key={i}
													className="flex flex-col gap-2 p-3 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
												>
													<div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
														<CheckCircle2 className="w-4 h-4 text-orange-600" />
													</div>
													<div className="font-medium text-gray-900 text-sm">{item.title}</div>
													<p className="text-sm text-gray-600">{item.description}</p>
												</div>
											))}
										</div>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuLink className="px-4" asChild>
								<Link href="/pricing" className="hover:bg-orange-50 rounded-md p-2 text-gray-700 hover:text-gray-900 transition-colors">
									Pricing
								</Link>
							</NavigationMenuLink>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				<div className="hidden items-center gap-2 md:flex">
					<Link href="/signin">
						<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
							Sign In
						</Button>
					</Link>
					<Link href="/signup">
						<Button className="bg-orange-600 hover:bg-orange-700 text-white">
							Sign Up
						</Button>
					</Link>
				</div>
				<Button
					size="icon"
					variant="outline"
					onClick={() => setOpen(!open)}
					className="md:hidden border-gray-300"
					aria-expanded={open}
					aria-controls="mobile-menu"
					aria-label="Toggle menu"
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-2 overflow-y-auto">
				<NavigationMenu className="max-w-full">
					<div className="flex w-full flex-col gap-y-2">
						<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Product</span>
						{productLinks.map((link) => (
							<ListItem key={link.title} {...link} />
						))}
						<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-4">Capabilities</span>
						<div className="grid grid-cols-1 gap-2">
							{capabilityLinks.map((item, i) => (
								<div
									key={i}
									className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600 transition-colors cursor-pointer p-2 rounded-lg hover:bg-orange-50"
								>
									<CheckCircle2 className="w-4 h-4 text-orange-600" />
									<span>{item}</span>
								</div>
							))}
						</div>
						<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-4">Use Cases</span>
						{useCaseLinks.map((link) => (
							<ListItem key={link.title} {...link} />
						))}
					</div>
				</NavigationMenu>
				<div className="flex flex-col gap-2">
					<Link href="/signin" className="w-full">
						<Button variant="outline" className="w-full bg-transparent border-gray-300 text-gray-700">
							Sign In
						</Button>
					</Link>
					<Link href="/signup" className="w-full">
						<Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
							Sign Up
						</Button>
					</Link>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-white/95 supports-[backdrop-filter]:bg-white/50 backdrop-blur-lg',
				'fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y border-gray-100 md:hidden',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
					'size-full p-4',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

function ListItem({
	title,
	description,
	icon: Icon,
	className,
	href,
	...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
	return (
		<NavigationMenuLink
			className={cn(
				'w-full flex flex-col gap-2 p-3 rounded-lg hover:bg-orange-50 transition-colors group',
				className
			)}
			{...props}
			asChild
		>
			<Link href={href}>
				<div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors w-fit">
					<Icon className="text-orange-600 size-5" />
				</div>
				<div className="flex flex-col items-start justify-center">
					<span className="font-semibold text-gray-900">{title}</span>
					{description && <span className="text-gray-600 text-sm leading-relaxed">{description}</span>}
				</div>
			</Link>
		</NavigationMenuLink>
	);
}

const productLinks: LinkItem[] = [
	{
		title: 'ContractGen',
		href: '/dashboard',
		description: 'AI-powered contract generator that creates professional legal documents in seconds.',
		icon: Sparkles,
	},
	{
		title: 'Contract Review',
		href: '/contracts',
		description: 'Intelligent contract analysis that identifies risks and ensures compliance.',
		icon: Search,
	},
	{
		title: 'LexiSign',
		href: '/contracts',
		description: 'Secure e-signature solution with workflow automation and document tracking.',
		icon: FileSignature,
	},
	{
		title: 'Agents and Workflows',
		href: '/contracts',
		description: 'Automate contract workflows with AI agents and intelligent process automation.',
		icon: GitBranch,
	},
];

const capabilityLinks = [
	'Employment Contracts',
	'NDAs',
	'Service Agreements',
	'Partnership Agreements',
	'Vendor Contracts',
	'Licensing Agreements',
	'Lease Agreements',
	'Purchase Agreements',
	'Consulting Agreements',
	'Sales Contracts',
	'M&A Documents',
	'IP Agreements',
];

const useCaseLinks: LinkItem[] = [
	{
		title: 'Legal Teams',
		href: '#',
		description: 'Reduce contract drafting time by 80% and ensure consistency across documents.',
		icon: CheckCircle2,
	},
	{
		title: 'Startups & SMBs',
		href: '#',
		description: 'Create professional contracts without expensive legal fees, saving thousands per year.',
		icon: CheckCircle2,
	},
	{
		title: 'HR Departments',
		href: '#',
		description: 'Streamline employee onboarding with automated contract generation and e-signature workflows.',
		icon: CheckCircle2,
	},
	{
		title: 'Procurement Teams',
		href: '#',
		description: 'Accelerate vendor negotiations with AI-powered contract review and risk assessment.',
		icon: CheckCircle2,
	},
];

function useScroll(threshold: number) {
	const [scrolled, setScrolled] = React.useState(false);
	const onScroll = React.useCallback(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	React.useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [onScroll]);

	// also check on first load
	React.useEffect(() => {
		onScroll();
	}, [onScroll]);

	return scrolled;
}

