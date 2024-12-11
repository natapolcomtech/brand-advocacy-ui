import { renderIcon } from "@/utils"
import { h } from "vue"
import { RouterLink } from "vue-router"
import { type MenuMixedOption } from "naive-ui/es/menu/src/interface"
import BookIcon from "@/assets/jsx-icon/BookIcon.vue"
import CategoryIcon from "@/assets/jsx-icon/CategoryIcon.vue"
import MessageIcon from "@/assets/jsx-icon/MessageIcon.vue"
import UserIcon from "@/assets/jsx-icon/UserIcon.vue"
import EditIcon from "@/assets/jsx-icon/EditIcon.vue"

const BlankIcon = "carbon:document-blank"

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function getItems(mode: "vertical" | "horizontal", collapsed: boolean): MenuMixedOption[] {
	return [
		{
			label: () =>
				h(
					RouterLink,
					{
						to: {
							name: "dashboard"
						}
					},
					{ default: () => "Dashboard" }
				),
			key: "dashboard",
			icon: renderIcon(CategoryIcon)
		},
		{
			label: 'BA Application',
			key: 'ba-app',
			icon: renderIcon(BookIcon),
			children: [
				{
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "candidate"
								}
							},
							{ default: () => "Candidate" }
						),
					key: "candidate",
				},
				{
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "workspace"
								}
							},
							{ default: () => "Workspace" }
						),
					key: "workspace",
				},
				{
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "ba"
								}
							},
							{ default: () => "BA" }
						),
					key: "ba",
				},
				{
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "payment-history"
								}
							},
							{ default: () => "Payment History" }
						),
					key: "payment-history",
				},
			]
		},
		{
			label: () =>
				h(
					RouterLink,
					{
						to: {
							name: "incident-management"
						}
					},
					{ default: () => "Incident Management" }
				),
			key: "incident-management",
			icon: renderIcon(MessageIcon)
		},
		{
			label: 'User Management',
			key: 'user-management',
			icon: renderIcon(UserIcon),
			children: [
				{
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "user-management-user"
								}
							},
							{ default: () => "User" }
						),
					key: "user-management-user",
				},
				{
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "team"
								}
							},
							{ default: () => "Team" }
						),
					key: "team",
				},
				{
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "role"
								}
							},
							{ default: () => "Role" }
						),
					key: "role",
				},
			]
		},
		{
			label: () =>
				h(
					RouterLink,
					{
						to: {
							name: "system-master-data"
						}
					},
					{ default: () => "System Master Data" }
				),
			key: "system-master-data",
			icon: renderIcon(EditIcon)
		},
		
	]
}
