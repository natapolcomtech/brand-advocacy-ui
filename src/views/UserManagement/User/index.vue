<template>
	<div>
		<h1>User</h1>
		<div class="mb-6 mt-4 flex flex-col md:flex-row justify-between gap-4">
			<n-input  type="text" placeholder="Search" size="large" :on-update:value="handleSearch" class="md:!w-[260px]">
				<template #suffix>
					<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
				</template>
			</n-input>
			<n-button @click="handleCreateUser" type="primary" size="large">
				<template #icon>
					<Icon icon="icons8:plus" />
				</template>
				Create User
			</n-button>
		</div>

		<n-data-table
			:row-key="rowKey"
			:columns="column"
			:data="userManagementStore.users.data"
		/>
		<n-pagination
			:item-count="itemCount"
			:page-sizes="PAGE_SIZES"
			show-size-picker
			v-model:page="pagination.page"
			v-model:page-size="pagination.limit"
			class="justify-center mt-4"
		>
			<template #prefix="{ itemCount, startIndex }">
				<div class="hidden md:block">({{ startIndex + 1 }} - {{ paginateCount }}) Of {{ itemCount }} items</div>
			</template>
		</n-pagination>
		<n-modal
			v-if="isModalManagement.event !== MODAL_TYPE.PERMISSION"
			v-model:show="isModalManagement.value"
			preset="card"
			:bordered="false"
			size="huge"
			aria-modal="false"
			:style="{
				width: '600px'
			}"
			:title="titleModal"
		>
			<n-form ref="formRef" :model="dataUser" :disabled="isModalManagement.event === 'view'" :rules="rules">
				<n-form-item label="Email" path="email">
					<n-input v-model:value="dataUser.email" size="large" />
				</n-form-item>
				<n-form-item label="Username" path="username">
					<n-input v-model:value="dataUser.username" size="large" />
				</n-form-item>
				<n-form-item label="Password" path="password">
					<n-input
						v-model:value="dataUser.password"
						size="large"
						type="password"
						show-password-on="click"
						placeholder="********"
					/>
				</n-form-item>
				<n-form-item label="First Name" path="firstname">
					<n-input v-model:value="dataUser.firstname" size="large" />
				</n-form-item>
				<n-form-item label="Last Name" path="lastname">
					<n-input v-model:value="dataUser.lastname" size="large" />
				</n-form-item>
				<n-form-item label="Role" path="role_id">
					<n-select v-model:value="dataUser.role_id" :options="optionsRoles" size="large" />
				</n-form-item>
			</n-form>
			<template #footer>
				<n-space justify="end">
					<n-button type="default" size="large" @click="handleCancelUser">Cancel</n-button>
					<n-button
						type="primary"
						size="large"
						v-if="isModalManagement.event === 'edit'"
						@click="handleSubmitUser"
					>
						Save
					</n-button>
					<n-button
						type="primary"
						size="large"
						v-if="isModalManagement.event === 'create'"
						@click="handleSubmitUser"
					>
						Create
					</n-button>
				</n-space>
			</template>
		</n-modal>

		<n-modal
			v-if="isModalManagement.event == MODAL_TYPE.PERMISSION"
			v-model:show="isModalManagement.value"
			:mask-closable="false"
			preset="dialog"
			style="width: 1400px"
		>
			<template #header>
				<h3>{{ dataUser.name }}</h3>
			</template>
			<div class="grid gap-4 py-4">
				<h3 class="text-[#1A4393] font-medium text-lg">Permissions</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<n-card size="medium" v-for="capability in capabilitys" :key="capability.name">
						<template #header>
							<div class="flex justify-between">
								<p class="text-[#3B82F6] font-medium text-base">{{ capability.name }}</p>
							</div>
						</template>
						<n-grid :y-gap="8" :cols="1">
							<n-gi v-for="item in capability.item" :key="item.id">
								<n-checkbox
									:checked="isCheckedValue(item)"
									:value="item.id"
									:label="item.capability_code"
									:on-update:checked="checked => onChangeCheckbox(checked, item)"
								/>
							</n-gi>
						</n-grid>
					</n-card>
				</div>
				<n-space justify="end">
					<n-button @click="isModalManagement.value = false">Cancel</n-button>
					<n-button
						type="primary"
						@click="submitSaveEditRole"
						v-if="isModalManagement.event === MODAL_TYPE.PERMISSION"
					>
						Save
					</n-button>
				</n-space>
			</div>
		</n-modal>
	</div>
</template>

<script lang="ts">
import { defineComponent, h, ref, computed, watch, onMounted, reactive } from "vue"
import {
	NDataTable,
	NModal,
	NPagination,
	NInput,
	NSpace,
	NSelect,
	NButton,
	NForm,
	NFormItem,
	NGrid,
	NGi,
	NCard,
	NCheckbox,
	NAvatar
} from "naive-ui"

import { Icon } from "@iconify/vue"

import type { User } from "@/types/userManagementApi"
import type { DataTableColumns } from "naive-ui"
import { useUserManagementStore } from "@/stores/userManagementStore"
import { useMasterDataStore } from "@/stores/useMasterDataStore"
import type { FormInst, FormRules } from "naive-ui"
import { useDialog } from "naive-ui"
import _ from "lodash"
import { PAGE_SIZES } from "@/components/utils/constants"
interface RowData {
	id: number
}
export enum MODAL_TYPE {
	CREATE = "create",
	VIEW = "view",
	EDIT = "edit",
	PERMISSION = "permission",
	RANDOM = "random",
	CANDIDATE = "candidate",
	FACEBOOK = "facebook",
	LINE = "line",
	TEAM = "team",
}

export default defineComponent({
	name: "User",
	components: {
		NDataTable,
		NModal,
		NPagination,
		NInput,
		NSpace,
		NSelect,
		NButton,
		Icon,
		NForm,
		NFormItem,
		NGrid,
		NGi,
		NCheckbox,
		NCard
	},
	setup() {
		const userManagementStore = useUserManagementStore()
		const masterDataStore = useMasterDataStore()
		const formRef = ref<FormInst | null>(null)
		const capabilitys = ref<any>([])
		const dialog = useDialog()
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.CREATE
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.CREATE:
					return "Create User"
				case MODAL_TYPE.VIEW:
					return "View User"
				case MODAL_TYPE.EDIT:
					return "Edit User"
				case MODAL_TYPE.PERMISSION:
					return "Permission"
				default:
					return ""
			}
		})
		const pagination = reactive({
			page: 1,
			limit: 10,
		})
		const filterApi = reactive({
			filter: ""
		})
		const pageCount = computed(() => {
			const pageTotal = Math.ceil((userManagementStore?.users?.total || 0) / pagination.limit)
			return pageTotal
		})
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = userManagementStore?.users?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return userManagementStore?.users?.total || 0
		})
		const defaultValue = {
			id: null,
			email: "",
			username: "",
			password: "",
			firstname: "",
			lastname: "",
			role_id: null,
			name: "",
			user_capabilitys: []
		}
		const dataUser = reactive({ ...defaultValue })
		onMounted(async () => {
			await userManagementStore.getUsers(pagination)
			await masterDataStore.getRole()
			await masterDataStore.getCapability()
			capabilitys.value = [...masterDataStore.capability]
		})
		const optionsRoles = computed(() => {
			const roles = masterDataStore?.roles || []
			const createOptionRoles = roles.map((item: any) => {
				return {
					label: item.role_name,
					value: item.id
				}
			})
			return createOptionRoles
		})
		function handleCreateUser(e: MouseEvent) {
			e.preventDefault()
			Object.assign(dataUser, defaultValue)
			isModalManagement.value = true
			isModalManagement.event = MODAL_TYPE.CREATE
		}
		function handleCancelUser(e: MouseEvent) {
			e.preventDefault()
			Object.assign(dataUser, defaultValue)
			isModalManagement.value = false
		}
		function handleSubmitUser(e: MouseEvent) {
			e.preventDefault()
			formRef.value?.validate(async errors => {
				if (!errors) {
					switch (isModalManagement.event) {
						case MODAL_TYPE.CREATE:
							await userManagementStore.createUser(dataUser, pagination)
							break
						case MODAL_TYPE.EDIT:
							await userManagementStore.updateUser(dataUser, pagination)
							break
						default:
							break
					}
					handleCancelUser(e)
				} else {
					console.error(errors)
				}
			})
		}

		watch(pagination, async value => {
			/// Call API
			await userManagementStore.getUsers({ ...value, ...filterApi })
		})
		watch(filterApi, async value => {
			pagination.page = 1
			/// Call API
			await userManagementStore.getUsers({ ...pagination, ...value })
		})
		function createColumns(): DataTableColumns<User> {
			return [
				{
					title: "No.",
					key: "no",
					width: "50px",
					className: " whitespace-nowrap",
					render(row, index) {
						return h("div", pagination.limit * (pagination.page - 1) + index + 1)
					},
					align: "center"
				},
				{
					title: "Name",
					key: "name",
					width: "350px",
					className: " whitespace-nowrap truncate ",
					render(row) {
						return h("div", { className: "flex gap-2" }, [
							h(
								NAvatar,
								{
									style: {
										color: "white",
										backgroundColor: "skyblue",
										borderRadius: "100%"
									}
								},
								row.firstname[0].toUpperCase()
							),
							h("div",  [
								h("div", `${row.firstname}  ${row.lastname}`),
								h("div", { className: "!text-xs mt-1" }, row.email)
							])
						])
					}
				},
				{
					title: "Team",
					key: "teams",
					width: "350px",
					align: "center"
				},
				{
					title: "Role",
					key: "role_name",
					align: "center",
					width: "250px"
				},
				{
					title: "Action",
					key: "action",
					className: "!text-center",
					render(row) {
						return h("div", { class: "flex gap-x-2 justify-center" }, [
							h(Icon, {
								icon: "mdi:eye-outline",
								class: " cursor-pointer w-6 h-6",
								onClick: async (e: MouseEvent) => {
									e.preventDefault()
									await userManagementStore.getUserById(row.id)
									const { email, username, password, firstname, lastname, role_id, id } =
										userManagementStore.user
									Object.assign(dataUser, {
										email,
										username,
										password,
										firstname,
										lastname,
										role_id,
										id
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.VIEW
								}
							}),
							h(Icon, {
								icon: "flowbite:edit-outline",
								class: " cursor-pointer w-6 h-6",
								onClick: async (e: MouseEvent) => {
									e.preventDefault()
									await userManagementStore.getUserById(row.id)
									const { email, username, password, firstname, lastname, role_id, id } =
										userManagementStore.user
									Object.assign(dataUser, {
										email,
										username,
										password,
										firstname,
										lastname,
										role_id,
										id
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.EDIT
								}
							}),
							h(Icon, {
								icon: "mdi:shield-key-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async (e: MouseEvent) => {
									e.preventDefault()
									await userManagementStore.getUserById(row.id)
									const { email, username, password, firstname, lastname, role_id, id } =
										userManagementStore.user
									Object.assign(dataUser, {
										email,
										username,
										password,
										firstname,
										lastname,
										role_id,
										id,
										name: `${firstname} ${lastname}`,
										user_capabilitys: userManagementStore.user.user_capabilitys
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.PERMISSION
								}
							}),
							h(Icon, {
								icon: "tabler:trash",
								class: " cursor-pointer w-6 h-6",
								onClick: () => {
									dialog.warning({
										title: "ยืนยันการลบข้อมูล",
										content: `ข้อมูลที่ลบจะไม่สามารถกู้คืนได้ คุณแน่ใจที่จะลบข้อมูลผู้ใช้ ${row.firstname}  ${row.lastname} หรือไม่ ?`,
										positiveText: "แน่ใจ",
										negativeText: "ยกเลิก",
										onPositiveClick: async () => {
											await userManagementStore.deleteUserById(row.id, pagination)
										},
										onNegativeClick: () => {
											// message.error("Not Sure")
										}
									})
								}
							})
						])
					}
				}
			]
		}
		const column = createColumns()

		function isCheckedValue(item: any) {
			const isHaveItem = dataUser.user_capabilitys.find((i: any) => i.capability_id === item.id) as any
			return isHaveItem ? isHaveItem.is_active === 1 : false
		}
		function onChangeCheckbox(checked: boolean, item: any) {
			const isHaveItem = dataUser.user_capabilitys.find((i: any) => i.capability_id === item.id)

			if (!isHaveItem) {
				(dataUser.user_capabilitys as any).push({ capability_id: item.id, is_delete: 0, is_active: 1 } as any)
			} else {
				const index = dataUser.user_capabilitys.findIndex((capability: any) => {
					return capability.capability_id === item.id
				})

				if (index > -1) {
					(dataUser.user_capabilitys[index] as any).is_active = checked ? 1 : 0;
					(dataUser.user_capabilitys[index] as any).is_delete = checked ? 0 : 1;
				}
			}
		}
		async function submitSaveEditRole(e: MouseEvent) {
			e.preventDefault()
			pagination.page = 1
			const mappingUpdateCapability = {
				user_id: dataUser.id,
				capabilitys: dataUser.user_capabilitys.map((item: any) => {
					return {
						capability_id: item.capability_id,
						is_active: item.is_active,
						is_delete: item.is_delete
					}
				})
			}
			await userManagementStore.updateUserCapability(mappingUpdateCapability, pagination)
			Object.assign(dataUser, { ...defaultValue })
			isModalManagement.value = false
		}

		const rules: FormRules = {
			email: {
				type: "email",
				required: true,
				trigger: ["blur", "input"],
				message: "Please input Email"
			},
			username: {
				required: true,
				trigger: ["blur", "input"],
				message: "Please input Username"
			},
			firstname: {
				required: true,
				trigger: ["blur", "input"],
				message: "Please input First Name"
			},
			lastname: {
				required: true,
				trigger: ["blur", "input"],
				message: "Please input Last Name"
			},
			role_id: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please select role_id",
				type: "number"
			},
			password: {
				required: true,
				trigger: ["blur", "input"],
				message: "Please input Password",
				max: 16,
				min:8,
			}
		}

		const handleSearch = _.debounce((value: string) => {
			filterApi.filter = value
		}, 500)


		return {
			rowKey: (row: RowData) => row.id,
			PAGE_SIZES,
			pagination,
			pageCount,
			itemCount,
			userManagementStore,
			column,
			masterDataStore,
			optionsRoles,
			dataUser,
			handleCreateUser,
			handleCancelUser,
			handleSubmitUser,
			isModalManagement,
			titleModal,
			rules,
			formRef,
			capabilitys,
			isCheckedValue,
			onChangeCheckbox,
			submitSaveEditRole,
			MODAL_TYPE,
			paginateCount,
			handleSearch
		}
	}
})
</script>

<style scoped>
label {
	color: rgb(107, 114, 128);
}
</style>
